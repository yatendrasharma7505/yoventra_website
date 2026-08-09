const LAST_UPDATED = 'August 5, 2026';

export function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <div className="mt-8 space-y-8 text-foreground">
        <Section title="1. Who we are">
          <p>
            Yoventra ("we", "us", "our") operates the Yoventra mobile app and website, a clothing and fashion
            storefront. This policy explains what information we collect when you use Yoventra, how we use it, who
            we share it with, and how you can have it deleted.
          </p>
        </Section>

        <Section title="2. Information we collect">
          <p>We collect only what's needed to run the store and fulfil your orders:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Account details</strong> — your phone number (used to sign in via one-time password), and
              optionally your name and email if you add them to your profile.
            </li>
            <li>
              <strong>Delivery addresses</strong> — the name, address, city, pincode, and phone number you provide
              for each order, so it can be shipped to you.
            </li>
            <li>
              <strong>Order history</strong> — items purchased, quantities, prices, order status, and payment mode
              (cash on delivery or online payment).
            </li>
            <li>
              <strong>Payment information</strong> — for online payments we use Razorpay to process the transaction.
              We store the payment reference/transaction ID Razorpay gives us to confirm your order; we never see or
              store your card, UPI, or bank details ourselves.
            </li>
            <li>
              <strong>Reviews and wishlist</strong> — product ratings, reviews, and wishlist items you choose to add.
            </li>
          </ul>
        </Section>

        <Section title="3. How we use your information">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>To create your account and verify it's really you (via OTP).</li>
            <li>To process, ship, and track your orders.</li>
            <li>To show your order history, wishlist, and reviews back to you in the app.</li>
            <li>To contact you about an order (e.g. delivery updates, order issues).</li>
          </ul>
          <p>We do not sell your personal information to anyone.</p>
        </Section>

        <Section title="4. Who we share it with">
          <p>We share the minimum needed with the services that help us run the store:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Firebase (Google)</strong> — handles phone number sign-in and verification.
            </li>
            <li>
              <strong>Razorpay</strong> — processes online payments. Razorpay has its own privacy policy governing
              the payment details you enter with them directly.
            </li>
            <li>
              <strong>Delhivery</strong> — our shipping partner. To deliver your order, we share the recipient name,
              address, phone number, and order contents with Delhivery.
            </li>
          </ul>
        </Section>

        <Section title="5. Data retention">
          <p>
            We keep order records (including the address and items on that order) for as long as needed for
            accounting, tax, warranty, and dispute-resolution purposes, even if you later delete your account — this
            mirrors standard retail record-keeping practice. Your account profile (name, email, saved login) is
            deleted on request; see below.
          </p>
        </Section>

        <Section title="6. Your rights">
          <p>You can:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>View and update your profile information in the app at any time.</li>
            <li>Request deletion of your account and profile data — see our Delete Account page.</li>
            <li>Contact us with any privacy question at support@yoventra.com.</li>
          </ul>
        </Section>

        <Section title="7. Changes to this policy">
          <p>
            If we make material changes to this policy, we'll update the "Last updated" date above. Continued use of
            Yoventra after a change means you accept the updated policy.
          </p>
        </Section>

        <Section title="8. Contact us">
          <p>
            Questions about this policy or your data? Email{' '}
            <a href="mailto:support@yoventra.com" className="font-medium underline">
              support@yoventra.com
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <div className="mt-2 space-y-2 text-[15px] leading-relaxed text-muted-foreground [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}
