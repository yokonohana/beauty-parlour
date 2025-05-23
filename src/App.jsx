import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/finComponents/Home.jsx';
import Auth from './components/finComponents/Auth.jsx';
import Registration from './components/finComponents/Registration.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/appointments" element={<Home />} />
        <Route path="/reviews" element={<Home />} />
        <Route path="/gallery" element={<Home />} />
        <Route path="/promotions" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/registration" element={<Registration />} />
      </Routes>
    </BrowserRouter>
  );
}