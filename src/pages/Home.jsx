import { Container } from '@mui/material';
import VideoUploader from '../components/VideoProcessor/VideoUploader';

const Home = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <VideoUploader />
    </Container>
  );
};

export default Home;