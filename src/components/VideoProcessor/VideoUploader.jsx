import React, { useState } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Paper,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Upload as UploadIcon, Info as InfoIcon } from '@mui/icons-material';
import ProcessingStatus from './ProcessingStatus';
import ResultsViewer from './ResultsViewer';
import { processVideo } from '../../utils/api';

const VideoUploader = () => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultVideo, setResultVideo] = useState(null);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    if (selectedFile.size > 500 * 1024 * 1024) {
      setError('File size exceeds 500MB limit');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    setResultVideo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a video file first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    try {
      const response = await processVideo(
        file, 
        (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      );

      const videoUrl = URL.createObjectURL(response.data);
      setResultVideo(videoUrl);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <Typography variant="h5" component="h2">
          PPE Detection Analyzer
        </Typography>
        <Tooltip title="Upload videos to detect safety equipment">
          <IconButton onClick={() => setShowInfo(!showInfo)} size="small">
            <InfoIcon color="primary" />
          </IconButton>
        </Tooltip>
      </Stack>

      {showInfo && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Upload videos (MP4, AVI, MOV) up to 500MB. The system will analyze for 
          personal protective equipment like hard hats, safety vests, and gloves.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
          sx={{ mb: 2 }}
          disabled={isProcessing}
        >
          Select Video
          <input 
            type="file" 
            hidden 
            accept="video/mp4,video/x-m4v,video/avi,video/x-msvideo,video/*" 
            onChange={handleFileChange}
          />
        </Button>
        
        {file && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Selected: <strong>{file.name}</strong> ({Math.round(file.size / (1024 * 1024))}MB)
          </Typography>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {isProcessing ? (
          <ProcessingStatus progress={progress} />
        ) : (
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!file}
            fullWidth
            size="large"
            sx={{ mt: 2 }}
          >
            Analyze Video
          </Button>
        )}
      </Box>
      
      {resultVideo && (
        <ResultsViewer videoUrl={resultVideo} filename={file?.name} />
      )}
    </Paper>
  );
};

export default VideoUploader;