import { useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Truck, ShoppingBag } from 'lucide-react';

export function OrderSuccess() {
  const { orderId } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24 text-center space-y-6">
      <div className="h-20 w-20 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75 duration-300">
        <CheckCircle2 className="h-10 w-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-display text-foreground">
          Order Placed Successfully!
        </h1>
        <p className="text-sm text-muted-foreground">
          Thank you for shopping with Yoventra. We've received your order and our fulfillment team is preparing it for dispatch via Delhivery.
        </p>
      </div>

      {/* Order info card */}
      <div className="p-6 rounded-3xl bg-card border border-border text-left space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-xs font-bold text-muted-foreground">Order Reference</span>
          <span className="text-sm font-extrabold text-foreground font-mono">
            #{order?.orderNumber || orderId}
          </span>
        </div>

        {order?.paymentMode && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Payment Mode</span>
            <span className="font-bold text-foreground">{order.paymentMode}</span>
          </div>
        )}

        {order?.total && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Total Amount</span>
            <span className="font-extrabold text-foreground">₹{order.total}</span>
          </div>
        )}

        <div className="pt-2 flex items-center gap-2 text-xs font-bold text-success">
          <Truck className="h-4 w-4" />
          <span>Delhivery Express shipment will be assigned shortly</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
        <Link
          to="/account/orders"
          className="flex items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 px-6 text-sm font-extrabold text-accent-foreground shadow-lg hover:bg-accent/90 transition-all"
        >
          <Package className="h-4 w-4" />
          <span>View My Orders & Track</span>
        </Link>
        <Link
          to="/"
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 px-6 text-sm font-bold text-foreground hover:bg-secondary transition-all"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
}
