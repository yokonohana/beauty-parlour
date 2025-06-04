import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/finComponents/Home.jsx';
import Auth from './components/finComponents/Auth.jsx';
import Registration from './components/finComponents/Registration.jsx';
import Gallery from './components/finComponents/Gallery.jsx';
import Reviews from './components/finComponents/Reviews.jsx';
import Account from './components/finComponents/Account.jsx';
import Servicer from './components/finComponents/Servicer.jsx';
import Promotions from './components/finComponents/Promotions.jsx';
import BookingPage from './components/finComponents/BookingPage.jsx';



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/appointments" element={<Home />} />
        <Route path="/services" element={<Servicer />} />
        <Route path="/booking" element={<BookingPage />} /> 
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/contacts" element={<Account />} /> 
        <Route path="/auth" element={<Auth />} />
        <Route path="/registration" element={<Registration />} />
      </Routes>
    </BrowserRouter>
  );
}