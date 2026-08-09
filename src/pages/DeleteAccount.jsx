export function DeleteAccount() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-3xl font-bold text-foreground">Delete Your Account</h1>

      <div className="mt-6 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
        <p>
          You can request deletion of your Yoventra account and profile data (name, email, saved addresses, wishlist,
          and login) by contacting us.
        </p>
        <p>
          <strong className="text-foreground">What's deleted:</strong> your profile, saved addresses, wishlist, and
          login access.
        </p>
        <p>
          <strong className="text-foreground">What's retained:</strong> your past order records (items, amounts,
          delivery address on that order) are kept for accounting, tax, and dispute-resolution purposes, the same way
          any retailer retains sales records.
        </p>
        <p>
          We process deletion requests manually to confirm it's really you and to make sure nothing else is pending on
          your account. Expect a confirmation within a few business days.
        </p>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-5 text-[15px] leading-relaxed text-muted-foreground">
        To request account deletion, email{' '}
        <a href="mailto:support@yoventra.com" className="font-semibold text-foreground underline">
          support@yoventra.com
        </a>{' '}
        from your registered email address or include your registered phone number.
      </div>
    </div>
  );
}
