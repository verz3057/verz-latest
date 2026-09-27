import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PackageSearch,
  ShoppingBag,
  CheckCircle,
  Circle,
  Clock,
  Truck,
  XCircle
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

import './MyOrders.css';

const MyOrders = () => {

  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ------------------------------------------------
  // FETCH MY ORDERS + STATUS HISTORY
  // ------------------------------------------------
  useEffect(() => {

    const fetchMyOrders = async () => {

      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {

        setLoading(true);
        setError('');

        // 1. Fetch user's orders
        const { data: ordersData, error: ordersError } =
          await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', {
              ascending: false
            });

        if (ordersError) {
          throw ordersError;
        }

        if (!ordersData || ordersData.length === 0) {
          setOrders([]);
          setLoading(false);
          return;
        }

        // 2. Fetch status history for all orders
        const orderIds = ordersData.map(
          order => order.id
        );

        const { data: historyData, error: historyError } =
          await supabase
            .from('order_status_history')
            .select('*')
            .in('order_id', orderIds)
            .order('created_at', {
              ascending: true
            });

        if (historyError) {
          throw historyError;
        }

        // 3. Attach history to each order
        const formattedOrders = ordersData.map(order => {

          const history = (historyData || []).filter(
            item => item.order_id === order.id
          );

          return {
            ...order,
            history
          };

        });

        setOrders(formattedOrders);

        console.log(
          'MY ORDERS LOADED SUCCESSFULLY:',
          formattedOrders
        );

      } catch (err) {

        console.error(
          'MY ORDERS ERROR:',
          err
        );

        setError(
          err.message ||
          'Failed to load your orders'
        );

      } finally {

        setLoading(false);

      }

    };

    fetchMyOrders();

  }, [user]);

  // ------------------------------------------------
  // LOADING
  // ------------------------------------------------
  if (loading) {

    return (
      <div className="my-orders-page container empty-orders fade-in">

        <div className="loader"></div>

        <p>
          Loading your orders...
        </p>

      </div>
    );

  }

  // ------------------------------------------------
  // NOT LOGGED IN
  // ------------------------------------------------
  if (!user) {

    return (
      <div className="my-orders-page container empty-orders fade-in">

        <PackageSearch
          size={64}
          color="var(--accent-purple)"
          style={{
            marginBottom: '1.5rem'
          }}
        />

        <h2>
          Please Sign In
        </h2>

        <p>
          Sign in to view and track your orders.
        </p>

        <Link
          to="/login"
          className="btn-primary orders-shop-btn"
          style={{
            marginTop: '1.5rem'
          }}
        >
          Sign In
        </Link>

      </div>
    );

  }

  // ------------------------------------------------
  // ERROR
  // ------------------------------------------------
  if (error) {

    return (
      <div className="my-orders-page container empty-orders fade-in">

        <PackageSearch
          size={64}
          color="var(--accent-purple)"
          style={{
            marginBottom: '1.5rem'
          }}
        />

        <h2>
          Unable to Load Orders
        </h2>

        <p>
          {error}
        </p>

      </div>
    );

  }

  // ------------------------------------------------
  // NO ORDERS
  // ------------------------------------------------
  if (orders.length === 0) {

    return (
      <div className="my-orders-page container empty-orders fade-in">

        <PackageSearch
          size={64}
          color="var(--accent-purple)"
          style={{
            marginBottom: '1.5rem'
          }}
        />

        <h2>
          No Orders Yet
        </h2>

        <p>
          Once you place an order, you'll be able
          to track it here. Start shopping to get
          your first custom print!
        </p>

        <Link
          to="/shop"
          className="btn-primary orders-shop-btn"
          style={{
            marginTop: '1.5rem'
          }}
        >
          <ShoppingBag size={18} />
          Start Shopping
        </Link>

      </div>
    );

  }

  // ------------------------------------------------
  // STATUS ICON
  // ------------------------------------------------
  const getStatusIcon = (status) => {

    switch (status) {

      case 'Processing':
        return <Clock size={20} />;

      case 'Shipped':
        return <Truck size={20} />;

      case 'Delivered':
        return <CheckCircle size={20} />;

      case 'Cancelled':
        return <XCircle size={20} />;

      default:
        return <Circle size={20} />;

    }

  };

  return (

    <div className="my-orders-page container fade-in">

      {/* HEADER */}
      <div className="my-orders-header">

        <h1>
          My Orders
        </h1>

        <p>
          Track and manage your custom print orders.
        </p>

      </div>

      {/* ORDERS */}
      <div className="orders-list">

        {orders.map(order => (

          <div
            key={order.id}
            className="order-card"
          >

            {/* ORDER HEADER */}
            <div className="order-card-header">

              <span className="order-id">
                Order #
                {order.id
                  ?.slice(-8)
                  .toUpperCase()}
              </span>

              <span
                className={`order-status status-${(
                  order.order_status ||
                  'Processing'
                ).toLowerCase()}`}
              >
                {order.order_status ||
                  'Processing'}
              </span>

            </div>

            {/* ORDER INFO */}
            <div className="order-card-body">

              <div>

                <p className="order-date">
                  Placed on{' '}
                  {new Date(
                    order.created_at
                  ).toLocaleDateString(
                    'en-IN',
                    {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }
                  )}
                </p>

                <p className="order-total">
                  ₹
                  {Number(
                    order.total_amount || 0
                  ).toFixed(2)}
                </p>

              </div>

              <div className="order-payment">

                <span>
                  Payment
                </span>

                <strong>
                  {order.payment_status ||
                    'Pending'}
                </strong>

              </div>

            </div>

            {/* STATUS TIMELINE */}
            <div className="order-timeline">

              <h3>
                Order Status
              </h3>

              {order.history?.length > 0 ? (

                <div className="timeline">

                  {order.history.map(
                    (historyItem, index) => {

                      const isLast =
                        index ===
                        order.history.length - 1;

                      return (

                        <div
                          key={historyItem.id}
                          className={`timeline-item ${
                            isLast
                              ? 'active'
                              : 'completed'
                          }`}
                        >

                          <div className="timeline-icon">

                            {getStatusIcon(
                              historyItem.status
                            )}

                          </div>

                          {!isLast && (
                            <div className="timeline-line"></div>
                          )}

                          <div className="timeline-content">

                            <strong>
                              {historyItem.status}
                            </strong>

                            {historyItem.note && (
                              <p>
                                {historyItem.note}
                              </p>
                            )}

                            <small>
                              {new Date(
                                historyItem.created_at
                              ).toLocaleString(
                                'en-IN',
                                {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit'
                                }
                              )}
                            </small>

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              ) : (

                <div className="timeline-empty">

                  <Circle size={20} />

                  <span>
                    Status history not available yet.
                  </span>

                </div>

              )}

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};

export default MyOrders;