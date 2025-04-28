import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minute timeout for large videos
});

export const processVideo = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_BASE_URL}/process-video`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
    responseType: 'blob', // Ensure this is set to blob
    timeout: 300000 // 5 minute timeout
  });

  // Create a proper filename with extension
  const contentDisposition = response.headers['content-disposition'];
  let filename = 'processed_video.mp4';
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?(.+)"?/);
    if (match) filename = match[1];
  }

  return {
    data: response.data,
    filename: filename
  };
};