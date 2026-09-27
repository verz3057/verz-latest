import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, ShoppingBag, IndianRupee, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // track which item is updating

  const token = localStorage.getItem('token');

  // Guard clause: restrict access if user is not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.stats);
      } else {
        setError(data.message || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      console.error(err);
      setError('Network error loading dashboard statistics');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Failed to fetch customer directory');
      }
    } catch (err) {
      console.error(err);
      setError('Network error loading users directory');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders);
      } else {
        setError(data.message || 'Failed to fetch order registry');
      }
    } catch (err) {
      console.error(err);
      setError('Network error loading orders registry');
    }
  };

  const loadData = async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    setError('');
    await Promise.all([fetchStats(), fetchUsers(), fetchOrders()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setActionLoading(`order-${orderId}`);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh local orders list
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        // Refresh stats (revenue might have changed if order status flipped to paid)
        fetchStats();
      } else {
        alert(data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating order status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    if (userId === user.id) {
      alert("You cannot modify your own administrative privileges.");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to change this customer's role to "${newRole}"?`)) {
      return;
    }

    setActionLoading(`user-${userId}`);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh local users list
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        // Refresh stats
        fetchStats();
      } else {
        alert(data.message || 'Failed to update user role');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating user role');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container container">
        <div className="loader"></div>
        <p>Initializing Administrative Console...</p>
      </div>
    );
  }

  // Access Denied View
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-access-denied container fade-in">
        <div className="glass denied-card">
          <AlertTriangle size={64} color="var(--accent-pink)" />
          <h2>Security Alert: Access Denied</h2>
          <p>Administrative privileges are required to view this directory.</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>Sign In as Admin</button>
          <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>Return to Shop</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard container fade-in">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Administrative Console</h1>
          <p className="admin-subtitle">Manage VERZ store products, order fulfillments, and customer accounts.</p>
        </div>
        <button className="btn-secondary refresh-btn" onClick={loadData}>
          <RefreshCw size={18} />
          Reload Data
        </button>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Console Overview
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Customer Orders ({orders.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Registry ({users.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-tab-content">
        
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && stats && (
          <div className="overview-tab-content fade-in">
            {/* Stats Cards */}
            <div className="admin-stats-grid">
              <div className="stats-card glass">
                <div className="stats-icon-wrapper cyan">
                  <IndianRupee size={28} />
                </div>
                <div className="stats-info">
                  <h3>Total Revenue</h3>
                  <p className="stats-number">₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  <span className="stats-label">Calculated from paid orders</span>
                </div>
              </div>

              <div className="stats-card glass">
                <div className="stats-icon-wrapper pink">
                  <ShoppingBag size={28} />
                </div>
                <div className="stats-info">
                  <h3>Total Orders</h3>
                  <p className="stats-number">{stats.totalOrders}</p>
                  <span className="stats-label">Pending + paid checkout carts</span>
                </div>
              </div>

              <div className="stats-card glass">
                <div className="stats-icon-wrapper yellow">
                  <Users size={28} />
                </div>
                <div className="stats-info">
                  <h3>Registered Users</h3>
                  <p className="stats-number">{stats.totalUsers}</p>
                  <span className="stats-label">Customer + administrator profiles</span>
                </div>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="recent-orders-section glass">
              <h2 className="section-title">Recent Customer Orders</h2>
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Payment Status</th>
                        <th>Registered Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map(order => (
                        <tr key={order._id}>
                          <td className="font-mono text-cyan">{order.razorpayOrderId}</td>
                          <td>
                            <div className="user-table-cell">
                              <span className="user-cell-name">{order.shippingAddress ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : order.user?.name || 'Guest User'}</span>
                              <span className="user-cell-email">{order.user?.email || 'N/A'}</span>
                            </div>
                          </td>
                          <td>₹{order.amount.toFixed(2)}</td>
                          <td>
                            <span className={`status-badge ${order.status}`}>
                              {order.status.toUpperCase()}
                            </span>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="empty-message">No orders found in the database registry.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' && (
          <div className="orders-tab-content glass fade-in">
            <h2 className="section-title">Order Fulfillment Register</h2>
            {orders.length > 0 ? (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order Details</th>
                      <th>Shipping To</th>
                      <th>Purchased Items</th>
                      <th>Total Amount</th>
                      <th>Payment Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td>
                          <div className="order-details-cell">
                            <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                            <span className="font-mono text-cyan text-xs">ID: {order.razorpayOrderId}</span>
                            {order.razorpayPaymentId && (
                              <span className="font-mono text-gray text-xs">Payment ID: {order.razorpayPaymentId}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="user-table-cell">
                            <span className="user-cell-name">
                              {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                            </span>
                            <span className="user-cell-email">{order.shippingAddress?.email || order.user?.email}</span>
                            <span className="user-cell-address text-xs text-gray">
                              {order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.postalCode}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="items-list-cell">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="item-line text-xs">
                                <span>{item.name} <strong>x{item.quantity}</strong></span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="font-semibold">₹{order.amount.toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <select 
                              className="admin-select"
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              disabled={actionLoading === `order-${order._id}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="failed">Failed</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-message">No orders found in the system database.</p>
            )}
          </div>
        )}

        {/* Tab 3: Users */}
        {activeTab === 'users' && (
          <div className="users-tab-content glass fade-in">
            <h2 className="section-title">Customer Database Directory</h2>
            {users.length > 0 ? (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Account Name</th>
                      <th>Email Address</th>
                      <th>Assigned Access Level</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td className="font-semibold">{u.name}</td>
                        <td className="font-mono">{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role}`}>
                            {u.role === 'admin' ? <Shield size={12} style={{ marginRight: '4px' }} /> : null}
                            {u.role ? u.role.toUpperCase() : 'CUSTOMER'}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                        <td>
                          <button
                            className={`btn-table-action ${u.role === 'admin' ? 'demote' : 'promote'}`}
                            onClick={() => handleUpdateUserRole(u._id, u.role === 'admin' ? 'customer' : 'admin')}
                            disabled={u._id === user.id || actionLoading === `user-${u._id}`}
                          >
                            {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-message">No users found in the system database.</p>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default AdminDashboard;
