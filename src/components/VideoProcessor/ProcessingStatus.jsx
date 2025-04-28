import { Box, Typography, LinearProgress, Alert } from '@mui/material';
import { HourglassBottom as HourglassIcon } from '@mui/icons-material';

const ProcessingStatus = ({ progress }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Alert 
        icon={<HourglassIcon fontSize="inherit" />}
        severity="info"
        sx={{ mb: 2 }}
      >
        Analyzing video - this may take a few minutes
      </Alert>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {progress}%
        </Typography>
      </Box>
    </Box>
  );
};

export default ProcessingStatus;