export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-4xl px-5 py-6 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Yoventra. All rights reserved.</p>
        <p className="mt-1">
          Questions about your data? Contact us at{' '}
          <a href="mailto:support@yoventra.com" className="font-medium text-foreground hover:underline">
            support@yoventra.com
          </a>
        </p>
      </div>
    </footer>
  );
}
