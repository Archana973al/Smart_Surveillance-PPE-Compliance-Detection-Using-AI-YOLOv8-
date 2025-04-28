import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  Alert,
  Stack,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Download as DownloadIcon, 
  TaskAlt as SuccessIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const ResultsViewer = ({ videoUrl, filename }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoKey, setVideoKey] = useState(0); // Force re-render on retry

  const handleDownload = () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = filename || `processed_${Date.now()}.mp4`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        setIsLoading(false);
      }, 100);

    } catch (err) {
      setError('Failed to download video. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setVideoKey(prev => prev + 1); // Force video element to re-render
    setError(null);
  };

  // Auto-download when results are ready
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDownload();
    }, 500); // Small delay to ensure component is mounted

    return () => clearTimeout(timer);
  }, [videoUrl]); // Only run when videoUrl changes

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Processing Results
      </Typography>

      {error ? (
        <Alert 
          severity="error" 
          icon={<ErrorIcon />}
          sx={{ mb: 2 }}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={handleRetry}
            >
              <RefreshIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      ) : (
        <Alert severity="success" icon={<SuccessIcon />} sx={{ mb: 2 }}>
          Processing complete! Your video has been downloaded automatically.
        </Alert>
      )}

      <Typography variant="subtitle1" gutterBottom>
        Video Preview
      </Typography>
      
      <Box sx={{ 
        position: 'relative',
        borderRadius: '4px',
        overflow: 'hidden',
        mb: 2
      }}>
        {isLoading && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1
          }}>
            <CircularProgress color="secondary" />
          </Box>
        )}
        
        <video 
          key={videoKey}
          controls
          src={videoUrl}
          style={{ 
            width: '100%',
            maxHeight: '500px',
            display: 'block'
          }}
          onLoadedData={() => setIsLoading(false)}
          onError={() => {
            setError('Failed to load video preview');
            setIsLoading(false);
          }}
        />
      </Box>

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={handleDownload}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
        >
          {isLoading ? 'Downloading...' : 'Download Again'}
        </Button>
        
        <Tooltip title="Refresh preview">
          <Button
            variant="outlined"
            onClick={handleRetry}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Tooltip>
      </Stack>
    </Paper>
  );
};

export default ResultsViewer;