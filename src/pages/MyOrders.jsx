import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RotateCcw,
  XCircle,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Gift,
  Search,
  Phone,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  X,
  MessageSquare,
  Eye,
  ShoppingBag,
} from 'lucide-react';
import { api, normalizeOrder } from '../api/client';
import { useAuth } from '../context/AuthContext';

const CANCEL_REASONS = [
  'Ordered by mistake',
  'Found cheaper elsewhere',
  'Delivery taking too long',
  'Need to change delivery address',
  'Incorrect size or item selected',
  'Other',
];

function formatDate(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getOrderHeadline(order) {
  const status = order.status;
  if (status === 'delivered') {
    return {
      title: `Delivered on ${formatDate(order.deliveredAt || order.placedAt)}`,
      color: 'text-success',
      badgeClass: 'bg-success/10 text-success border-success/20',
    };
  }
  if (status === 'cancelled') {
    return {
      title: `Cancelled on ${formatDate(order.placedAt)}`,
      color: 'text-danger',
      badgeClass: 'bg-danger/10 text-danger border-danger/20',
    };
  }
  if (order.outForDeliveryAt || order.courierStatus?.toLowerCase().includes('out for delivery')) {
    return {
      title: 'Out for Delivery · Today',
      color: 'text-accent',
      badgeClass: 'bg-accent/10 text-accent border-accent/20',
    };
  }
  if (order.expectedDeliveryDate) {
    return {
      title: `Arriving by ${formatDate(order.expectedDeliveryDate)}`,
      color: 'text-success',
      badgeClass: 'bg-success/10 text-success border-success/20',
    };
  }
  if (status === 'shipped') {
    return {
      title: 'Shipped · Arriving soon',
      color: 'text-success',
      badgeClass: 'bg-success/10 text-success border-success/20',
    };
  }
  if (status === 'confirmed' || status === 'processing') {
    return {
      title: 'Confirmed · Arriving soon',
      color: 'text-success',
      badgeClass: 'bg-success/10 text-success border-success/20',
    };
  }
  return {
    title: 'Order Placed',
    color: 'text-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  };
}

function getStatusDescription(order) {
  if (order.status === 'cancelled') {
    return order.cancelReason
      ? `Cancelled: ${order.cancelReason}`
      : order.paymentMode === 'Prepaid'
      ? `Your order was cancelled. Your refund of ₹${order.total} will be credited to your original payment method within 5–7 business days.`
      : 'Your order was cancelled as per your request.';
  }
  if (order.status === 'delivered') {
    return 'Your package has been delivered successfully. Thank you for shopping with Yoventra!';
  }
  if (order.outForDeliveryAt || order.courierStatus?.toLowerCase().includes('out for delivery')) {
    return order.courierInstruction || 'Your item is out for delivery with courier executive and will reach you today.';
  }
  if (order.status === 'shipped') {
    return order.courierInstruction || 'Your package is on its way with Delhivery Express.';
  }
  if (order.status === 'processing') {
    return 'Your order is packed and being prepped for dispatch via Delhivery Express.';
  }
  if (order.status === 'confirmed') {
    return 'Your order has been confirmed. Our warehouse team is packaging your order.';
  }
  return 'Your order has been placed successfully and is queued for verification.';
}

export function MyOrders() {
  const { orderId: urlOrderId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, openAuthModal } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'delivered', 'cancelled'

  // Selected Order for Detail View
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Tracking Modal State
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelCustomNotes, setCancelCustomNotes] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Photo Lightbox
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Copy feedback
  const [copiedId, setCopiedId] = useState(false);

  // Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getMyOrders();
      const list = res?.items || res?.orders || (Array.isArray(res) ? res : []);
      setOrders(list);

      // If URL has orderId, select that order
      if (urlOrderId) {
        const found = list.find(
          (o) => (o.orderNumber && o.orderNumber.toLowerCase() === urlOrderId.toLowerCase()) || (o.id || o._id) === urlOrderId
        );
        if (found) {
          setSelectedOrder(found);
        } else {
          loadSingleOrder(urlOrderId);
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSingleOrder = async (id) => {
    setLoadingDetail(true);
    try {
      const ord = await api.getMyOrder(id);
      if (ord) setSelectedOrder(ord);
    } catch (err) {
      console.error('Failed to load order details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      openAuthModal('Please login to view your orders');
      return;
    }
    fetchOrders();
  }, [isLoggedIn]);

  useEffect(() => {
    if (urlOrderId && orders.length > 0) {
      const found = orders.find(
        (o) => (o.orderNumber && o.orderNumber.toLowerCase() === urlOrderId.toLowerCase()) || (o.id || o._id) === urlOrderId
      );
      if (found) setSelectedOrder(found);
    } else if (!urlOrderId && selectedOrder) {
      setSelectedOrder(null);
    }
  }, [urlOrderId, orders]);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    const identifier = order.orderNumber || order.id || order._id;
    navigate(`/account/orders/${identifier}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
    navigate('/account/orders');
  };

  const handleCopyOrderId = (idText) => {
    if (!idText) return;
    navigator.clipboard.writeText(idText);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleOpenTracking = async (order) => {
    const orderId = order.id || order._id;
    setTrackingModalOpen(true);
    setTrackingLoading(true);
    setTrackingError(null);
    setTrackingData(null);

    try {
      const res = await api.getMyOrderTracking(orderId);
      setTrackingData(res);
    } catch (err) {
      // If courier waybill is not yet generated, provide a helpful fallback
      setTrackingError(err.message || 'Shipment tracking information is not available yet.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrder) return;
    const orderId = selectedOrder.id || selectedOrder._id;
    const finalReason =
      cancelReason.toLowerCase() === 'other' && cancelCustomNotes.trim()
        ? `Other: ${cancelCustomNotes.trim()}`
        : cancelReason;

    setCancelling(true);
    try {
      await api.cancelMyOrder(orderId, finalReason);
      setOrders((prev) =>
        prev.map((o) =>
          (o.id || o._id) === orderId
            ? { ...o, status: 'cancelled', orderStatus: 'cancelled', cancelReason: finalReason }
            : o
        )
      );
      setSelectedOrder((prev) =>
        prev
          ? { ...prev, status: 'cancelled', orderStatus: 'cancelled', cancelReason: finalReason }
          : null
      );
      setCancelModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      // Status filter
      if (statusFilter === 'active' && (o.status === 'delivered' || o.status === 'cancelled')) {
        return false;
      }
      if (statusFilter === 'delivered' && o.status !== 'delivered') {
        return false;
      }
      if (statusFilter === 'cancelled' && o.status !== 'cancelled') {
        return false;
      }

      // Search query
      if (q) {
        const orderNumMatch = (o.orderNumber || '').toLowerCase().includes(q);
        const itemMatch = (o.items || []).some((item) => (item.title || '').toLowerCase().includes(q));
        const addressMatch = (o.address?.name || '').toLowerCase().includes(q);
        return orderNumMatch || itemMatch || addressMatch;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // ==========================================
  // VIEW 1: FULL ORDER DETAILS VIEW
  // ==========================================
  if (selectedOrder) {
    const headline = getOrderHeadline(selectedOrder);
    const description = getStatusDescription(selectedOrder);
    const isCancelled = selectedOrder.status === 'cancelled';
    const isDelivered = selectedOrder.status === 'delivered';
    const isShipped = selectedOrder.status === 'shipped' || isDelivered;
    const isOutForDelivery =
      selectedOrder.outForDeliveryAt ||
      selectedOrder.courierStatus?.toLowerCase().includes('out for delivery') ||
      isDelivered;
    const canCancel = ['placed', 'confirmed', 'processing'].includes(selectedOrder.status);

    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to My Orders</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Order ID</span>
            <span className="text-sm font-black font-mono text-foreground">
              #{selectedOrder.orderNumber}
            </span>
            <button
              onClick={() => handleCopyOrderId(selectedOrder.orderNumber)}
              title="Copy Order ID"
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 text-[11px] font-bold"
            >
              {copiedId ? (
                <>
                  <Check className="h-3.5 w-3.5 text-success" />
                  <span className="text-success">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1. Status & Timeline Stepper Card (Flipkart/Amazon style) */}
        <div className="p-5 sm:p-7 rounded-3xl bg-card border border-border space-y-5 shadow-xs">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className={`text-xl sm:text-2xl font-black font-display ${headline.color}`}>
                {headline.title}
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${headline.badgeClass}`}>
                {selectedOrder.status}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Cancelled Banner if cancelled */}
          {isCancelled && (
            <div className="p-3.5 rounded-2xl bg-danger/10 border border-danger/20 text-xs text-danger font-medium flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Order was cancelled</p>
                {selectedOrder.cancelReason && <p className="text-[11px] mt-0.5">Reason: {selectedOrder.cancelReason}</p>}
              </div>
            </div>
          )}

          {/* Stepper Progress Bar */}
          <div className="pt-2">
            {isCancelled ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success text-white">
                    <Check className="h-4 w-4" />
                  </div>
                  <div className="h-1 flex-1 bg-danger"></div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-danger text-white">
                    <X className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-foreground">Order Confirmed</span>
                  <span className="font-bold text-danger">Cancelled</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center">
                  {/* Step 1: Placed/Confirmed */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success text-white shadow-xs">
                    <Check className="h-4 w-4" />
                  </div>
                  <div className={`h-1 flex-1 transition-colors ${isShipped ? 'bg-success' : 'bg-secondary'}`} />

                  {/* Step 2: Shipped */}
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors ${
                      isShipped ? 'bg-success' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {isShipped ? <Check className="h-4 w-4" /> : <Package className="h-3.5 w-3.5" />}
                  </div>
                  <div className={`h-1 flex-1 transition-colors ${isOutForDelivery ? 'bg-success' : 'bg-secondary'}`} />

                  {/* Step 3: Out for Delivery */}
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                      isOutForDelivery
                        ? 'bg-success text-white'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {isOutForDelivery ? <Truck className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />}
                  </div>
                  <div className={`h-1 flex-1 transition-colors ${isDelivered ? 'bg-success' : 'bg-secondary'}`} />

                  {/* Step 4: Delivered */}
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                      isDelivered ? 'bg-success text-white' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {isDelivered ? <Check className="h-4 w-4" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                </div>

                <div className="grid grid-cols-4 text-center text-[11px] gap-1">
                  <div>
                    <p className="font-bold text-foreground">Confirmed</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(selectedOrder.placedAt)}</p>
                  </div>
                  <div>
                    <p className={`font-bold ${isShipped ? 'text-foreground' : 'text-muted-foreground'}`}>Shipped</p>
                    <p className="text-[10px] text-muted-foreground">{selectedOrder.shippedAt ? formatDate(selectedOrder.shippedAt) : (isShipped ? 'Dispatched' : '')}</p>
                  </div>
                  <div>
                    <p className={`font-bold ${isOutForDelivery ? 'text-foreground' : 'text-muted-foreground'}`}>Out for Delivery</p>
                    <p className="text-[10px] text-muted-foreground">{isOutForDelivery ? 'In Transit' : ''}</p>
                  </div>
                  <div>
                    <p className={`font-bold ${isDelivered ? 'text-foreground' : 'text-muted-foreground'}`}>Delivered</p>
                    <p className="text-[10px] text-muted-foreground">
                      {isDelivered
                        ? formatDate(selectedOrder.deliveredAt)
                        : selectedOrder.expectedDeliveryDate
                        ? formatDate(selectedOrder.expectedDeliveryDate)
                        : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Truck className="h-4 w-4 text-accent" />
              <span>Logistics Partner: <strong>Delhivery Express</strong></span>
              {selectedOrder.trackingNumber && (
                <span className="font-mono bg-secondary px-2 py-0.5 rounded text-[11px] font-bold text-foreground">
                  AWB: {selectedOrder.trackingNumber}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenTracking(selectedOrder)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:bg-accent/90 transition-all shadow-xs"
              >
                <Truck className="h-3.5 w-3.5" />
                <span>See all updates & Track</span>
              </button>

              {canCancel && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="px-4 py-2 rounded-xl border border-danger/30 text-xs font-bold text-danger hover:bg-danger-bg transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Order Items List with Personalization Preview */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              Order Items ({selectedOrder.items?.length || 0})
            </h3>
            <span className="text-xs text-muted-foreground">
              Seller: <strong className="text-foreground">Yoventra Direct</strong>
            </span>
          </div>

          <div className="divide-y divide-border">
            {(selectedOrder.items || []).map((item, idx) => {
              const customPhotos = item.customization?.photos || item.customization?.images || [];
              const customText = item.customization?.text || item.customization?.texts || [];

              return (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex items-start gap-4">
                    <img
                      src={item.image || '/logo.png'}
                      alt={item.title}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-border shrink-0 bg-secondary"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <Link
                        to={item.productId ? `/products/${item.productId}` : '#'}
                        className="text-sm sm:text-base font-bold text-foreground hover:text-accent transition-colors line-clamp-2"
                      >
                        {item.title}
                      </Link>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>Qty: <strong>{item.qty}</strong></span>
                        {item.size && (
                          <>
                            <span>·</span>
                            <span>Size: <strong className="text-foreground">{item.size}</strong></span>
                          </>
                        )}
                        <span>·</span>
                        <span>₹{item.price} each</span>
                      </div>

                      {/* Customization extras preview */}
                      {(customPhotos.length > 0 || customText) && (
                        <div className="pt-2 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-accent">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Personalised Custom Order</span>
                          </div>

                          {/* Photos strip */}
                          {customPhotos.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold text-muted-foreground">Photos ({customPhotos.length}):</span>
                              <div className="flex items-center gap-1.5">
                                {customPhotos.map((imgUrl, pIdx) => (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => setPreviewPhoto(imgUrl)}
                                    className="relative group h-8 w-8 rounded-lg overflow-hidden border border-border hover:border-accent transition-all"
                                  >
                                    <img src={imgUrl} alt={`Custom ${pIdx}`} className="h-full w-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                      <Eye className="h-3 w-3" />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Text customization */}
                          {typeof customText === 'string' && customText && (
                            <p className="text-xs bg-secondary/60 p-2 rounded-xl text-foreground font-medium">
                              <strong>Custom Text:</strong> "{customText}"
                            </p>
                          )}
                          {Array.isArray(customText) && customText.length > 0 && (
                            <div className="text-xs space-y-1">
                              {customText.map((t, tIdx) => (
                                <p key={tIdx} className="text-muted-foreground">
                                  <strong>{t.label || 'Custom'}:</strong> {t.value}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Free gift if attached */}
                      {item.freeGift && (
                        <div className="flex items-center gap-2 text-xs font-bold text-success pt-1">
                          <Gift className="h-3.5 w-3.5" />
                          <span>Includes Free Gift: {item.freeGift.title}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm sm:text-base font-black font-display text-foreground">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Delivery Address & Payment Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Address */}
          <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              <MapPin className="h-4 w-4 text-accent" />
              <span>Delivery Address</span>
            </div>

            <div className="space-y-1 text-xs sm:text-sm">
              <p className="font-extrabold text-foreground text-sm sm:text-base">
                {selectedOrder.address?.name || 'Customer'}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {selectedOrder.address?.line}
              </p>
              <p className="text-muted-foreground">
                {selectedOrder.address?.city}
                {selectedOrder.address?.state ? `, ${selectedOrder.address?.state}` : ''} - <strong>{selectedOrder.address?.pin}</strong>
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-foreground font-semibold">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>+91 {selectedOrder.address?.phone}</span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              <CreditCard className="h-4 w-4 text-accent" />
              <span>Payment Summary</span>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{(selectedOrder.subtotal || selectedOrder.total).toFixed(2)}</span>
              </div>

              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-success font-medium">
                  <span>Coupon Discount</span>
                  <span>-₹{selectedOrder.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span>
                <span>{selectedOrder.shippingCost > 0 ? `₹${selectedOrder.shippingCost}` : 'FREE'}</span>
              </div>

              <div className="pt-2 border-t border-border flex justify-between text-sm sm:text-base font-black text-foreground">
                <span>Total Amount</span>
                <span className="text-accent font-display">₹{selectedOrder.total.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Payment Mode:</span>
                <span className={`px-2.5 py-1 rounded-full font-bold ${
                  selectedOrder.paymentMode === 'Prepaid'
                    ? 'bg-success/10 text-success'
                    : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {selectedOrder.paymentMode === 'Prepaid' ? 'Paid Online (Razorpay)' : 'Cash on Delivery (COD)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Need Help / Support Bar */}
        <div className="p-5 rounded-3xl bg-secondary/50 border border-border flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-extrabold text-foreground flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-accent" />
              <span>Need help with this order?</span>
            </h4>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              Our 24x7 customer support team is here to assist with tracking, modifications, or questions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/918979607956?text=Hi%20Yoventra%20Support,%20I%20have%20a%20question%20regarding%20Order%20%23${selectedOrder.orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-success text-white text-xs font-bold hover:bg-success/90 transition-all shadow-xs"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>WhatsApp Support</span>
            </a>
            <a
              href={`mailto:pk0471721@gmail.com?subject=Inquiry for Order %23${selectedOrder.orderNumber}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-bold hover:bg-secondary transition-all"
            >
              <span>Email Us</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ORDERS LIST VIEW (Mobile App Parity)
  // ==========================================
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-foreground tracking-tight">
            My Orders
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track shipments, view detailed receipts, or manage cancellations
          </p>
        </div>

        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-bold text-accent hover:underline"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Shop More Collections</span>
        </Link>
      </div>

      {/* Search Bar & Filter Chips (Exactly like mobile application) */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your orders by Order ID or product name..."
            className="w-full rounded-2xl border border-border bg-card pl-11 pr-10 py-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: `All Orders (${orders.length})` },
            { id: 'active', label: 'Active / In Transit' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                statusFilter === tab.id
                  ? 'bg-accent text-accent-foreground shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Container */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-4">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
            <Package className="h-8 w-8 opacity-40" />
          </div>
          {orders.length === 0 ? (
            <>
              <h3 className="text-lg font-bold text-foreground">No orders placed yet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                You haven't ordered anything yet. Explore our latest custom gifts and readymade styles!
              </p>
              <Link
                to="/categories/all"
                className="inline-block rounded-xl bg-accent px-6 py-3 text-xs font-bold text-accent-foreground shadow-md hover:bg-accent/90"
              >
                Start Shopping
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-foreground">No matching orders found</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                Try clearing your search query or switching your status filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="inline-block rounded-xl bg-secondary px-5 py-2.5 text-xs font-bold text-foreground hover:bg-secondary/80"
              >
                Reset Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const orderId = order.id || order._id;
            const items = order.items || [];
            const primaryItem = items[0] || {};
            const extraCount = Math.max(0, items.length - 1);
            const headline = getOrderHeadline(order);
            const isCancelled = order.status === 'cancelled';

            return (
              <div
                key={orderId}
                onClick={() => handleSelectOrder(order)}
                className="group p-5 sm:p-6 rounded-3xl bg-card border border-border hover:border-accent/40 hover:shadow-md transition-all cursor-pointer space-y-4"
              >
                {/* Header row: Order # and Total */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground font-mono">
                      #{order.orderNumber}
                    </span>
                    <span className="text-[11px] text-muted-foreground">·</span>
                    <span className="text-[11px] text-muted-foreground">
                      Placed {formatDate(order.placedAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border uppercase tracking-wider ${headline.badgeClass}`}>
                      {order.status}
                    </span>
                    <span className="text-sm sm:text-base font-black font-display text-foreground">
                      ₹{order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Main Card Body (Mobile App OrderCard design) */}
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="relative shrink-0">
                    <img
                      src={primaryItem.image || '/logo.png'}
                      alt={primaryItem.title || 'Product'}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-border bg-secondary"
                    />
                    {extraCount > 0 && (
                      <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-md bg-foreground text-background text-[10px] font-black shadow-xs">
                        +{extraCount}
                      </span>
                    )}
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Status Headline (e.g. Arriving by Oct 11 / Delivered on Oct 04) */}
                    <p className={`text-sm sm:text-base font-black font-display ${headline.color}`}>
                      {headline.title}
                    </p>

                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {primaryItem.title || 'Customized Item'}
                      {extraCount > 0 ? ` + ${extraCount} more item${extraCount === 1 ? '' : 's'}` : ''}
                    </p>

                    <p className="text-[11px] text-muted-foreground">
                      {isCancelled
                        ? order.cancelReason || 'Order was cancelled'
                        : [
                            primaryItem.size ? `Size: ${primaryItem.size}` : null,
                            `Qty: ${primaryItem.qty || 1}`,
                            order.paymentMode ? `Payment: ${order.paymentMode}` : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                    </p>
                  </div>

                  {/* Right Chevron & Action */}
                  <div className="flex items-center gap-2 text-muted-foreground group-hover:text-accent transition-colors shrink-0">
                    <span className="hidden sm:inline text-xs font-bold">View Details</span>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>

                {/* Footer preview with quick tracking info */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-accent" />
                    <span>Delhivery Express Delivery</span>
                  </div>
                  <span className="text-accent font-bold group-hover:underline">
                    Track & Order Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 1: DELHIVERY TRACKING SCAN TIMELINE */}
      {/* ========================================== */}
      {trackingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-accent/10 text-accent">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Delhivery Express Tracking</h3>
                  <p className="text-[11px] text-muted-foreground">Live courier shipment timeline</p>
                </div>
              </div>
              <button
                onClick={() => setTrackingModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {trackingLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : trackingData?.tracking?.scans?.length > 0 ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-secondary/60 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Waybill / AWB:</span>
                    <strong className="font-mono text-foreground">{trackingData.waybill}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Status:</span>
                    <strong className="text-accent">{trackingData.tracking.courierStatus || 'In Transit'}</strong>
                  </div>
                  {trackingData.tracking.expectedDeliveryDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expected Delivery:</span>
                      <strong className="text-foreground">{formatDate(trackingData.tracking.expectedDeliveryDate)}</strong>
                    </div>
                  )}
                </div>

                <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {trackingData.tracking.scans.map((scan, sIdx) => (
                    <div key={sIdx} className="relative space-y-1">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-accent border-2 border-card" />
                      <p className="text-xs font-bold text-foreground">
                        {scan.scan} {scan.location ? `· ${scan.location}` : ''}
                      </p>
                      {scan.instructions && (
                        <p className="text-[11px] text-muted-foreground">{scan.instructions}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">{formatDateTime(scan.dateTime)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-6">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
                  <Package className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">Shipment Being Prepared</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {trackingError || 'Delhivery waybill tracking is being initialized. Real-time courier scans will appear as soon as the package leaves our warehouse.'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-secondary/40 text-left text-xs space-y-2">
                  <p className="font-bold text-foreground">What happens next?</p>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-[11px]">
                    <li>Warehouse packs and inspects your personalized garments</li>
                    <li>Delhivery picks up package from fulfillment hub</li>
                    <li>Live transit scans and out-for-delivery SMS sent to your number</li>
                  </ul>
                </div>
              </div>
            )}

            <button
              onClick={() => setTrackingModalOpen(false)}
              className="w-full rounded-xl bg-foreground py-2.5 text-xs font-bold text-background hover:bg-foreground/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: CANCEL ORDER REASON DIALOG       */}
      {/* ========================================== */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-extrabold text-foreground">Cancel Order</h3>
              <button onClick={() => setCancelModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Please select a reason for cancelling Order #{selectedOrder?.orderNumber}:
              </p>

              <div className="space-y-2">
                {CANCEL_REASONS.map((r) => (
                  <label
                    key={r}
                    onClick={() => setCancelReason(r)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer text-xs transition-all ${
                      cancelReason === r
                        ? 'border-accent bg-accent/5 font-bold text-foreground'
                        : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      checked={cancelReason === r}
                      onChange={() => setCancelReason(r)}
                      className="accent-accent"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              {cancelReason.toLowerCase() === 'other' && (
                <textarea
                  value={cancelCustomNotes}
                  onChange={(e) => setCancelCustomNotes(e.target.value)}
                  placeholder="Please specify additional details..."
                  rows={2}
                  className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                />
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-foreground hover:bg-secondary"
              >
                Keep Order
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="flex-1 rounded-xl bg-danger py-2.5 text-xs font-bold text-white hover:bg-danger/90 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 3: PERSONALIZED PHOTO LIGHTBOX       */}
      {/* ========================================== */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative max-w-xl max-h-[85vh] rounded-2xl overflow-hidden bg-card border border-border shadow-2xl">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={previewPhoto} alt="Personalized item" className="max-h-[80vh] w-auto object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
