import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import stockService from '../api/stockService';

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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to SmartStore</h1>
        <p className="text-xl">Phone Store Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Low Stock Items</div>
            <div className="stat-value text-warning">
              {loading ? <span className="loading loading-spinner"></span> : lowStockCount}
            </div>
            <div className="stat-desc">
              <Link to="/purchases" className="link link-hover text-primary">Add Stock</Link>
            </div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Out of Stock Items</div>
            <div className="stat-value text-error">
              {loading ? <span className="loading loading-spinner"></span> : outOfStockCount}
            </div>
            <div className="stat-desc">
              <Link to="/purchases" className="link link-hover text-primary">Add Stock</Link>
            </div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Quick Actions</div>
            <div className="stat-desc mt-2">
              <Link to="/sales/new" className="btn btn-primary btn-sm w-full mb-2">Record Sale</Link>
              <Link to="/purchases" className="btn btn-secondary btn-sm w-full">Add Stock</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Phones</h2>
            <p>Manage your phone inventory</p>
            <div className="card-actions justify-end">
              <Link to="/phones" className="btn btn-primary">View</Link>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Accessories</h2>
            <p>Manage your accessory inventory</p>
            <div className="card-actions justify-end">
              <Link to="/accessories" className="btn btn-primary">View</Link>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Sales</h2>
            <p>View and record sales</p>
            <div className="card-actions justify-end">
              <Link to="/sales" className="btn btn-primary">View</Link>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Brands & Models</h2>
            <p>Manage brands and models</p>
            <div className="card-actions justify-end">
              <Link to="/brands" className="btn btn-primary">View</Link>
            </div>
          </div>
        </div>
      </div>

      {/* User Welcome */}
      <div className="mt-12 text-center">
        <p className="text-lg">
          Logged in as <span className="font-bold">{user?.username}</span>
        </p>
      </div>
    </div>
  );
};

export default Home;
