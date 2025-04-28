import { Container, Typography, Paper, Link } from '@mui/material';

const About = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          About PPE Detection System
        </Typography>
        <Typography paragraph>
          This application uses advanced computer vision to detect Personal Protective Equipment (PPE) 
          in video footage. The system can identify safety gear including hard hats, safety vests, 
          gloves, and other protective equipment.
        </Typography>
        <Typography paragraph>
          The technology is built on YOLO (You Only Look Once) object detection, providing real-time 
          analysis with high accuracy.
        </Typography>
        <Typography paragraph>
          To use the system, simply upload a video file (MP4, AVI, or MOV format) and the application 
          will process it automatically. The analyzed video will be available for download with 
          visual indicators showing detected PPE.
        </Typography>
        <Typography>
          For more information about the technology, visit {' '}
          <Link href="https://ultralytics.com/yolov5" target="_blank" rel="noopener">
            Ultralytics YOLO
          </Link>.
        </Typography>
      </Paper>
    </Container>
  );
};

export default About;