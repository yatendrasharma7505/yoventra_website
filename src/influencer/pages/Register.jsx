import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useInfluencerAuth } from '../AuthContext';
import { TermsContent } from '../TermsContent';
import { Alert, Button, Field, Input, PasswordInput, Textarea } from '../ui';
import { AuthLayout } from './AuthLayout';

const EMPTY = {
  name: '',
  instagramUsername: '',
  email: '',
  phone: '',
  followers: '',
  influencerCode: '',
  password: '',
  confirmPassword: '',
  message: '',
};

// Mirrors the backend's registerSchema; the server re-validates everything.
function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Enter your full name';
  if (!/^@?[a-zA-Z0-9._]{1,30}$/.test(f.instagramUsername.trim())) e.instagramUsername = 'Enter a valid Instagram username';
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email';
  if (f.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid phone number';
  if (f.followers && !/^\d+$/.test(f.followers)) e.followers = 'Numbers only';
  if (!/^[A-Z0-9_]{4,20}$/.test(f.influencerCode)) e.influencerCode = '4–20 letters, numbers or _';
  if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) e.password = 'At least 8 characters, with letters and numbers';
  if (f.confirmPassword !== f.password) e.confirmPassword = 'Passwords do not match';
  return e;
}

export function InfluencerRegister() {
  const { influencer } = useInfluencerAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (influencer) return <Navigate to="/influencer/dashboard" replace />;

  const set = (key) => (e) => {
    let value = e.target.value;
    if (key === 'influencerCode') value = value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (!acceptTerms) {
      setServerError('Please read and accept the Terms & Conditions to continue.');
      return;
    }

    setSubmitting(true);
    try {
      await api('/auth/register', {
        method: 'POST',
        auth: false,
        body: {
          name: form.name.trim(),
          instagramUsername: form.instagramUsername.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          followers: form.followers ? Number(form.followers) : null,
          influencerCode: form.influencerCode,
          password: form.password,
          message: form.message.trim(),
          acceptTerms: true,
        },
      });
      navigate('/influencer/login', { replace: true, state: { registered: true, influencerCode: form.influencerCode } });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      wide
      title="Apply as an influencer"
      subtitle="Tell us about yourself. Once the Yoventra team approves your application, you’ll get your coupon code and dashboard access."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name *" error={errors.name}>
            <Input value={form.name} onChange={set('name')} autoComplete="name" />
          </Field>
          <Field label="Instagram username *" error={errors.instagramUsername}>
            <Input value={form.instagramUsername} onChange={set('instagramUsername')} placeholder="@yourhandle" />
          </Field>
          <Field label="Email *" error={errors.email}>
            <Input type="email" value={form.email} onChange={set('email')} autoComplete="email" />
          </Field>
          <Field label="Phone number *" error={errors.phone}>
            <Input type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="98765 43210" />
          </Field>
          <Field label="Followers (approx.)" error={errors.followers}>
            <Input inputMode="numeric" value={form.followers} onChange={set('followers')} placeholder="e.g. 12000" />
          </Field>
          <Field label="Choose your Influencer ID *" error={errors.influencerCode} hint="You’ll log in with this">
            <Input value={form.influencerCode} onChange={set('influencerCode')} placeholder="e.g. PAYAL001" className="font-mono" maxLength={20} />
          </Field>
          <Field label="Password *" error={errors.password}>
            <PasswordInput value={form.password} onChange={set('password')} autoComplete="new-password" />
          </Field>
          <Field label="Confirm password *" error={errors.confirmPassword}>
            <PasswordInput value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" />
          </Field>
        </div>
        <Field label="Anything you’d like us to know? (optional)">
          <Textarea value={form.message} onChange={set('message')} maxLength={1000} placeholder="Your niche, content style, other platforms…" />
        </Field>

        <div className="rounded-xl border border-border bg-card">
          <p className="border-b border-border px-4 py-3 text-sm font-bold text-foreground">Terms & Conditions</p>
          <div className="max-h-56 overflow-y-auto px-4 py-3">
            <TermsContent compact />
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-secondary/40 p-4">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => {
              setAcceptTerms(e.target.checked);
              setServerError(null);
            }}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
          />
          <span className="text-sm text-foreground">
            I have read and agree to the Yoventra Influencer{' '}
            <Link to="/influencer/terms" target="_blank" className="font-bold text-accent hover:underline">
              Terms & Conditions
            </Link>
            .
          </span>
        </label>

        {serverError ? <Alert>{serverError}</Alert> : null}

        <Button type="submit" className="w-full py-3" loading={submitting} disabled={!acceptTerms}>
          Submit application
        </Button>
        {!acceptTerms ? <p className="-mt-2 text-center text-xs text-muted-foreground">Accept the Terms & Conditions to submit.</p> : null}

        <p className="text-center text-sm text-muted-foreground">
          Already approved?{' '}
          <Link to="/influencer/login" className="font-bold text-accent hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
