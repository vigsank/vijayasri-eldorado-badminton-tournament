import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Admin from './pages/Admin';
import Rules from './pages/Rules';
import Navbar from './components/Navbar';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <SocketProvider>
      <AuthProvider>
        <Router>
          <Box minH="100vh" bg="jazzy.dark">
            <Navbar />
            <Box p={4}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </SocketProvider>
  );
}

export default App;
