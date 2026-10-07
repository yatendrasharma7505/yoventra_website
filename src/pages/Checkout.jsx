import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Plus,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export function Checkout() {
  const { lines, subtotal, clearCart } = useCart();
  const { isLoggedIn, customer, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const couponCode = location.state?.appliedCouponCode || null;
  const couponDiscount = location.state?.discountAmount || 0;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // New address state
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    line: '',
    city: '',
    state: '',
    pin: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cod'
  const [serviceability, setServiceability] = useState({
    checked: false,
    serviceable: true,
    codAvailable: true,
    prepaidAvailable: true,
    message: null,
  });

  const [checkoutTotals, setCheckoutTotals] = useState({
    loading: false,
    baseAmount: 0,
    discountAmount: 0,
    prepaidShipping: 0,
    codShipping: 0,
    onlineTotal: 0,
    codTotal: 0,
    onlineSaving: 0,
    loaded: false,
  });

  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      openAuthModal('Please login to complete your order');
      return;
    }

    async function loadAddresses() {
      setLoadingAddresses(true);
      try {
        const res = await api.getAddresses();
        const list = Array.isArray(res) ? res : res?.items || res?.addresses || [];
        setAddresses(list);
        if (list.length > 0) {
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(defaultAddr.id || defaultAddr._id);
          setShowNewAddressForm(false);
        } else {
          setShowNewAddressForm(true);
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    }
    loadAddresses();
  }, [isLoggedIn]);

  useEffect(() => {
    if (customer) {
      setNewAddress((prev) => ({
        ...prev,
        name: prev.name || customer.name || '',
        phone: prev.phone || customer.phone || '',
      }));
    }
  }, [customer]);

  const selectedAddress = addresses.find(
    (a) => (a.id || a._id) === selectedAddressId
  );

  // Check serviceability and fetch accurate server checkout totals whenever address or cart changes
  useEffect(() => {
    if (!selectedAddress?.pin) return;

    let cancelled = false;

    async function checkDeliveryAndTotals() {
      // 1. Check Delhivery serviceability
      try {
        const res = await api.checkPincodeServiceability(selectedAddress.pin);
        if (!cancelled) {
          if (res?.serviceable) {
            setServiceability({
              checked: true,
              serviceable: true,
              codAvailable: res.codAvailable ?? true,
              prepaidAvailable: res.prepaidAvailable ?? true,
              message: null,
            });
          } else {
            setServiceability({
              checked: true,
              serviceable: false,
              codAvailable: false,
              prepaidAvailable: false,
              message: res?.message || 'Delivery is currently not available to this pincode.',
            });
          }
        }
      } catch {
        if (!cancelled) {
          setServiceability({
            checked: true,
            serviceable: true,
            codAvailable: true,
            prepaidAvailable: true,
            message: null,
          });
        }
      }

      // 2. Fetch server-calculated shipping rates & totals from Delhivery
      if (lines.length > 0) {
        setCheckoutTotals((prev) => ({ ...prev, loading: true }));
        try {
          const payload = {
            items: lines.map((l) => ({
              productId: l.product.id || l.product._id,
              qty: Number(l.qty) || 1,
              size: l.size || undefined,
              customization: l.customization || undefined,
            })),
            address: {
              name: selectedAddress.name,
              phone: selectedAddress.phone,
              line: selectedAddress.line,
              city: selectedAddress.city,
              state: selectedAddress.state || '',
              pin: selectedAddress.pin.replace(/\D/g, ''),
            },
            couponCode: couponCode || undefined,
          };

          const totalsRes = await api.getCheckoutTotals(payload);
          if (!cancelled && totalsRes) {
            setCheckoutTotals({
              loading: false,
              baseAmount: Number(totalsRes.baseAmount) || subtotal,
              discountAmount: Number(totalsRes.discountAmount) || 0,
              prepaidShipping: Number(totalsRes.prepaidShipping) || 0,
              codShipping: Number(totalsRes.codShipping) || 0,
              onlineTotal: Number(totalsRes.onlineTotal) || subtotal,
              codTotal: Number(totalsRes.codTotal) || subtotal,
              onlineSaving: Number(totalsRes.onlineSaving) || 0,
              loaded: true,
            });
          }
        } catch (err) {
          console.error('Failed to load checkout totals:', err);
          if (!cancelled) {
            setCheckoutTotals((prev) => ({ ...prev, loading: false }));
          }
        }
      }
    }

    checkDeliveryAndTotals();
    return () => {
      cancelled = true;
    };
  }, [selectedAddress, lines, couponCode]);

  const hasCustomBuild = lines.some(
    (l) => l.customization || l.product?.customizable || l.product?.requiresPersonalisation
  );

  useEffect(() => {
    if (hasCustomBuild && paymentMethod === 'cod') {
      setPaymentMethod('online');
    }
  }, [hasCustomBuild, paymentMethod]);

  const prepaidShipping = checkoutTotals.loaded ? checkoutTotals.prepaidShipping : 0;
  const codShipping = checkoutTotals.loaded ? checkoutTotals.codShipping : 0;
  const onlineTotal = checkoutTotals.loaded ? checkoutTotals.onlineTotal : Math.max(0, subtotal - couponDiscount);
  const codTotal = checkoutTotals.loaded ? checkoutTotals.codTotal : Math.max(0, subtotal - couponDiscount);
  const currentShipping = paymentMethod === 'online' ? prepaidShipping : codShipping;
  const payableAmount = paymentMethod === 'online' ? onlineTotal : codTotal;
  const onlineSaving = checkoutTotals.onlineSaving || 0;

  const handleSaveNewAddress = async (e) => {
    if (e) e.preventDefault();
    if (!newAddress.name?.trim() || !newAddress.phone?.trim() || !newAddress.line?.trim() || !newAddress.city?.trim() || !newAddress.pin?.trim()) {
      setError('Please fill in all required address fields (Name, Phone, Address, City, PIN).');
      return null;
    }
    const cleanPhone = newAddress.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return null;
    }
    const cleanPin = newAddress.pin.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setError('Please enter a valid 6-digit PIN code.');
      return null;
    }

    setPlacingOrder(true);
    setError(null);
    try {
      const res = await api.addAddress({
        ...newAddress,
        name: newAddress.name.trim(),
        phone: cleanPhone,
        line: newAddress.line.trim(),
        city: newAddress.city.trim(),
        state: (newAddress.state || '').trim(),
        pin: cleanPin,
      });
      const saved = res?.address || res;
      setAddresses((prev) => [...prev, saved]);
      setSelectedAddressId(saved.id || saved._id);
      setShowNewAddressForm(false);
      return saved;
    } catch (err) {
      setError(err.message || 'Failed to save address.');
      return null;
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    let addressToUse = selectedAddress;

    // If no address selected or currently filling the new address form, auto-save and use it
    if (!addressToUse) {
      if (showNewAddressForm) {
        addressToUse = await handleSaveNewAddress();
        if (!addressToUse) return; // Validation error already set
      } else {
        setError('Please select or add a delivery address.');
        return;
      }
    }

    if (serviceability.checked && !serviceability.serviceable) {
      setError('Delivery is not available to your selected address PIN code.');
      return;
    }

    if (paymentMethod === 'cod' && !serviceability.codAvailable) {
      setError('Cash on Delivery is not available for this location. Please use Online Payment.');
      return;
    }

    if (paymentMethod === 'cod' && hasCustomBuild) {
      setError('Personalized custom gifts are made to order and can only be paid online.');
      return;
    }

    const items = lines.map((l) => ({
      productId: l.product.id || l.product._id,
      qty: Number(l.qty) || 1,
      size: l.size || undefined,
      customization: l.customization || undefined,
    }));

    const isCustomOrder = items.some((i) => i.customization);

    const customerObj = {
      name: addressToUse.name || customer?.name || 'Customer',
      phone: addressToUse.phone || customer?.phone || '',
      email: customer?.email || '',
    };

    // Make sure we have the exact server-calculated amount
    let finalAmount = payableAmount;
    if (!checkoutTotals.loaded) {
      try {
        const quote = await api.getCheckoutTotals({
          items,
          address: {
            name: addressToUse.name,
            phone: addressToUse.phone,
            line: addressToUse.line,
            city: addressToUse.city,
            state: addressToUse.state || '',
            pin: addressToUse.pin.replace(/\D/g, ''),
          },
          couponCode: couponCode || undefined,
        });
        if (quote) {
          finalAmount = paymentMethod === 'online' ? Number(quote.onlineTotal) : Number(quote.codTotal);
        }
      } catch {}
    }

    const orderPayload = {
      customer: customerObj,
      address: {
        name: addressToUse.name,
        phone: addressToUse.phone,
        line: addressToUse.line,
        city: addressToUse.city,
        state: addressToUse.state || '',
        pin: addressToUse.pin.replace(/\D/g, ''),
      },
      items,
      type: isCustomOrder ? 'custom' : 'readymade',
      couponCode: couponCode || undefined,
      amount: finalAmount,
      walletAmount: 0,
    };

    setPlacingOrder(true);
    setError(null);

    // Flow 1: Cash on Delivery (COD)
    if (paymentMethod === 'cod') {
      try {
        const res = await api.placeCodOrder(orderPayload);
        const orderId = res?.order?.id || res?.order?._id || res?.order?.orderNumber;
        clearCart();
        navigate(`/order-success/${orderId}`, { state: { order: res.order } });
      } catch (err) {
        setError(err.message || 'Failed to place COD order. Please try again.');
        setPlacingOrder(false);
      }
      return;
    }

    // Flow 2: Online Payment via Razorpay
    try {
      const checkoutRes = await api.createRazorpayCheckout(orderPayload);
      const { keyId, razorpayOrderId, amount, currency } = checkoutRes;

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please refresh the page and try again.');
      }

      const options = {
        key: keyId,
        amount,
        currency: currency || 'INR',
        order_id: razorpayOrderId,
        name: 'Yoventra',
        description: 'Authentic Fashion & Custom Gifts',
        image: '/logo.png',
        prefill: {
          name: addressToUse.name,
          contact: addressToUse.phone,
          email: customer?.email || '',
        },
        theme: {
          color: '#F4592A', // Yoventra Accent Orange
        },
        modal: {
          ondismiss: async () => {
            setPlacingOrder(false);
            try {
              await api.releaseRazorpayCheckout(razorpayOrderId);
            } catch {}
          },
        },
        handler: async (response) => {
          try {
            const verifyPayload = {
              ...orderPayload,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            };

            const verifyRes = await api.verifyRazorpayPayment(verifyPayload);
            const orderId = verifyRes?.order?.id || verifyRes?.order?._id || verifyRes?.order?.orderNumber;
            clearCart();
            navigate(`/order-success/${orderId}`, { state: { order: verifyRes.order } });
          } catch (verifyErr) {
            setError(verifyErr.message || 'Payment verification failed. Please contact support.');
            setPlacingOrder(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (failRes) {
        setError(failRes.error?.description || 'Payment failed. Please try again.');
        setPlacingOrder(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Failed to initiate Razorpay payment.');
      setPlacingOrder(false);
    }
  };

  if (lines.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-black font-display text-foreground">Checkout</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-danger-bg p-4 text-sm font-semibold text-danger border border-danger/20">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Address Selection & Payment Option (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Delivery Address */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                <h2 className="text-base font-extrabold text-foreground">Delivery Address</h2>
              </div>
              {!showNewAddressForm && (
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs font-bold text-accent flex items-center gap-1 hover:underline"
                >
                  <Plus className="h-4 w-4" /> Add New
                </button>
              )}
            </div>

            {loadingAddresses ? (
              <div className="py-6 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : showNewAddressForm ? (
              <form onSubmit={handleSaveNewAddress} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Full Name *"
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold"
                  />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit Phone *"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, '') })}
                    className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Street Address / House No. / Area *"
                  value={newAddress.line}
                  onChange={(e) => setNewAddress({ ...newAddress, line: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City *"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold"
                  />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit PIN *"
                    value={newAddress.pin}
                    onChange={(e) => setNewAddress({ ...newAddress, pin: e.target.value.replace(/\D/g, '') })}
                    className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    className="flex-1 rounded-xl border border-border py-2 text-xs font-bold text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-primary py-2 text-xs font-bold text-white hover:bg-foreground"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const addrId = addr.id || addr._id;
                  const isSelected = selectedAddressId === addrId;
                  return (
                    <div
                      key={addrId}
                      onClick={() => setSelectedAddressId(addrId)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-accent bg-accent/5 ring-1 ring-accent'
                          : 'border-border bg-background hover:border-accent/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-foreground">{addr.name}</span>
                        <span className="text-xs text-muted-foreground font-semibold">{addr.phone}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {addr.line}, {addr.city}, {addr.state ? `${addr.state} - ` : ''}{addr.pin}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <h2 className="text-base font-extrabold text-foreground">Select Payment Method</h2>

            <div className="space-y-3">
              {/* Online Payment (Razorpay) */}
              <div
                onClick={() => setPaymentMethod('online')}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'online'
                    ? 'border-accent bg-accent/5 ring-1 ring-accent'
                    : 'border-border bg-background hover:border-accent/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="accent-accent h-4 w-4"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-foreground">
                        Pay Online / UPI (Razorpay)
                      </span>
                      {onlineSaving > 0 && (
                        <span className="text-[10px] font-extrabold text-success bg-success/15 px-2 py-0.5 rounded-md">
                          Save ₹{onlineSaving.toFixed(0)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      UPI, Google Pay, PhonePe, Cards, NetBanking
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-display text-foreground block">
                    ₹{onlineTotal.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    (₹{prepaidShipping.toFixed(0)} delivery)
                  </span>
                </div>
              </div>

              {/* Cash on Delivery (COD) */}
              <div
                onClick={() => {
                  if (hasCustomBuild || (serviceability.checked && !serviceability.codAvailable)) return;
                  setPaymentMethod('cod');
                }}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  hasCustomBuild || (serviceability.checked && !serviceability.codAvailable)
                    ? 'border-border bg-secondary/30 opacity-60 cursor-not-allowed'
                    : paymentMethod === 'cod'
                    ? 'border-accent bg-accent/5 ring-1 ring-accent cursor-pointer'
                    : 'border-border bg-background hover:border-accent/40 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    disabled={hasCustomBuild || (serviceability.checked && !serviceability.codAvailable)}
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-accent h-4 w-4"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-foreground">
                        Cash on Delivery (COD)
                      </span>
                      {hasCustomBuild && (
                        <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                          Prepaid Only
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      {hasCustomBuild
                        ? 'Personalized custom gifts are made-to-order and cannot be COD'
                        : 'Pay cash or UPI at your doorstep when Delhivery delivers'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-display text-foreground block">
                    ₹{codTotal.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    (₹{codShipping.toFixed(0)} delivery)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Preview & Confirm (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border space-y-5">
            <h2 className="text-base font-extrabold text-foreground">Order Summary</h2>

            {/* Line items mini-list */}
            <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-border">
              {lines.map((l, i) => (
                <div key={i} className="pt-2 first:pt-0 flex items-center gap-3">
                  <img
                    src={l.product.imageUrl || '/logo.png'}
                    alt={l.product.title}
                    className="h-12 w-12 rounded-xl object-cover border border-border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{l.product.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Qty: {l.qty} {l.size ? `· Size ${l.size}` : ''}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-foreground shrink-0">
                    ₹{((l.product.effectivePrice ?? l.product.price) * l.qty).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="border-t border-border pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-bold text-foreground">
                  ₹{(checkoutTotals.loaded ? checkoutTotals.baseAmount : subtotal).toFixed(2)}
                </span>
              </div>
              {(checkoutTotals.discountAmount > 0 || couponDiscount > 0) && (
                <div className="flex justify-between text-success">
                  <span>Coupon Discount ({couponCode})</span>
                  <span className="font-bold">
                    -₹{(checkoutTotals.loaded ? checkoutTotals.discountAmount : couponDiscount).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Delhivery Express Delivery</span>
                {checkoutTotals.loading ? (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Calculating...
                  </span>
                ) : currentShipping > 0 ? (
                  <span className="font-bold text-foreground">₹{currentShipping.toFixed(2)}</span>
                ) : (
                  <span className="font-bold text-success">FREE</span>
                )}
              </div>
              <div className="flex justify-between text-base font-black text-foreground pt-2 border-t border-border">
                <span>Final Payable</span>
                <span>₹{payableAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handlePlaceOrder}
              disabled={
                placingOrder ||
                checkoutTotals.loading ||
                (!selectedAddress && !showNewAddressForm) ||
                (serviceability.checked && !serviceability.serviceable)
              }
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-accent py-4 px-4 text-sm font-black text-accent-foreground shadow-xl hover:bg-accent/90 disabled:opacity-50 transition-all"
            >
              {placingOrder ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <span>
                    {paymentMethod === 'cod'
                      ? `Confirm COD Order (₹${codTotal.toFixed(0)})`
                      : `Pay via Razorpay (₹${onlineTotal.toFixed(0)})`}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              <span>Payments secured by 256-bit encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
