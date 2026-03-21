import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Ideation from './pages/Ideation';
import Planner from './pages/Planner';
import Moodboard from './pages/Moodboard';
import Editor3D from './pages/Editor3D';
import PPTGenerator from './pages/PPTGenerator';
import Explore from './pages/Explore';
import Library from './pages/Library';
import Profile from './pages/Profile';
import PolicyCenter from './pages/PolicyCenter';
import ProtectedRoute from './components/ProtectedRoute';
import AppErrorBoundary from './components/AppErrorBoundary';
import useAuthStore from './store/useAuthStore';

function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/policies" element={<PolicyCenter />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/ideation" element={<ProtectedRoute><AppErrorBoundary><Ideation /></AppErrorBoundary></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/moodboard" element={<ProtectedRoute><Moodboard /></ProtectedRoute>} />
        <Route path="/editor" element={<ProtectedRoute><Editor3D /></ProtectedRoute>} />
        <Route path="/ppt" element={<ProtectedRoute><PPTGenerator /></ProtectedRoute>} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
