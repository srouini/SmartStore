import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext, { AuthProvider } from './contexts/AuthContext';
import { BrandModelProvider } from './contexts/BrandModelContext';
import { SupplierProvider } from './contexts/SupplierContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Phones from './pages/Phones';
import Accessories from './pages/Accessories';
import Brands from './pages/Brands';
import Models from './pages/Models';
import Purchases from './pages/Purchases';
import Suppliers from './pages/Suppliers';
import Sales from './pages/Sales';
import Caisse from './pages/Caisse';

// Import CSS
import './index.css';

function App() {
  return (
    <AuthProvider>
    <BrandModelProvider>
    <SupplierProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                {/* Application routes */}
                <Route path="/phones" element={<Phones />} />
                <Route path="/accessories" element={<Accessories />} />
                <Route path="/brands" element={<Brands />} />
                <Route path="/models" element={<Models />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/caisse" element={<Caisse />} />
              </Route>
            </Route>
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
        </SupplierProvider>
        </BrandModelProvider>
</AuthProvider>
  );
}

// Layout component with Navbar
function Layout() {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/phones" element={<Phones />} />
          <Route path="/accessories" element={<Accessories />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/models" element={<Models />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/caisse" element={<Caisse />} />
        </Routes>
      </main>
      <footer className="footer footer-center p-4 bg-base-300 text-base-content">
        <div>
          <p>Copyright © {new Date().getFullYear()} - VoltLink</p>
        </div>
      </footer>
    </>
  );
}

export default App
