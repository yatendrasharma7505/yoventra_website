import { ShieldCheck, Mail, Lock, Phone, MapPin, Truck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const LAST_UPDATED = 'September 10, 2026';

export function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      {/* Header Banner */}
      <div className="bg-card rounded-3xl p-6 sm:p-10 border border-border shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3.5 py-1 text-xs font-bold text-foreground">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>YOVENTRA PRIVACY & DATA PROTECTION POLICY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-foreground tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          Effective Date & Last Updated: <strong>{LAST_UPDATED}</strong>
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed pt-2 border-t border-border">
          Welcome to Yoventra ("we", "us", "our"). This Privacy Policy describes how we collect, use, store, and protect your personal information when you visit our website or download and use the <strong>Yoventra Mobile Application</strong> (available on Google Play Store).
        </p>
      </div>

      {/* Main Document Body */}
      <div className="bg-card rounded-3xl p-6 sm:p-10 border border-border shadow-sm space-y-10 text-foreground">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs flex items-center justify-center font-black">1</span>
            <span>Who We Are & What We Sell</span>
          </h2>
          <div className="text-sm leading-relaxed text-muted-foreground space-y-3 pl-9">
            <p>
              Yoventra is an online fashion storefront and mobile application dedicated exclusively to providing 100% original, ready-to-wear branded apparel (t-shirts, jeans, hoodies, dresses, and streetwear) at discounted outlet prices.
            </p>
            <p>
              <strong>Note on Products:</strong> All clothing offered on Yoventra consists strictly of ready-made, pre-manufactured standard sizing garments. We do not provide custom cloth tailoring, bespoke stitching, or custom fabrics.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 border-t border-border pt-8">
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs flex items-center justify-center font-black">2</span>
            <span>Information We Collect</span>
          </h2>
          <div className="text-sm leading-relaxed text-muted-foreground space-y-3 pl-9">
            <p>To process your orders, ship ready-to-wear clothing to your address, and manage your account, we collect the following categories of information:</p>
            
            <ul className="list-disc pl-5 space-y-2 text-foreground/90">
              <li>
                <strong>Account & Sign-In Details:</strong> Your mobile phone number (used to authenticate you via Firebase One-Time Password / OTP), and optionally your full name and email address if provided in your user profile.
              </li>
              <li>
                <strong>Delivery & Shipping Addresses:</strong> Recipient name, complete shipping address, city, state, postal pincode, and contact phone number supplied for fulfilling order deliveries.
              </li>
              <li>
                <strong>Order History:</strong> Details of readymade apparel items purchased, sizes selected, order amounts, timestamps, delivery tracking IDs, and chosen payment mode (Cash on Delivery or Online Payment).
              </li>
              <li>
                <strong>Payment Information:</strong> For online payments, we integrate with Razorpay. We receive and store transaction confirmation tokens and payment IDs. We <em>never</em> view, record, or store sensitive card numbers, UPI PINs, or net-banking credentials on our servers.
              </li>
              <li>
                <strong>User Interactions & Wishlists:</strong> Saved ready-to-wear clothing items in your wishlist, shopping cart items, and product ratings or reviews submitted in the app.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 border-t border-border pt-8">
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs flex items-center justify-center font-black">3</span>
            <span>How We Use Your Information</span>
          </h2>
          <div className="text-sm leading-relaxed text-muted-foreground space-y-3 pl-9">
            <p>We use your personal data strictly for legitimate business purposes:</p>
            <ul className="list-disc pl-5 space-y-2 text-foreground/90">
              <li>To verify your identity and sign you in securely using mobile phone OTP authentication.</li>
              <li>To pack, dispatch, deliver, and track your ready-to-wear clothing orders.</li>
              <li>To send order status updates, delivery notifications, and customer support communications via SMS, WhatsApp, or Push Notifications.</li>
              <li>To enable your personal app features such as Wishlist, Cart, and Order History.</li>
              <li>To prevent fraudulent transactions and comply with applicable financial record-keeping laws.</li>
            </ul>
            <p className="font-semibold text-foreground pt-1">
              We do NOT sell, rent, or trade your personal information to third-party advertisers.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 border-t border-border pt-8">
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs flex items-center justify-center font-black">4</span>
            <span>Third-Party Service Providers</span>
          </h2>
          <div className="text-sm leading-relaxed text-muted-foreground space-y-3 pl-9">
            <p>We share limited essential data with trusted service infrastructure partners:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-secondary/60 p-4 rounded-xl border border-border">
                <p className="font-bold text-foreground text-xs">Firebase (Google)</p>
                <p className="text-[11px] text-muted-foreground mt-1">Handles phone number verification & secure OTP sign-in.</p>
              </div>
              <div className="bg-secondary/60 p-4 rounded-xl border border-border">
                <p className="font-bold text-foreground text-xs">Razorpay</p>
                <p className="text-[11px] text-muted-foreground mt-1">Encrypted gateway for UPI, credit/debit card & netbanking payments.</p>
              </div>
              <div className="bg-secondary/60 p-4 rounded-xl border border-border">
                <p className="font-bold text-foreground text-xs">Delhivery Logistics</p>
                <p className="text-[11px] text-muted-foreground mt-1">Courier partner for shipping ready-to-wear apparel orders.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 border-t border-border pt-8">
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs flex items-center justify-center font-black">5</span>
            <span>Data Retention & Account Deletion</span>
          </h2>
          <div className="text-sm leading-relaxed text-muted-foreground space-y-3 pl-9">
            <p>
              We retain your account profile (name, email, saved addresses) for as long as your Yoventra account is active.
            </p>
            <p>
              You have the complete right to request the deletion of your Yoventra account and profile data at any time. You can initiate account deletion directly from the mobile app settings or by visiting our{' '}
              <Link to="/delete-account" className="font-bold text-foreground underline decoration-accent/60">
                Delete Account Page
              </Link>.
            </p>
            <p className="text-xs text-muted-foreground italic">
              * Note: In compliance with statutory tax, accounting, and consumer protection laws, historical sales order records (invoices and delivery address snapshots) are retained for legal audit purposes even after account deletion.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 border-t border-border pt-8">
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs flex items-center justify-center font-black">6</span>
            <span>Contact Support & Grievance</span>
          </h2>
          <div className="text-sm leading-relaxed text-muted-foreground space-y-3 pl-9">
            <p>
              If you have any questions, privacy concerns, or request regarding your data, please contact our support team:
            </p>
            <div className="bg-secondary/70 p-5 rounded-2xl border border-border inline-block space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Mail className="w-4 h-4 text-accent" />
                <span>Email: <a href="mailto:pk0471721@gmail.com" className="underline">pk0471721@gmail.com</a></span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>Response Time: Within 24-48 Business Hours</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
