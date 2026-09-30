import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TermsContent } from '../TermsContent';
import { Card } from '../ui';

/** Inside the dashboard. */
export function InfluencerDashboardTerms() {
  return (
    <Card className="mx-auto max-w-3xl p-6 sm:p-8">
      <TermsHeader />
      <div className="mt-6">
        <TermsContent />
      </div>
    </Card>
  );
}

/** Public copy — linked from the registration checkbox. */
export function InfluencerPublicTerms() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link to="/influencer/register" className="text-sm font-bold text-accent hover:underline">
          ← Back to registration
        </Link>
        <Card className="mt-4 p-6 sm:p-10">
          <TermsHeader />
          <div className="mt-6">
            <TermsContent />
          </div>
        </Card>
      </div>
    </div>
  );
}

function TermsHeader() {
  return (
    <div className="space-y-3 border-b border-border pb-5">
      <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3.5 py-1 text-xs font-bold text-accent">
        <FileText className="h-4 w-4" />
        INFLUENCER PROGRAM
      </div>
      <h1 className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">Terms & Conditions</h1>
      <p className="text-sm text-muted-foreground">
        These terms apply to Yoventra influencers using a Yoventra coupon code and the Influencer Dashboard.
      </p>
    </div>
  );
}
