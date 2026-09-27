import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, Trash2, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressMessage, setAddressMessage] = useState('');

  // --------------------------------------------------
// COUPON
// --------------------------------------------------

const [couponCode, setCouponCode] = useState('');
const [appliedCoupon, setAppliedCoupon] = useState(null);
const [couponMessage, setCouponMessage] = useState('');
const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

// --------------------------------------------------
// SHIPPING SETTINGS
// --------------------------------------------------

const [shippingSettings, setShippingSettings] = useState(null);
const [isShippingLoading, setIsShippingLoading] = useState(true);

  const subtotal = getCartTotal();

const shipping = subtotal > 0 && shippingSettings
  ? subtotal >= Number(shippingSettings.free_shipping_threshold)
    ? 0
    : Number(shippingSettings.standard_shipping_fee)
  : 0;

const discountAmount = appliedCoupon
  ? Number(appliedCoupon.discount_amount || 0)
  : 0;

const total = Math.max(
  0,
  subtotal + shipping - discountAmount
);

  // --------------------------------------------------
  // GET CURRENT USER
  // --------------------------------------------------

  const getCurrentUser = async () => {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error) {
      console.error('AUTH USER ERROR:', error);
      return null;
    }

    return user;
  };

  // --------------------------------------------------
  // ADDRESS HELPERS
  // --------------------------------------------------

  const normalizeAddressValue = (value) =>
    String(value || '')
      .trim()
      .replace(/\\s+/g, ' ')
      .toLowerCase();

  const getAddressKey = (address) =>
    [
      address.full_name,
      address.phone,
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.postal_code,
      address.country || 'India'
    ]
      .map(normalizeAddressValue)
      .join('|');

  const isSameAddress = (addressA, addressB) =>
    getAddressKey(addressA) === getAddressKey(addressB);

  const buildAddressPayload = (userId) => ({
    user_id: userId,
    full_name: `${shippingData.firstName} ${shippingData.lastName}`.trim(),
    address_line1: shippingData.address.trim(),
    address_line2: shippingData.address2.trim() || null,
    phone: shippingData.phone.trim(),
    city: shippingData.city.trim(),
    state: shippingData.state.trim(),
    postal_code: shippingData.postalCode.trim(),
    country: shippingData.country.trim() || 'India'
  });

  // --------------------------------------------------
  // LOAD SHIPPING SETTINGS
  // --------------------------------------------------

  const fetchShippingSettings = async () => {
    try {
      setIsShippingLoading(true);

      const { data, error } = await supabase
        .from('shipping_settings')
        .select(`
          id,
          free_shipping_threshold,
          standard_shipping_fee,
          estimated_delivery_min_days,
          estimated_delivery_max_days
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('SHIPPING SETTINGS ERROR:', error);
        return;
      }

      setShippingSettings(data);

      console.log(
        'SHIPPING SETTINGS LOADED:',
        data
      );

    } catch (error) {
      console.error(
        'SHIPPING SETTINGS LOAD ERROR:',
        error
      );
    } finally {
      setIsShippingLoading(false);
    }
  };

  // --------------------------------------------------
// APPLY COUPON
// --------------------------------------------------

const handleApplyCoupon = async () => {
  const code = couponCode.trim();

  if (!code) {
    setCouponMessage('Please enter a coupon code.');
    return;
  }

  if (appliedCoupon) {
    setCouponMessage('Remove the current coupon before applying another.');
    return;
  }

  setIsApplyingCoupon(true);
  setCouponMessage('');

  try {
    const { data, error } = await supabase.rpc(
      'validate_coupon',
      {
        p_code: code,
        p_order_amount: Number(subtotal.toFixed(2))
      }
    );

    if (error) {
      console.error('COUPON VALIDATION ERROR:', error);
      throw error;
    }

    if (!data?.valid) {
      setCouponMessage(
        data?.message || 'Invalid coupon code.'
      );
      return;
    }

    setAppliedCoupon(data);
    setCouponCode(data.code);

    setCouponMessage(
      `Coupon applied successfully! You saved ₹${Number(
        data.discount_amount
      ).toFixed(2)}.`
    );

  } catch (error) {
    console.error('COUPON ERROR:', error);

    setCouponMessage(
      'Unable to validate coupon. Please try again.'
    );
  } finally {
    setIsApplyingCoupon(false);
  }
};
// --------------------------------------------------
// REMOVE COUPON
// --------------------------------------------------

const handleRemoveCoupon = () => {
  setAppliedCoupon(null);
  setCouponCode('');
  setCouponMessage('');
};

  // --------------------------------------------------
  // LOAD SAVED ADDRESSES
  // --------------------------------------------------

  const fetchSavedAddresses = async () => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('ADDRESS FETCH ERROR:', error);
        return;
      }

      // Keep only one copy of each address ID.
      // This prevents duplicate React keys if the same address is returned
      // more than once during a refresh/re-render.
      const uniqueAddresses = Array.from(
        new Map((data || []).map(address => [address.id, address])).values()
      );

      setSavedAddresses(uniqueAddresses);

      // Load default address automatically.
      // The user's email is not stored in the addresses table,
      // so keep the authenticated email in the checkout form.
      const defaultAddress = uniqueAddresses.find(
        address => address.is_default === true
      );

      if (defaultAddress) {
        handleAddressSelect(defaultAddress, user.email || '');
      }
    } catch (error) {
      console.error('ADDRESS LOAD ERROR:', error);
    }
  };

  useEffect(() => {
    fetchSavedAddresses();
    fetchShippingSettings();
  }, []);

  // --------------------------------------------------
  // INPUT CHANGE
  // --------------------------------------------------

  const handleInputChange = (e) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value
    });

    // Once user edits form manually, selected saved address
    // is no longer treated as the exact current form.
    setSelectedAddressId('');
  };

  // --------------------------------------------------
  // SELECT SAVED ADDRESS
  // --------------------------------------------------

  const handleAddressSelect = (address, emailOverride = '') => {
    const nameParts = (address.full_name || '').trim().split(/\\s+/);

    setSelectedAddressId(address.id);

    setShippingData({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: emailOverride || shippingData.email || '',
      phone: address.phone || '',
      address: address.address_line1 || '',
      address2: address.address_line2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postal_code || '',
      country: address.country || 'India'
    });

    setAddressMessage('');
  };

  // --------------------------------------------------
  // SAVE ADDRESS
  // --------------------------------------------------

  const handleSaveAddress = async () => {
    setIsSavingAddress(true);
    setAddressMessage('');

    try {
      const user = await getCurrentUser();

      if (!user) {
        navigate('/login');
        return;
      }

      const fullName = `${shippingData.firstName} ${shippingData.lastName}`
        .trim();

      if (
        !fullName ||
        !shippingData.phone ||
        !shippingData.address ||
        !shippingData.city ||
        !shippingData.state ||
        !shippingData.postalCode
      ) {
        setAddressMessage('Please fill all required address fields.');
        return;
      }

      const currentAddress = buildAddressPayload(user.id);

      // Find an exact match, ignoring capitalization and extra spaces.
      const existingDuplicate = savedAddresses.find((address) => {
        if (selectedAddressId && address.id === selectedAddressId) {
          return false;
        }

        return isSameAddress(address, currentAddress);
      });

      if (existingDuplicate) {
        setSelectedAddressId(existingDuplicate.id);
        handleAddressSelect(existingDuplicate, user.email || '');

        setAddressMessage(
          'This address is already saved. It has been selected for you.'
        );

        return;
      }

      // ----------------------------------------------
      // UPDATE EXISTING ADDRESS
      // ----------------------------------------------

      if (selectedAddressId) {
        const { error } = await supabase
          .from('addresses')
          .update({
            full_name: currentAddress.full_name,
            address_line1: currentAddress.address_line1,
            address_line2: currentAddress.address_line2,
            phone: currentAddress.phone,
            city: currentAddress.city,
            state: currentAddress.state,
            postal_code: currentAddress.postal_code,
            country: currentAddress.country,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedAddressId)
          .eq('user_id', user.id);

        if (error) throw error;

        setAddressMessage('Address updated successfully!');
      }

      // ----------------------------------------------
      // CREATE NEW ADDRESS
      // ----------------------------------------------

      else {
        const shouldBeDefault = savedAddresses.length === 0;

        const { data, error } = await supabase
          .from('addresses')
          .insert([
            {
              ...currentAddress,
              is_default: shouldBeDefault
            }
          ])
          .select()
          .single();

        if (error) throw error;

        setSelectedAddressId(data.id);
        setAddressMessage('New address saved successfully!');
      }

      await fetchSavedAddresses();
    } catch (error) {
      console.error('ADDRESS SAVE ERROR:', error);
      setAddressMessage(
        error?.code === '23505'
          ? 'This address is already saved.'
          : 'Unable to save address.'
      );
    } finally {
      setIsSavingAddress(false);
    }
  };

  // --------------------------------------------------
  // DELETE ADDRESS
  // --------------------------------------------------

  const handleDeleteAddress = async (addressId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this address?'
    );

    if (!confirmed) return;

    try {
      const user = await getCurrentUser();

      if (!user) return;

      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedAddresses(prev =>
        prev.filter(address => address.id !== addressId)
      );

      if (selectedAddressId === addressId) {
        setSelectedAddressId('');
      }

      setAddressMessage('Address deleted successfully!');

      await fetchSavedAddresses();
    } catch (error) {
      console.error('ADDRESS DELETE ERROR:', error);
      setAddressMessage('Unable to delete address.');
    }
  };

  // --------------------------------------------------
  // SET DEFAULT ADDRESS
  // --------------------------------------------------

  const handleSetDefault = async (addressId) => {
    try {
      const user = await getCurrentUser();

      if (!user) return;

      // Remove default from all user's addresses
      const { error: resetError } = await supabase
        .from('addresses')
        .update({
          is_default: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (resetError) throw resetError;

      // Set selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({
          is_default: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;

      setAddressMessage('Default address updated!');

      await fetchSavedAddresses();
    } catch (error) {
      console.error('DEFAULT ADDRESS ERROR:', error);
      setAddressMessage('Unable to set default address.');
    }
  };

  // --------------------------------------------------
  // RAZORPAY SCRIPT
  // --------------------------------------------------

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
        return;
      }

      const script = document.createElement('script');

      script.src = 'https://checkout.razorpay.com/v1/checkout.js';

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // --------------------------------------------------
  // CHECKOUT / CREATE ORDER + RAZORPAY TEST PAYMENT
  // --------------------------------------------------

  const isValidUUID = (value) => {
    return typeof value === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  };

  const saveCurrentAddressForOrder = async (user) => {
    // Use the saved address selected by the customer.
    if (selectedAddressId) {
      return selectedAddressId;
    }

    const fullName = `${shippingData.firstName} ${shippingData.lastName}`.trim();

    if (
      !fullName ||
      !shippingData.phone ||
      !shippingData.address ||
      !shippingData.city ||
      !shippingData.state ||
      !shippingData.postalCode
    ) {
      throw new Error('Please fill all required shipping address fields.');
    }

    const currentAddress = buildAddressPayload(user.id);

    // Reuse an existing identical address instead of creating a duplicate.
    const existingAddress = savedAddresses.find((address) =>
      isSameAddress(address, currentAddress)
    );

    if (existingAddress) {
      setSelectedAddressId(existingAddress.id);
      return existingAddress.id;
    }

    // Create a database row only when this is genuinely a new address.
    const { data: address, error: addressError } = await supabase
      .from('addresses')
      .insert([
        {
          ...currentAddress,
          is_default: savedAddresses.length === 0
        }
      ])
      .select()
      .single();

    if (addressError) {
      if (addressError.code === '23505') {
        const { data: refreshedAddresses, error: refreshError } =
          await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });

        if (refreshError) throw refreshError;

        const duplicate = (refreshedAddresses || []).find((item) =>
          isSameAddress(item, currentAddress)
        );

        if (duplicate) {
          setSavedAddresses(refreshedAddresses || []);
          setSelectedAddressId(duplicate.id);
          return duplicate.id;
        }
      }

      throw addressError;
    }

    setSavedAddresses(prev => [address, ...prev]);
    setSelectedAddressId(address.id);

    return address.id;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (isProcessing) return;

    setIsProcessing(true);

    let createdOrder = null;

    try {
      const user = await getCurrentUser();

      if (!user) {
        alert('Please login to place an order');
        navigate('/login');
        return;
      }

      if (!cartItems.length) {
        throw new Error('Your cart is empty.');
      }

      // ------------------------------------------------
      // 1. GET / CREATE SHIPPING ADDRESS
      // ------------------------------------------------
      const addressId = await saveCurrentAddressForOrder(user);

      // ------------------------------------------------
      // 2. CREATE INTERNAL ORDER
      // ------------------------------------------------
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            address_id: addressId,
            total_amount: Number(total.toFixed(2)),
            coupon_id: appliedCoupon?.coupon_id || null,
            coupon_code: appliedCoupon?.code || null,
            discount_amount: Number(discountAmount.toFixed(2)),
            order_status: 'Processing',
            payment_status: 'Pending',
            payment_method: 'Razorpay'
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      createdOrder = order;

      console.log('ORDER CREATED SUCCESSFULLY:', order);

      // ------------------------------------------------
      // 3. CREATE INITIAL ORDER STATUS HISTORY
      // ------------------------------------------------
      const { data: initialStatusHistory, error: statusHistoryError } =
        await supabase
          .from('order_status_history')
          .insert([
            {
              order_id: order.id,
              status: 'Processing',
              note: 'Order created. Waiting for Razorpay payment.',
              changed_by: user.id
            }
          ])
          .select()
          .single();

      if (statusHistoryError) throw statusHistoryError;

      console.log(
        'INITIAL ORDER STATUS HISTORY CREATED:',
        initialStatusHistory
      );

      // ------------------------------------------------
      // 4. CREATE ORDER ITEMS
      // ------------------------------------------------
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: isValidUUID(String(item.id)) ? item.id : null,
        product_name: item.name || 'Product',
        product_price: Number(item.price) || 0,
        quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1),
        variant_color:
          item.variant_color ||
          item.variantColor ||
          item.color ||
          item.variant?.color ||
          null,
        variant_size:
          item.variant_size ||
          item.variantSize ||
          item.size ||
          item.variant?.size ||
          null
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      if (itemsError) throw itemsError;

      console.log('ORDER ITEMS CREATED SUCCESSFULLY:', insertedItems);

      // ------------------------------------------------
      // 5. LOAD RAZORPAY CHECKOUT
      // ------------------------------------------------
      const razorpayLoaded = await loadRazorpayScript();

      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error('Razorpay Checkout could not be loaded.');
      }

      // ------------------------------------------------
      // 6. CREATE RAZORPAY ORDER VIA EDGE FUNCTION
      // ------------------------------------------------
      const { data: razorpayOrder, error: razorpayFunctionError } =
        await supabase.functions.invoke('create-razorpay-order', {
          body: {
            order_id: order.id,
            amount: Number(total.toFixed(2)),
            currency: 'INR',
            receipt: `VZ-${order.id.slice(0, 8)}`
          }
        });

      if (razorpayFunctionError) {
        console.error(
          'RAZORPAY EDGE FUNCTION ERROR:',
          razorpayFunctionError
        );

        let serverErrorMessage =
          'Unable to create Razorpay payment order. Please try again.';

        // Supabase FunctionsHttpError can contain the actual Edge
        // Function JSON response inside `context`.
        try {
          const response = razorpayFunctionError?.context;

          if (response && typeof response.clone === 'function') {
            const errorBody = await response.clone().json();

            if (errorBody?.error) {
              serverErrorMessage = errorBody.error;
            }
          }
        } catch (responseReadError) {
          console.warn(
            'Could not read Razorpay Edge Function error response:',
            responseReadError
          );
        }

        throw new Error(serverErrorMessage);
      }

      console.log('RAZORPAY ORDER RESPONSE:', razorpayOrder);

      const razorpayOrderId =
        razorpayOrder?.razorpay_order_id ||
        razorpayOrder?.order_id ||
        razorpayOrder?.id;

      const razorpayKeyId =
        razorpayOrder?.key_id ||
        razorpayOrder?.razorpay_key_id;

      // The payment amount must come only from the server.
      // Never fall back to the frontend-calculated total.
      const razorpayAmount = Number(razorpayOrder?.amount);

      if (!Number.isFinite(razorpayAmount) || razorpayAmount <= 0) {
        throw new Error('Invalid Razorpay amount returned by server.');
      }

      const razorpayCurrency =
        razorpayOrder?.currency || 'INR';

      if (!razorpayOrderId) {
        throw new Error('Razorpay order ID was not returned by the server.');
      }

      if (!razorpayKeyId) {
        throw new Error('Razorpay Key ID was not returned by the server.');
      }

      // Save the gateway order ID against our internal order.
      const { error: razorpayOrderSaveError } = await supabase
        .from('orders')
        .update({
          razorpay_order_id: razorpayOrderId
        })
        .eq('id', order.id)
        .eq('user_id', user.id);

      if (razorpayOrderSaveError) {
        throw razorpayOrderSaveError;
      }

      setCreatedOrderId(order.id);

      // ------------------------------------------------
      // 7. OPEN RAZORPAY CHECKOUT
      // ------------------------------------------------
      const options = {
        key: razorpayKeyId,
        amount: razorpayAmount,
        currency: razorpayCurrency,
        name: 'VERZ',
        description: `Order VZ-${order.id.slice(0, 8).toUpperCase()}`,
        order_id: razorpayOrderId,

        prefill: {
          name: `${shippingData.firstName} ${shippingData.lastName}`.trim(),
          email: shippingData.email || user.email || '',
          contact: shippingData.phone || ''
        },

        notes: {
          internal_order_id: order.id
        },

        theme: {
          color: '#00f5ff'
        },

        handler: async function (response) {
          try {
            console.log('RAZORPAY PAYMENT RESPONSE:', response);

            // --------------------------------------------
            // 1. SAVE PAYMENT DETAILS
            // --------------------------------------------

            const { error: paymentSaveError } = await supabase
              .from('orders')
              .update({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
              .eq('id', order.id)
              .eq('user_id', user.id);

            if (paymentSaveError) {
              throw paymentSaveError;
            }

            // --------------------------------------------
            // 2. VERIFY PAYMENT ON SERVER
            // --------------------------------------------

            console.log('VERIFYING PAYMENT ON SERVER...');

            const {
              data: verificationResult,
              error: verificationError
            } = await supabase.functions.invoke(
              'verify-razorpay-payment',
              {
                body: {
                  order_id: order.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                }
              }
            );

            if (verificationError) {
              console.error(
                'PAYMENT VERIFICATION FUNCTION ERROR:',
                verificationError
              );

              throw new Error(
                'Payment verification failed. Please contact support.'
              );
            }

            console.log(
              'PAYMENT VERIFICATION RESPONSE:',
              verificationResult
            );

            // --------------------------------------------
            // 3. CHECK SERVER VERIFICATION
            // --------------------------------------------

            if (
              !verificationResult?.success ||
              !verificationResult?.verified ||
              verificationResult?.payment_status !== 'Paid'
            ) {
              throw new Error(
                verificationResult?.error ||
                'Payment could not be verified.'
              );
            }

            // --------------------------------------------
            // 4. PAYMENT VERIFIED SUCCESSFULLY
            // --------------------------------------------

            console.log(
              'PAYMENT VERIFIED SUCCESSFULLY:',
              order.id
            );

            setCreatedOrderId(order.id);
            setIsProcessing(false);

            // Clear cart ONLY after server verification.
            clearCart();

            setIsSuccess(true);
          } catch (paymentError) {
            console.error(
              'RAZORPAY PAYMENT VERIFICATION ERROR:',
              paymentError
            );

            setIsProcessing(false);

            alert(
              paymentError?.message ||
              'Payment was received, but verification failed. Please contact support with your order ID.'
            );
          }
        },

        modal: {
          ondismiss: function () {
            console.log('RAZORPAY CHECKOUT CLOSED');

            setIsProcessing(false);

            alert(
              'Payment was cancelled or the Razorpay window was closed. Your order remains pending.'
            );
          }
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', function (response) {
        console.error('RAZORPAY PAYMENT FAILED:', response?.error);

        setIsProcessing(false);

        alert(
          response?.error?.description ||
          'Payment failed. Please try again.'
        );
      });

      razorpay.open();
    } catch (err) {
      console.error('CHECKOUT ERROR:', err);

      // If an internal order was created but Razorpay setup failed,
      // leave its payment_status as Pending so it can be investigated.
      if (createdOrder?.id) {
        console.warn(
          'Order remains Pending:',
          createdOrder.id
        );
      }

      alert(
        err?.message ||
        'Something went wrong during checkout. Check console for details.'
      );

      setIsProcessing(false);
    }
  };

  // --------------------------------------------------
  // SUCCESS SCREEN
  // --------------------------------------------------

  if (isSuccess) {
    return (
      <div className="checkout-page container success-view fade-in">
        <div className="glass success-card">
          <CheckCircle size={64} color="var(--accent-cyan)" />

          <h2>Payment Submitted!</h2>

          <p>
            Your order #
            {createdOrderId
              ? `VZ-${createdOrderId.slice(0, 8).toUpperCase()}`
              : 'VZ-CONFIRMED'}
            has been submitted to Razorpay and is awaiting server verification.
          </p>

          <p>
            Payment verification will be completed securely on the server.
          </p>

          <button
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // EMPTY CART
  // --------------------------------------------------

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="checkout-page container fade-in">

      <h1 className="checkout-title">
        Secure Checkout
      </h1>

      <div className="checkout-layout">

        <form
          className="checkout-form"
          onSubmit={handleCheckout}
        >

          {/* ------------------------------------------
              SAVED ADDRESSES
          ------------------------------------------ */}

          {savedAddresses.length > 0 && (
            <div className="form-section glass">

              <h2>Saved Addresses</h2>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >

                {savedAddresses.map((address) => (

                  <div
                    key={address.id}
                    onClick={() => handleAddressSelect(address)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleAddressSelect(address);
                      }
                    }}
                    style={{
                      padding: '16px',
                      border:
                        selectedAddressId === address.id
                          ? '2px solid var(--accent-cyan)'
                          : '1px solid #444',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease, background 0.2s ease'
                    }}
                  >

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddressSelect(address);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >

                      <strong>
                        {address.full_name}
                      </strong>

                      {address.is_default && (
                        <span style={{ marginLeft: '8px' }}>
                          ★ Default
                        </span>
                      )}

                      <br />

                      {address.address_line1}

                      {address.address_line2 && (
                        <>
                          {', '}
                          {address.address_line2}
                        </>
                      )}

                      <br />

                      {address.city}, {address.state}

                      {' - '}

                      {address.postal_code}

                      <br />

                      {address.country}

                      <br />

                      📞 {address.phone}

                    </button>

                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                        marginTop: '12px'
                      }}
                    >

                      {!address.is_default && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(address.id);
                          }}
                        >
                          <Star size={16} />
                          Set Default
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(address.id);
                        }}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </div>
          )}

          {/* ------------------------------------------
              SHIPPING INFORMATION
          ------------------------------------------ */}

          <div className="form-section glass">

            <h2>Shipping Information</h2>

            <div className="form-grid">

              <div className="form-group">

                <label>First Name</label>

                <input
                  type="text"
                  name="firstName"
                  required
                  placeholder="John"
                  onChange={handleInputChange}
                  value={shippingData.firstName}
                />

              </div>

              <div className="form-group">

                <label>Last Name</label>

                <input
                  type="text"
                  name="lastName"
                  required
                  placeholder="Doe"
                  onChange={handleInputChange}
                  value={shippingData.lastName}
                />

              </div>

              <div className="form-group full-width">

                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  required
                  placeholder="john@example.com"
                  onChange={handleInputChange}
                  value={shippingData.email}
                />

              </div>

              <div className="form-group full-width">

                <label>Phone</label>

                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="9876543210"
                  onChange={handleInputChange}
                  value={shippingData.phone}
                />

              </div>

              <div className="form-group full-width">

                <label>Address Line 1</label>

                <input
                  type="text"
                  name="address"
                  required
                  placeholder="123 Neon Street"
                  onChange={handleInputChange}
                  value={shippingData.address}
                />

              </div>

              <div className="form-group full-width">

                <label>Address Line 2</label>

                <input
                  type="text"
                  name="address2"
                  placeholder="Apartment, Floor, Landmark"
                  onChange={handleInputChange}
                  value={shippingData.address2}
                />

              </div>

              <div className="form-group">

                <label>City</label>

                <input
                  type="text"
                  name="city"
                  required
                  placeholder="Jaipur"
                  onChange={handleInputChange}
                  value={shippingData.city}
                />

              </div>

              <div className="form-group">

                <label>State</label>

                <input
                  type="text"
                  name="state"
                  required
                  placeholder="Rajasthan"
                  onChange={handleInputChange}
                  value={shippingData.state}
                />

              </div>

              <div className="form-group">

                <label>Postal Code</label>

                <input
                  type="text"
                  name="postalCode"
                  required
                  placeholder="303303"
                  onChange={handleInputChange}
                  value={shippingData.postalCode}
                />

              </div>

              <div className="form-group">

                <label>Country</label>

                <input
                  type="text"
                  name="country"
                  required
                  value={shippingData.country}
                  onChange={handleInputChange}
                />

              </div>

            </div>

            {/* SAVE ADDRESS */}

            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveAddress}
              disabled={isSavingAddress}
              style={{ marginTop: '20px' }}
            >
              {isSavingAddress
                ? 'Saving Address...'
                : selectedAddressId
                  ? 'Update Address'
                  : 'Save Address'}
            </button>

            {addressMessage && (
              <p style={{ marginTop: '15px' }}>
                {addressMessage}
              </p>
            )}

          </div>

          {/* ------------------------------------------
              PAYMENT
          ------------------------------------------ */}

          <div className="form-section glass">

            <h2>
              Payment Method <CreditCard size={20} />
            </h2>

            <p className="payment-note">
              Secured by Razorpay. Pay with UPI, Cards,
              Netbanking or Wallets.
            </p>

            <div className="payment-secure-badge">

              <span>
                🔒 SSL Secured
              </span>

              <span>
                💳 Multiple Payment Options
              </span>

            </div>

          </div>

          <button
            type="submit"
            className="btn-primary place-order-btn"
            disabled={isProcessing}
          >
            {isProcessing
              ? 'Processing Payment...'
              : `Pay ₹${total.toFixed(2)}`}
          </button>

        </form>

        {/* ------------------------------------------
            ORDER SUMMARY
        ------------------------------------------ */}

        <div className="order-summary glass">

          <h3>Order Details</h3>

          <div className="summary-items">

            {cartItems.map((item, index) => (

              <div
                key={`${item.id}-${index}`}
                className="summary-item"
              >

                <div className="item-img">

                  <img
                    src={item.image}
                    alt={item.name}
                  />

                  <span className="item-qty">
                    {item.quantity}
                  </span>

                </div>

                <div className="item-info">

                  <h4>
                    {item.name}
                  </h4>

                  <p>
                    ₹{item.price.toFixed(2)}
                  </p>

                </div>

              </div>

            ))}

          </div>

          <div className="summary-totals">

            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <span>
                ₹{subtotal.toFixed(2)}
              </span>

            </div>

            <div className="summary-row">

              <span>
                Shipping
              </span>

              <span>
                {isShippingLoading
                  ? 'Calculating...'
                  : shipping === 0
                    ? 'FREE'
                    : `₹${shipping.toFixed(2)}`}
              </span>

            </div>

            {shippingSettings && (
              <div
                style={{
                  fontSize: '13px',
                  opacity: 0.7,
                  marginTop: '6px',
                  lineHeight: '1.6'
                }}
              >
                {shipping === 0 && (
                  <div>
                    Free shipping on orders above ₹{Number(
                      shippingSettings.free_shipping_threshold
                    ).toFixed(0)}
                  </div>
                )}

                <div>
                  Estimated delivery: {
                    shippingSettings.estimated_delivery_min_days
                  }–{
                    shippingSettings.estimated_delivery_max_days
                  } days
                </div>
              </div>
            )}

            {/* ------------------------------------------
                COUPON
            ------------------------------------------ */}

            <div
              className="coupon-section"
              style={{
                marginTop: '20px',
                marginBottom: '20px',
                padding: '16px',
                border: '1px solid #444',
                borderRadius: '10px'
              }}
            >
              <h4 style={{ marginBottom: '12px' }}>
                Have a Coupon?
              </h4>

              {!appliedCoupon ? (
                <div
                  style={{
                    display: 'flex',
                    gap: '8px'
                  }}
                >
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    placeholder="Enter coupon code"
                    disabled={isApplyingCoupon}
                    style={{
                      flex: 1,
                      padding: '10px'
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon}
                  >
                    {isApplyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span>
                    🎟️ <strong>{appliedCoupon.code}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponMessage && (
                <p
                  style={{
                    marginTop: '10px',
                    fontSize: '14px'
                  }}
                >
                  {couponMessage}
                </p>
              )}
            </div>

            {appliedCoupon && (
              <div className="summary-row">

                <span>
                  Discount ({appliedCoupon.code})
                </span>

                <span>
                  -₹{discountAmount.toFixed(2)}
                </span>

              </div>
            )}

            <div className="summary-row final-total">

              <span>
                Total
              </span>

              <span>
                ₹{total.toFixed(2)}
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Checkout;