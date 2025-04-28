import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { SafetyDivider as LogoIcon } from '@mui/icons-material';

const Navbar = () => {
  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Box display="flex" alignItems="center" mr={2}>
          <LogoIcon fontSize="large" />
        </Box>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/"
          sx={{ 
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          PPE Detection
        </Typography>
        <Button 
          color="inherit" 
          component={Link} 
          to="/about"
          sx={{ fontWeight: 500 }}
        >
          About
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;