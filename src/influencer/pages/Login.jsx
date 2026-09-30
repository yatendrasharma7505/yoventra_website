import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useInfluencerAuth } from '../AuthContext';
import { Alert, Button, Field, Input, PasswordInput } from '../ui';
import { AuthLayout } from './AuthLayout';

export function InfluencerLogin() {
  const { influencer, login, sessionMessage } = useInfluencerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [influencerCode, setInfluencerCode] = useState(location.state?.influencerCode ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (influencer) return <Navigate to="/influencer/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!influencerCode.trim() || !password) {
      setError({ tone: 'danger', message: 'Enter your Influencer ID and password.' });
      return;
    }
    setSubmitting(true);
    try {
      await login(influencerCode.trim(), password);
      navigate('/influencer/dashboard', { replace: true });
    } catch (err) {
      const pending = err.code === 'APPLICATION_PENDING';
      setError({ tone: pending ? 'warning' : 'danger', message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Influencer login" subtitle="Log in with the Influencer ID and password from Yoventra.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {location.state?.registered ? (
          <Alert tone="success">Application submitted! You can log in once the Yoventra team approves your account.</Alert>
        ) : null}
        {sessionMessage && !error ? <Alert tone="warning">{sessionMessage}</Alert> : null}
        {error ? <Alert tone={error.tone}>{error.message}</Alert> : null}

        <Field label="Influencer ID / Username">
          <Input
            value={influencerCode}
            onChange={(e) => setInfluencerCode(e.target.value.toUpperCase())}
            placeholder="e.g. PAYAL001"
            autoComplete="username"
            autoCapitalize="characters"
            className="font-mono uppercase"
            autoFocus
          />
        </Field>
        <Field label="Password">
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </Field>

        <Button type="submit" className="w-full py-3" loading={submitting}>
          Log in
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Forgot your password? Contact Yoventra support with your Influencer ID and we’ll reset it.
        </p>
        <div className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
          New to the program?{' '}
          <Link to="/influencer/register" className="font-bold text-accent hover:underline">
            Apply as an influencer
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
