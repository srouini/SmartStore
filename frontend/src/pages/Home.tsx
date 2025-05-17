import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import stockService from '../api/stockService';
import { FiPhone, FiHeadphones, FiShoppingCart, FiTag, FiTruck, FiBarChart2, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [outOfStockCount, setOutOfStockCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        const lowStockResponse = await stockService.getLowStock();
        const outOfStockResponse = await stockService.getOutOfStock();
        
        setLowStockCount(lowStockResponse.count);
        setOutOfStockCount(outOfStockResponse.count);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero bg-base-200 py-12">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-4">Welcome to VoltLink</h1>
            <p className="text-xl mb-8">Your complete phone store management solution</p>
            <div className="flex justify-center gap-4">
              <Link to="/sales/new" className="btn btn-primary">
                <FiShoppingCart className="mr-2" /> New Sale
              </Link>
              <Link to="/purchases/new" className="btn btn-secondary">
                <FiTruck className="mr-2" /> New Purchase
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <FiBarChart2 className="mr-2" /> Dashboard Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Stock Alerts */}
          <div className="card bg-base-100 shadow-xl transition-all hover:shadow-2xl">
            <div className="card-body">
              <h3 className="card-title flex items-center text-warning">
                <FiAlertTriangle className="mr-2" /> Low Stock Alert
              </h3>
              <div className="stat-value text-warning text-4xl my-4">
                {loading ? <span className="loading loading-spinner loading-md"></span> : lowStockCount}
              </div>
              <p className="text-sm opacity-70 mb-4">Items that need to be restocked soon</p>
              <div className="card-actions">
                <Link to="/purchases/new" className="btn btn-warning btn-sm">
                  Restock Now
                </Link>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl transition-all hover:shadow-2xl">
            <div className="card-body">
              <h3 className="card-title flex items-center text-error">
                <FiAlertCircle className="mr-2" /> Out of Stock
              </h3>
              <div className="stat-value text-error text-4xl my-4">
                {loading ? <span className="loading loading-spinner loading-md"></span> : outOfStockCount}
              </div>
              <p className="text-sm opacity-70 mb-4">Items that are completely out of stock</p>
              <div className="card-actions">
                <Link to="/purchases/new" className="btn btn-error btn-sm">
                  Order Now
                </Link>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl transition-all hover:shadow-2xl">
            <div className="card-body">
              <h3 className="card-title flex items-center">
                <FiShoppingCart className="mr-2" /> Quick Actions
              </h3>
              <div className="space-y-2 my-4">
                <Link to="/sales/new" className="btn btn-primary btn-sm w-full">
                  Record Sale
                </Link>
                <Link to="/purchases/new" className="btn btn-secondary btn-sm w-full">
                  Add Stock
                </Link>
                <Link to="/phones" className="btn btn-accent btn-sm w-full">
                  View Inventory
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Cards */}
        <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
            <div className="card-body">
              <h2 className="card-title flex items-center">
                <FiPhone className="mr-2 text-primary" /> Phones
              </h2>
              <p className="opacity-70">Manage your phone inventory</p>
              <div className="card-actions justify-end mt-4">
                <Link to="/phones" className="btn btn-primary btn-sm">
                  View
                </Link>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
            <div className="card-body">
              <h2 className="card-title flex items-center">
                <FiHeadphones className="mr-2 text-secondary" /> Accessories
              </h2>
              <p className="opacity-70">Manage your accessory inventory</p>
              <div className="card-actions justify-end mt-4">
                <Link to="/accessories" className="btn btn-secondary btn-sm">
                  View
                </Link>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
            <div className="card-body">
              <h2 className="card-title flex items-center">
                <FiShoppingCart className="mr-2 text-accent" /> Sales
              </h2>
              <p className="opacity-70">View and record sales</p>
              <div className="card-actions justify-end mt-4">
                <Link to="/sales" className="btn btn-accent btn-sm">
                  View
                </Link>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
            <div className="card-body">
              <h2 className="card-title flex items-center">
                <FiTag className="mr-2 text-info" /> Brands & Models
              </h2>
              <p className="opacity-70">Manage brands and models</p>
              <div className="card-actions justify-end mt-4">
                <Link to="/brands" className="btn btn-info btn-sm">
                  View
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* User Welcome */}
        <div className="divider"></div>
        <div className="text-center py-4">
          <p className="text-lg">
            Logged in as <span className="font-bold">{user?.username}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
