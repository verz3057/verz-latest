import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  ShoppingBag,
  IndianRupee,
  RefreshCw,
  Shield,
  AlertTriangle,
  Star,
  Check,
  X,
  Trash2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import './AdminDashboard.css';
import AdminProductManager from '../components/AdminProductManager';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // ------------------------------------------------
  // LOAD STATS
  // ------------------------------------------------
  const fetchStats = async () => {
    try {
      const { data: ordersData, error: ordersError } =
        await supabase
          .from('orders')
          .select('*');

      if (ordersError) throw ordersError;

      const { data: usersData, error: usersError } =
        await supabase
          .from('profiles')
          .select('*');

      if (usersError) throw usersError;

      const paidOrders = (ordersData || []).filter(
        order =>
          order.payment_status?.toLowerCase() === 'paid'
      );

      const totalRevenue = paidOrders.reduce(
        (total, order) =>
          total + Number(order.total_amount || 0),
        0
      );

      const recentOrders = [...(ordersData || [])]
        .sort(
          (a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        )
        .slice(0, 10);

      setStats({
        totalRevenue,
        totalOrders: ordersData?.length || 0,
        totalUsers: usersData?.length || 0,
        recentOrders
      });
    } catch (err) {
      console.error('STATS ERROR:', err);
      setError('Failed to load dashboard statistics');
    }
  };

  // ------------------------------------------------
  // LOAD USERS
  // ------------------------------------------------
  const fetchUsers = async () => {
    try {
      const { data, error } =
        await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (err) {
      console.error('USERS ERROR:', err);
      setError('Failed to load users');
    }
  };

  // ------------------------------------------------
  // LOAD ORDERS + ITEMS + CUSTOMER INFO
  // ------------------------------------------------
  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } =
        await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        return;
      }

      const orderIds = ordersData.map(order => order.id);

      // Get order items
      const { data: itemsData, error: itemsError } =
        await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // Get addresses
      const addressIds = ordersData
        .map(order => order.address_id)
        .filter(Boolean);

      let addressesData = [];

      if (addressIds.length > 0) {
        const { data, error } =
          await supabase
            .from('addresses')
            .select('*')
            .in('id', addressIds);

        if (error) throw error;

        addressesData = data || [];
      }

      // Get customer profiles
      const userIds = ordersData
        .map(order => order.user_id)
        .filter(Boolean);

      let profilesData = [];

      if (userIds.length > 0) {
        const { data, error } =
          await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);

        if (error) throw error;

        profilesData = data || [];
      }

      // Combine everything
      const formattedOrders = ordersData.map(order => {
        const orderItems = (itemsData || []).filter(
          item => item.order_id === order.id
        );

        const address = addressesData.find(
          item => item.id === order.address_id
        );

        const profile = profilesData.find(
          item => item.id === order.user_id
        );

        return {
          ...order,
          items: orderItems,
          address,
          profile
        };
      });

      setOrders(formattedOrders);
    } catch (err) {
      console.error('ORDERS ERROR:', err);
      setError('Failed to load orders');
    }
  };

  // ------------------------------------------------
  // LOAD REVIEWS
  // ------------------------------------------------
  const fetchReviews = async () => {
    try {
      const { data: reviewsData, error: reviewsError } =
        await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        return;
      }

      // Get customer profiles
      const userIds = [
        ...new Set(
          reviewsData
            .map(review => review.user_id)
            .filter(Boolean)
        )
      ];

      let profilesData = [];

      if (userIds.length > 0) {
        const { data, error } =
          await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds);

        if (error) throw error;

        profilesData = data || [];
      }

      // Get product information
      const productIds = [
        ...new Set(
          reviewsData
            .map(review => review.product_id)
            .filter(Boolean)
        )
      ];

      let productsData = [];

      if (productIds.length > 0) {
        const { data, error } =
          await supabase
            .from('products')
            .select('id, name, slug')
            .in('id', productIds);

        if (error) throw error;

        productsData = data || [];
      }

      const formattedReviews = reviewsData.map(review => {
        const profile = profilesData.find(
          item => item.id === review.user_id
        );

        const product = productsData.find(
          item => item.id === review.product_id
        );

        return {
          ...review,
          profile,
          product
        };
      });

      setReviews(formattedReviews);

      console.log(
        'ADMIN REVIEWS LOADED SUCCESSFULLY:',
        formattedReviews
      );
    } catch (err) {
      console.error('REVIEWS ERROR:', err);
      setError('Failed to load reviews');
    }
  };

  // ------------------------------------------------
  // LOAD EVERYTHING
  // ------------------------------------------------
  const loadData = async () => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchOrders(),
        fetchReviews()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // ------------------------------------------------
  // UPDATE ORDER STATUS
  // ------------------------------------------------
  const handleUpdateOrderStatus = async (
    orderId,
    newStatus
  ) => {
    const currentOrder = orders.find(
      order => order.id === orderId
    );

    if (!currentOrder) return;

    if (currentOrder.order_status === newStatus) {
      return;
    }

    const confirmed = window.confirm(
      `Change order status from "${currentOrder.order_status}" to "${newStatus}"?`
    );

    if (!confirmed) return;

    setActionLoading(`order-${orderId}`);

    try {
      // 1. Update orders table
      const { error: updateError } =
        await supabase
          .from('orders')
          .update({
            order_status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

      if (updateError) throw updateError;

      // 2. Create status history entry
      const { error: historyError } =
        await supabase
          .from('order_status_history')
          .insert([
            {
              order_id: orderId,
              status: newStatus,
              note: `Order status changed to ${newStatus}`,
              changed_by: user.id
            }
          ]);

      if (historyError) throw historyError;

      // 3. Update UI immediately
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? {
                ...order,
                order_status: newStatus
              }
            : order
        )
      );

      await fetchStats();

      alert(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('STATUS UPDATE ERROR:', err);

      alert(
        err.message ||
        'Failed to update order status'
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ------------------------------------------------
  // UPDATE USER ROLE
  // ------------------------------------------------
  const handleUpdateUserRole = async (
  userId,
  newRole
) => {

  if (userId === user.id) {
    alert(
      'You cannot modify your own administrative privileges.'
    );
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to change this user's role to "${newRole}"?`
  );

  if (!confirmed) return;

  setActionLoading(`user-${userId}`);

  try {

    const { data, error } = await supabase.rpc(
      'admin_update_user_role',
      {
        p_user_id: userId,
        p_new_role: newRole
      }
    );

    if (error) throw error;

    if (!data) {
      throw new Error('User role could not be updated.');
    }

    setUsers(prevUsers =>
      prevUsers.map(profile =>
        profile.id === userId
          ? {
              ...profile,
              role: newRole
            }
          : profile
      )
    );

    alert(
      `User role changed to ${newRole}`
    );

  } catch (err) {

    console.error('ROLE UPDATE ERROR:', err);

    alert(
      err.message ||
      'Failed to update user role'
    );

  } finally {

    setActionLoading(null);

  }
};
  // ------------------------------------------------
  // APPROVE REVIEW
  // ------------------------------------------------
  const handleApproveReview = async (reviewId) => {
    const review = reviews.find(
      item => item.id === reviewId
    );

    if (!review) return;

    const confirmed = window.confirm(
      'Approve this review and make it visible on the product page?'
    );

    if (!confirmed) return;

    setActionLoading(`review-approve-${reviewId}`);

    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          is_approved: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(prevReviews =>
        prevReviews.map(item =>
          item.id === reviewId
            ? {
                ...item,
                is_approved: true
              }
            : item
        )
      );

      alert('Review approved successfully.');
    } catch (err) {
      console.error('REVIEW APPROVAL ERROR:', err);

      alert(
        err.message ||
        'Failed to approve review'
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ------------------------------------------------
  // REJECT REVIEW
  // A rejected review is deleted because the current
  // reviews schema has no separate moderation status.
  // ------------------------------------------------
  const handleRejectReview = async (reviewId) => {
    const confirmed = window.confirm(
      'Reject this review? Rejected reviews will be removed from the system.'
    );

    if (!confirmed) return;

    setActionLoading(`review-reject-${reviewId}`);

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(prevReviews =>
        prevReviews.filter(
          item => item.id !== reviewId
        )
      );

      alert('Review rejected and removed.');
    } catch (err) {
      console.error('REVIEW REJECTION ERROR:', err);

      alert(
        err.message ||
        'Failed to reject review'
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ------------------------------------------------
  // DELETE REVIEW
  // ------------------------------------------------
  const handleDeleteReview = async (reviewId) => {
    const confirmed = window.confirm(
      'Delete this review permanently?'
    );

    if (!confirmed) return;

    setActionLoading(`review-delete-${reviewId}`);

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(prevReviews =>
        prevReviews.filter(
          item => item.id !== reviewId
        )
      );

      alert('Review deleted successfully.');
    } catch (err) {
      console.error('REVIEW DELETE ERROR:', err);

      alert(
        err.message ||
        'Failed to delete review'
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ------------------------------------------------
  // LOADING
  // ------------------------------------------------
  if (loading) {
    return (
      <div className="admin-loading-container container">
        <div className="loader"></div>
        <p>
          Initializing Administrative Console...
        </p>
      </div>
    );
  }

  // ------------------------------------------------
  // ACCESS DENIED
  // ------------------------------------------------
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-access-denied container fade-in">
        <div className="glass denied-card">
          <AlertTriangle
            size={64}
            color="var(--accent-pink)"
          />

          <h2>
            Security Alert: Access Denied
          </h2>

          <p>
            Administrative privileges are required
            to view this directory.
          </p>

          <button
            className="btn-primary"
            onClick={() => navigate('/login')}
          >
            Sign In as Admin
          </button>

          <button
            className="btn-secondary"
            onClick={() => navigate('/')}
            style={{ marginTop: '1rem' }}
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------
  // DASHBOARD
  // ------------------------------------------------
  return (
    <div className="admin-dashboard container fade-in">

      {/* HEADER */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">
            Administrative Console
          </h1>

          <p className="admin-subtitle">
            Manage VERZ store orders and customer accounts.
          </p>
        </div>

        <button
          className="btn-secondary refresh-btn"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={18} />
          Reload Data
        </button>
      </div>

      {error && (
        <div className="admin-error-banner">
          {error}
        </div>
      )}

      {/* TABS */}
      <div className="admin-tabs">

        <button
          className={`admin-tab-btn ${
            activeTab === 'overview'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setActiveTab('overview')
          }
        >
          Console Overview
        </button>

        <button
          className={`admin-tab-btn ${
            activeTab === 'products'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setActiveTab('products')
          }
        >
          Products
        </button>

        <button
          className={`admin-tab-btn ${
            activeTab === 'orders'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setActiveTab('orders')
          }
        >
          Customer Orders ({orders.length})
        </button>

        <button
          className={`admin-tab-btn ${
            activeTab === 'reviews'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setActiveTab('reviews')
          }
        >
          Reviews (
          {reviews.filter(review => !review.is_approved).length}
          )
        </button>

        <button
          className={`admin-tab-btn ${
            activeTab === 'users'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setActiveTab('users')
          }
        >
          User Registry ({users.length})
        </button>

      </div>

      <div className="admin-tab-content">

        {/* ================= PRODUCTS ================= */}
        {activeTab === 'products' && (
          <AdminProductManager />
        )}

        {/* ================= OVERVIEW ================= */}
        {activeTab === 'overview' && stats && (
          <div className="overview-tab-content fade-in">

            <div className="admin-stats-grid">

              <div className="stats-card glass">
                <div className="stats-icon-wrapper cyan">
                  <IndianRupee size={28} />
                </div>

                <div className="stats-info">
                  <h3>Total Revenue</h3>

                  <p className="stats-number">
                    ₹
                    {stats.totalRevenue.toLocaleString(
                      'en-IN',
                      {
                        minimumFractionDigits: 2
                      }
                    )}
                  </p>

                  <span className="stats-label">
                    From paid orders
                  </span>
                </div>
              </div>

              <div className="stats-card glass">
                <div className="stats-icon-wrapper pink">
                  <ShoppingBag size={28} />
                </div>

                <div className="stats-info">
                  <h3>Total Orders</h3>

                  <p className="stats-number">
                    {stats.totalOrders}
                  </p>

                  <span className="stats-label">
                    Orders placed
                  </span>
                </div>
              </div>

              <div className="stats-card glass">
                <div className="stats-icon-wrapper yellow">
                  <Users size={28} />
                </div>

                <div className="stats-info">
                  <h3>Registered Users</h3>

                  <p className="stats-number">
                    {stats.totalUsers}
                  </p>

                  <span className="stats-label">
                    Customer + admin profiles
                  </span>
                </div>
              </div>

            </div>

            {/* RECENT ORDERS */}
            <div className="recent-orders-section glass">

              <h2 className="section-title">
                Recent Customer Orders
              </h2>

              {stats.recentOrders.length > 0 ? (
                <div className="table-wrapper">

                  <table className="admin-table">

                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Order Status</th>
                        <th>Payment</th>
                        <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>

                      {stats.recentOrders.map(order => {

                        const customer =
                          users.find(
                            profile =>
                              profile.id ===
                              order.user_id
                          );

                        return (
                          <tr key={order.id}>

                            <td className="font-mono text-cyan">
                              {order.id.slice(0, 8)}...
                            </td>

                            <td>
                              {customer?.full_name ||
                                'Customer'}
                            </td>

                            <td>
                              ₹
                              {Number(
                                order.total_amount || 0
                              ).toFixed(2)}
                            </td>

                            <td>
                              <span
                                className={`status-badge ${order.order_status}`}
                              >
                                {(
                                  order.order_status ||
                                  'Processing'
                                ).toUpperCase()}
                              </span>
                            </td>

                            <td>
                              {order.payment_status ||
                                'Pending'}
                            </td>

                            <td>
                              {new Date(
                                order.created_at
                              ).toLocaleDateString(
                                'en-IN',
                                {
                                  dateStyle: 'medium'
                                }
                              )}
                            </td>

                          </tr>
                        );
                      })}

                    </tbody>

                  </table>

                </div>
              ) : (
                <p className="empty-message">
                  No orders found.
                </p>
              )}

            </div>

          </div>
        )}

        {/* ================= ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="orders-tab-content glass fade-in">

            <h2 className="section-title">
              Order Fulfillment Register
            </h2>

            {orders.length > 0 ? (
              <div className="table-wrapper">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {orders.map(order => (

                      <tr key={order.id}>

                        {/* ORDER */}
                        <td>
                          <div className="order-details-cell">

                            <span className="order-date">
                              {new Date(
                                order.created_at
                              ).toLocaleDateString(
                                'en-IN',
                                {
                                  dateStyle: 'medium'
                                }
                              )}
                            </span>

                            <span className="font-mono text-cyan text-xs">
                              ID: {order.id.slice(0, 8)}...
                            </span>

                          </div>
                        </td>

                        {/* CUSTOMER */}
                        <td>
                          <div className="user-table-cell">

                            <span className="user-cell-name">
                              {order.profile?.full_name ||
                                'Customer'}
                            </span>

                            <span className="user-cell-email">
                              {order.address?.phone ||
                                'Phone unavailable'}
                            </span>

                            <span className="user-cell-address text-xs text-gray">
                              {order.address
                                ? `${order.address.address_line1}, ${order.address.city} - ${order.address.postal_code}`
                                : 'Address unavailable'}
                            </span>

                          </div>
                        </td>

                        {/* ITEMS */}
                        <td>

                          <div className="items-list-cell">

                            {order.items?.length > 0 ? (

                              order.items.map(item => (

                                <div
                                  key={item.id}
                                  className="item-line text-xs"
                                >
                                  <span>
                                    {item.product_name}
                                    {' '}
                                    <strong>
                                      x{item.quantity}
                                    </strong>
                                  </span>
                                </div>

                              ))

                            ) : (
                              <span className="text-gray">
                                No items
                              </span>
                            )}

                          </div>

                        </td>

                        {/* TOTAL */}
                        <td className="font-semibold">
                          ₹
                          {Number(
                            order.total_amount || 0
                          ).toFixed(2)}
                        </td>

                        {/* PAYMENT */}
                        <td>
                          <span className="status-badge">
                            {(
                              order.payment_status ||
                              'Pending'
                            ).toUpperCase()}
                          </span>
                        </td>

                        {/* CURRENT STATUS */}
                        <td>
                          <span
                            className={`status-badge ${order.order_status}`}
                          >
                            {(
                              order.order_status ||
                              'Processing'
                            ).toUpperCase()}
                          </span>
                        </td>

                        {/* UPDATE STATUS */}
                        <td>

                          <div className="actions-cell">

                            <select
                              className="admin-select"
                              value={
                                order.order_status ||
                                'Processing'
                              }
                              onChange={e =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  e.target.value
                                )
                              }
                              disabled={
                                actionLoading ===
                                `order-${order.id}`
                              }
                            >

                              <option value="Processing">
                                Processing
                              </option>

                              <option value="Shipped">
                                Shipped
                              </option>

                              <option value="Delivered">
                                Delivered
                              </option>

                              <option value="Cancelled">
                                Cancelled
                              </option>

                            </select>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>
            ) : (
              <p className="empty-message">
                No orders found in the system.
              </p>
            )}

          </div>
        )}

        {/* ================= REVIEWS ================= */}
        {activeTab === 'reviews' && (
          <div className="reviews-tab-content glass fade-in">

            <div className="reviews-admin-header">
              <div>
                <h2 className="section-title">
                  Review Moderation Center
                </h2>

                <p className="admin-subtitle">
                  Approve customer reviews before they become public.
                </p>
              </div>

              <div className="review-filter-buttons">
                <button
                  className={`btn-table-action ${
                    reviewFilter === 'pending'
                      ? 'promote'
                      : ''
                  }`}
                  onClick={() =>
                    setReviewFilter('pending')
                  }
                >
                  Pending (
                  {
                    reviews.filter(
                      review => !review.is_approved
                    ).length
                  }
                  )
                </button>

                <button
                  className={`btn-table-action ${
                    reviewFilter === 'approved'
                      ? 'promote'
                      : ''
                  }`}
                  onClick={() =>
                    setReviewFilter('approved')
                  }
                >
                  Approved (
                  {
                    reviews.filter(
                      review => review.is_approved
                    ).length
                  }
                  )
                </button>

                <button
                  className={`btn-table-action ${
                    reviewFilter === 'all'
                      ? 'promote'
                      : ''
                  }`}
                  onClick={() =>
                    setReviewFilter('all')
                  }
                >
                  All ({reviews.length})
                </button>
              </div>
            </div>

            {(() => {
              const filteredReviews =
                reviews.filter(review => {
                  if (reviewFilter === 'pending') {
                    return !review.is_approved;
                  }

                  if (reviewFilter === 'approved') {
                    return review.is_approved;
                  }

                  return true;
                });

              if (filteredReviews.length === 0) {
                return (
                  <p className="empty-message">
                    {reviewFilter === 'pending'
                      ? 'No pending reviews.'
                      : reviewFilter === 'approved'
                      ? 'No approved reviews.'
                      : 'No reviews found.'}
                  </p>
                );
              }

              return (
                <div className="table-wrapper">

                  <table className="admin-table">

                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredReviews.map(review => (

                        <tr key={review.id}>

                          <td>
                            <div className="user-table-cell">
                              <span className="user-cell-name">
                                {review.profile?.full_name ||
                                  'Customer'}
                              </span>

                              <span className="font-mono text-cyan text-xs">
                                {review.user_id?.slice(0, 8)}...
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="order-details-cell">
                              <span className="font-semibold">
                                {review.product?.name ||
                                  'Product unavailable'}
                              </span>

                              {review.order_id && (
                                <span className="font-mono text-cyan text-xs">
                                  Order: {review.order_id.slice(0, 8)}...
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            <div className="review-rating-admin">
                              {Array.from(
                                { length: 5 },
                                (_, index) => (
                                  <Star
                                    key={index}
                                    size={15}
                                    fill={
                                      index < review.rating
                                        ? 'currentColor'
                                        : 'none'
                                    }
                                  />
                                )
                              )}
                            </div>
                          </td>

                          <td>
                            <div className="review-text-admin">
                              {review.review_text ||
                                'No review text'}
                            </div>
                          </td>

                          <td>
                            <span
                              className={`status-badge ${
                                review.is_approved
                                  ? 'Delivered'
                                  : 'Processing'
                              }`}
                            >
                              {review.is_approved
                                ? 'APPROVED'
                                : 'PENDING'}
                            </span>
                          </td>

                          <td>
                            {new Date(
                              review.created_at
                            ).toLocaleDateString(
                              'en-IN',
                              {
                                dateStyle: 'medium'
                              }
                            )}
                          </td>

                          <td>
                            <div className="actions-cell">

                              {!review.is_approved && (
                                <>
                                  <button
                                    className="btn-table-action promote"
                                    onClick={() =>
                                      handleApproveReview(
                                        review.id
                                      )
                                    }
                                    disabled={
                                      actionLoading ===
                                        `review-approve-${review.id}` ||
                                      actionLoading ===
                                        `review-reject-${review.id}`
                                    }
                                    title="Approve review"
                                  >
                                    <Check size={14} />
                                    Approve
                                  </button>

                                  <button
                                    className="btn-table-action demote"
                                    onClick={() =>
                                      handleRejectReview(
                                        review.id
                                      )
                                    }
                                    disabled={
                                      actionLoading ===
                                      `review-reject-${review.id}`
                                    }
                                    title="Reject review"
                                  >
                                    <X size={14} />
                                    Reject
                                  </button>
                                </>
                              )}

                              {review.is_approved && (
                                <button
                                  className="btn-table-action demote"
                                  onClick={() =>
                                    handleDeleteReview(
                                      review.id
                                    )
                                  }
                                  disabled={
                                    actionLoading ===
                                    `review-delete-${review.id}`
                                  }
                                  title="Delete review"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              )}

                            </div>
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>
              );
            })()}

          </div>
        )}

        {/* ================= USERS ================= */}
        {activeTab === 'users' && (
          <div className="users-tab-content glass fade-in">

            <h2 className="section-title">
              Customer Database Directory
            </h2>

            {users.length > 0 ? (
              <div className="table-wrapper">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>Account Name</th>
                      <th>Access Level</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {users.map(profile => (

                      <tr key={profile.id}>

                        <td className="font-semibold">
                          {profile.full_name ||
                            'Unnamed User'}
                        </td>

                        <td>

                          <span
                            className={`role-badge ${
                              profile.role
                            }`}
                          >

                            {profile.role === 'admin' && (
                              <Shield
                                size={12}
                                style={{
                                  marginRight: '4px'
                                }}
                              />
                            )}

                            {(
                              profile.role ||
                              'customer'
                            ).toUpperCase()}

                          </span>

                        </td>

                        <td>
                          {new Date(
                            profile.created_at
                          ).toLocaleDateString(
                            'en-IN',
                            {
                              dateStyle: 'medium'
                            }
                          )}
                        </td>

                        <td>

                          <button
                            className={`btn-table-action ${
                              profile.role === 'admin'
                                ? 'demote'
                                : 'promote'
                            }`}
                            onClick={() =>
                              handleUpdateUserRole(
                                profile.id,
                                profile.role === 'admin'
                                  ? 'customer'
                                  : 'admin'
                              )
                            }
                            disabled={
                              profile.id === user.id ||
                              actionLoading ===
                                `user-${profile.id}`
                            }
                          >
                            {profile.role === 'admin'
                              ? 'Revoke Admin'
                              : 'Make Admin'}
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>
            ) : (
              <p className="empty-message">
                No users found.
              </p>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;