import { useState, type FormEvent } from 'react';

export function DeleteAccount() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'idle' | 'done'>('idle');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent('Yoventra account deletion request');
    const body = encodeURIComponent(`Registered phone number: ${phoneNumber}\nReason: ${reason || 'Not provided'}`);
    window.location.href = `mailto:support@yoventra.com?subject=${subject}&body=${body}`;
    setStatus('done');
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-3xl font-bold text-foreground">Delete Your Account</h1>

      <div className="mt-6 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
        <p>
          You can request deletion of your Yoventra account and profile data (name, email, saved addresses, wishlist,
          and login) using the form below.
        </p>
        <p>
          <strong className="text-foreground">What's deleted:</strong> your profile, saved addresses, wishlist, and
          login access.
        </p>
        <p>
          <strong className="text-foreground">What's retained:</strong> your past order records (items, amounts,
          delivery address on that order) are kept for accounting, tax, and dispute-resolution purposes, the same way
          any retailer retains sales records — even after your account is deleted.
        </p>
        <p>
          We process deletion requests manually to confirm it's really you, and to make sure nothing else is pending
          on your account (like an order in transit). Expect a confirmation within a few business days.
        </p>
      </div>

      {status === 'done' ? (
        <div className="mt-8 rounded-lg border border-success/30 bg-success-bg px-5 py-4 text-success">
          <p className="font-semibold">Request received.</p>
          <p className="mt-1 text-sm">
            We'll process your deletion request and confirm by email or phone once it's complete.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-lg border border-border bg-card p-5">
          <div>
            <label htmlFor="phoneNumber" className="mb-1.5 block text-sm font-semibold text-foreground">
              Registered phone number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="reason" className="mb-1.5 block text-sm font-semibold text-foreground">
              Reason (optional)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Let us know why you're leaving — optional, helps us improve"
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            Request Account Deletion
          </button>
        </form>
      )}
    </div>
  );
}
