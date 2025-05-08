import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden" onClick={toggleMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          {isMenuOpen && (
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
              <li><Link to="/phones" onClick={() => setIsMenuOpen(false)}>Phones</Link></li>
              <li><Link to="/accessories" onClick={() => setIsMenuOpen(false)}>Accessories</Link></li>
              <li><Link to="/brands" onClick={() => setIsMenuOpen(false)}>Brands</Link></li>
              <li><Link to="/models" onClick={() => setIsMenuOpen(false)}>Models</Link></li>
              <li><Link to="/purchases" onClick={() => setIsMenuOpen(false)}>Purchases</Link></li>
              <li><Link to="/sales" onClick={() => setIsMenuOpen(false)}>Sales</Link></li>
            </ul>
          )}
        </div>
        <Link to="/" className="btn btn-ghost normal-case text-xl">SmartStore</Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><Link to="/phones">Phones</Link></li>
          <li><Link to="/accessories">Accessories</Link></li>
          <li><Link to="/brands">Brands</Link></li>
          <li><Link to="/models">Models</Link></li>
          <li><Link to="/purchases">Purchases</Link></li>
          <li><Link to="/sales">Sales</Link></li>
        </ul>
      </div>
      <div className="navbar-end">
        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              <div className="flex items-center">
                <span className="mr-2">{user.username}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><a onClick={handleLogout}>Logout</a></li>
            </ul>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary">Login</Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
