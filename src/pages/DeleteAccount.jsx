import { Mail, Trash2, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DeleteAccount() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16 space-y-8">
      {/* Header Card */}
      <div className="bg-card rounded-3xl p-6 sm:p-10 border border-border shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-danger-bg px-3.5 py-1 text-xs font-bold text-danger">
          <Trash2 className="w-4 h-4" />
          <span>ACCOUNT DELETION REQUEST</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-foreground tracking-tight">
          Delete Your Yoventra Account
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We respect your privacy and give you full control over your personal data. You can request permanent deletion of your Yoventra mobile app account and associated profile data at any time.
        </p>
      </div>

      {/* Main Details */}
      <div className="bg-card rounded-3xl p-6 sm:p-10 border border-border shadow-sm space-y-8">
        
        {/* Step-by-Step Request Instructions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display text-foreground">
            How to Submit an Account Deletion Request
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Method 1 */}
            <div className="bg-secondary/60 p-5 rounded-2xl border border-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-sm text-foreground">Via Yoventra Mobile App</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Open the Yoventra app on your Android device → Go to <strong>Profile / Account Settings</strong> → Tap <strong>"Delete My Account"</strong> and confirm.
              </p>
            </div>

            {/* Method 2 */}
            <div className="bg-secondary/60 p-5 rounded-2xl border border-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-sm text-foreground">Via Email Support</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Send an email to <a href="mailto:pk0471721@gmail.com" className="font-bold underline text-foreground">pk0471721@gmail.com</a> from your registered email or mention your registered phone number.
              </p>
            </div>
          </div>
        </div>

        {/* Data Purge vs Retention Table */}
        <div className="space-y-4 border-t border-border pt-8">
          <h2 className="text-xl font-bold font-display text-foreground">
            What Happens When Your Account Is Deleted
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* What is Deleted */}
            <div className="bg-success-bg/40 p-5 rounded-2xl border border-success/30 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-success">
                <CheckCircle className="w-5 h-5" />
                <span>Data Permanently Purged</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                <li>Your profile credentials (Phone number, Name, Email).</li>
                <li>Saved delivery addresses and pincodes.</li>
                <li>Saved shopping wishlist items and active cart drafts.</li>
                <li>App login tokens & notification preferences.</li>
              </ul>
            </div>

            {/* What is Retained */}
            <div className="bg-secondary p-5 rounded-2xl border border-border space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <Info className="w-5 h-5 text-muted-foreground" />
                <span>Statutory Records Retained</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                <li>Past sales order receipts and invoice tax logs (required by tax & trade laws).</li>
                <li>Razorpay payment transaction ID references for dispute resolution.</li>
                <li>Completed delivery fulfillment records.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Callout */}
        <div className="border-t border-border pt-8">
          <div className="bg-primary text-primary-foreground p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-bold text-base text-primary-foreground">Need Assistance?</h3>
              <p className="text-xs text-primary-foreground/70">
                Our support team processes manual deletion requests within 2 to 3 business days.
              </p>
            </div>
            <a
              href="mailto:pk0471721@gmail.com?subject=Account Deletion Request"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-xs font-bold text-accent-foreground shadow hover:bg-accent/90"
            >
              <Mail className="w-4 h-4" />
              <span>Email Support</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
