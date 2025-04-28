# -*- coding: utf-8 -*-
import torch
import os
import glob
from ultralytics import YOLO
import time
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from typing import Optional
import uuid
import shutil
from fastapi.middleware.cors import CORSMiddleware
import socket
from contextlib import closing
import uvicorn

# =============================================
# CONFIGURATION
# =============================================
PRETRAINED_WEIGHTS = "./weights/best.pt"  # Path to your .pt weights file
CONFIDENCE_THRESHOLD = 0.25               # Detection threshold
UPLOAD_FOLDER = "./uploads"               # Folder to store uploaded videos
MAX_FILE_SIZE = 500 * 1024 * 1024         # 500MB max file size

# =============================================
# SETUP (FORCE CPU USAGE)
# =============================================
torch.cuda.is_available = lambda: False
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
print(f"Running on CPU: {not torch.cuda.is_available()}")

# =============================================
# FASTAPI APP SETUP
# =============================================
app = FastAPI(
    title="PPE Detection API",
    description="API for processing videos with YOLO PPE detection model",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# =============================================
# HELPER FUNCTIONS
# =============================================
def get_latest_output_video():
    """Find the latest processed video in the output directory"""
    base_output_dir = os.path.join("runs", "detect")
    predict_folders = sorted(
        glob.glob(os.path.join(base_output_dir, "predict*")),
        key=os.path.getmtime,
        reverse=True
    )
    
    if not predict_folders:
        return None
    
    latest_predict = predict_folders[0]
    video_files = glob.glob(os.path.join(latest_predict, "*.*"))
    
    # Filter for video files
    video_extensions = ('.mp4', '.avi', '.mov', '.mkv')
    video_files = [f for f in video_files if f.lower().endswith(video_extensions)]
    
    if not video_files:
        return None
    
    # Return the first video file found (should be only one)
    return video_files[0]

def cleanup_old_files(directory, max_age_seconds=3600):
    """Clean up files older than max_age_seconds"""
    now = time.time()
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        if os.path.isfile(file_path):
            file_age = now - os.path.getmtime(file_path)
            if file_age > max_age_seconds:
                os.remove(file_path)
                print(f"Cleaned up old file: {file_path}")

# =============================================
# VIDEO PROCESSING FUNCTION
# =============================================
def process_video(video_path: str) -> Optional[str]:
    """Process a video file with YOLO model"""
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found at {video_path}")

    print(f"\n📽️ Processing video: {video_path}")
    start_time = time.time()

    try:
        # Load YOLO model
        model = YOLO(PRETRAINED_WEIGHTS)

        # Run detection
        results = model.predict(
            source=video_path,
            conf=CONFIDENCE_THRESHOLD,
            save=True,
            device='cpu'
        )

        # Get the output video path
        output_video_path = get_latest_output_video()

        if output_video_path:
            processing_time = time.time() - start_time
            print(f"\n✅ Video processing complete!")
            print(f"🕒 Time taken: {processing_time:.2f} seconds")
            print(f"📁 Output saved to: {output_video_path}")
            return output_video_path
        else:
            print("\n⚠️ Video processed but output file not found")
            return None

    except Exception as e:
        print(f"\n❌ Error processing video: {str(e)}")
        raise

# =============================================
# API ENDPOINTS
# =============================================
@app.post("/api/process-video")
async def upload_and_process_video(file: UploadFile = File(...)):
    """Endpoint to upload and process a video file"""
    # Validate file size
    file_size = 0
    for chunk in file.file:
        file_size += len(chunk)
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large (max 500MB)")
    
    # Reset file pointer
    file.file.seek(0)
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    if file_ext.lower() not in ('.mp4', '.avi', '.mov', '.mkv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Only video files are accepted.")
    
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    upload_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    
    try:
        # Save uploaded file
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process the video
        output_path = process_video(upload_path)
        
        if not output_path:
            raise HTTPException(status_code=500, detail="Video processing failed")
        
        # Clean up old files
        cleanup_old_files(UPLOAD_FOLDER)
        
        # Return the processed video
        return FileResponse(
            output_path,
            media_type="video/mp4",
            filename=f"processed_{file.filename}"
        )
    
    except Exception as e:
        # Clean up if something went wrong
        if os.path.exists(upload_path):
            os.remove(upload_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_status():
    """Endpoint to check API status"""
    return JSONResponse(
        content={
            "status": "running",
            "model": "YOLO PPE Detection",
            "device": "CPU" if not torch.cuda.is_available() else "GPU",
            "confidence_threshold": CONFIDENCE_THRESHOLD
        }
    )

# =============================================
# MAIN EXECUTION
# =============================================
def check_port(port):
    """Check if a port is available"""
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
        return sock.connect_ex(('localhost', port)) != 0

if __name__ == "__main__":
    PORT = 8000
    
    # Check port availability
    if not check_port(PORT):
        print(f"❌ Port {PORT} is already in use!")
        print("Try these solutions:")
        print(f"1. Change the port number to something else (e.g., 8001)")
        print(f"2. Find and kill the process using port {PORT}:")
        print(f"   On Windows: netstat -ano | findstr {PORT}")
        print(f"   On Mac/Linux: lsof -i :{PORT}")
        print(f"3. Wait a minute and try again")
        exit(1)
    
    print("🔍 PPE Detection API Server")
    print("--------------------------------")
    print("Available endpoints:")
    print(f"• API status: http://localhost:{PORT}/api/status")
    print(f"• Documentation: http://localhost:{PORT}/docs")
    print(f"• Video processing: http://localhost:{PORT}/api/process-video")
    print("\nStarting server...")
    
    try:
        # Run with reload disabled initially for better debugging
        uvicorn.run("__main__:app", host="0.0.0.0", port=PORT, reload=False)
    except Exception as e:
        print(f"\n❌ Failed to start server: {str(e)}")
        print("\nTroubleshooting tips:")
        print("1. Make sure all dependencies are installed:")
        print("   pip install fastapi uvicorn python-multipart torch ultralytics")
        print("2. Check your weights file exists at:", PRETRAINED_WEIGHTS)
        print("3. Try running with:")
        print(f"   uvicorn __main__:app --host 0.0.0.0 --port {PORT}")
        print("4. Check for syntax errors in your code")