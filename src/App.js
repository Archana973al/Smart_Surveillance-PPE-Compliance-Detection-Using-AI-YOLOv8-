import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import theme from './theme';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import About from './pages/About';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;