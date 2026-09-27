import React from 'react';
import { Link } from 'react-router-dom';
import { PackageSearch, ShoppingBag } from 'lucide-react';
import './MyOrders.css';

const MyOrders = () => {
  // TODO: Integrate with backend order API when available
  const orders = [];

  if (orders.length === 0) {
    return (
      <div className="my-orders-page container empty-orders fade-in">
        <PackageSearch size={64} color="var(--accent-purple)" style={{ marginBottom: '1.5rem' }} />
        <h2>No Orders Yet</h2>
        <p>Once you place an order, you'll be able to track it here. Start shopping to get your first custom print!</p>
        <Link to="/shop" className="btn-primary orders-shop-btn" style={{ marginTop: '1.5rem' }}>
          <ShoppingBag size={18} />
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="my-orders-page container fade-in">
      <div className="my-orders-header">
        <h1>My Orders</h1>
        <p>Track and manage your custom print orders.</p>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <span className="order-id">Order #{order._id?.slice(-8).toUpperCase()}</span>
              <span className={`order-status status-${order.status}`}>{order.status}</span>
            </div>
            <div className="order-card-body">
              <p className="order-date">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="order-total">₹{order.totalAmount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
