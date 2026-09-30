import { useEffect, useState } from 'react';
import { api } from '../api';
import { useInfluencerAuth } from '../AuthContext';
import { fmtDate } from '../format';
import { Alert, Badge, Button, Card, CardHeader, Field, Input, PasswordInput } from '../ui';

function ReadOnly({ label, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{children || '—'}</p>
    </div>
  );
}

export function ChangePasswordForm({ onDone }) {
  const { changePassword } = useInfluencerAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (form.newPassword.length < 8 || !/[A-Za-z]/.test(form.newPassword) || !/\d/.test(form.newPassword)) {
      return setMessage({ tone: 'danger', text: 'New password must be at least 8 characters, with letters and numbers.' });
    }
    if (form.newPassword !== form.confirm) return setMessage({ tone: 'danger', text: 'New passwords do not match.' });
    setSaving(true);
    try {
      await changePassword(form.currentPassword, form.newPassword);
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      setMessage({ tone: 'success', text: 'Password updated. Other devices have been logged out.' });
      onDone?.();
    } catch (err) {
      setMessage({ tone: 'danger', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Current password">
        <PasswordInput value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" />
      </Field>
      <Field label="New password" hint="At least 8 characters, with letters and numbers">
        <PasswordInput value={form.newPassword} onChange={set('newPassword')} autoComplete="new-password" />
      </Field>
      <Field label="Confirm new password">
        <PasswordInput value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
      </Field>
      {message ? <Alert tone={message.tone}>{message.text}</Alert> : null}
      <Button type="submit" loading={saving} disabled={!form.currentPassword || !form.newPassword}>
        Update password
      </Button>
    </form>
  );
}

export function InfluencerProfile() {
  const { influencer, setInfluencer } = useInfluencerAuth();
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = influencer.payoutDetails ?? {};
    setForm({
      email: influencer.email ?? '',
      phone: influencer.phone ?? '',
      upiId: d.upiId ?? '',
      accountHolderName: d.accountHolderName ?? '',
      accountNumber: d.accountNumber ?? '',
      ifsc: d.ifsc ?? '',
      bankName: d.bankName ?? '',
    });
  }, [influencer]);

  if (!form) return null;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSave(e) {
    e.preventDefault();
    setMessage(null);
    if (form.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(form.ifsc.trim())) return setMessage({ tone: 'danger', text: 'Enter a valid 11-character IFSC code.' });
    if (form.upiId && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(form.upiId.trim())) return setMessage({ tone: 'danger', text: 'Enter a valid UPI ID (e.g. name@okbank).' });
    setSaving(true);
    try {
      const updated = await api('/me', {
        method: 'PATCH',
        body: {
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          payoutDetails: {
            upiId: form.upiId.trim(),
            accountHolderName: form.accountHolderName.trim(),
            accountNumber: form.accountNumber.trim(),
            ifsc: form.ifsc.trim(),
            bankName: form.bankName.trim(),
          },
        },
      });
      setInfluencer(updated);
      setMessage({ tone: 'success', text: 'Profile saved.' });
    } catch (err) {
      setMessage({ tone: 'danger', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <Card>
          <CardHeader title="Account" subtitle="These details are managed by Yoventra. Contact support to change them." />
          <div className="grid grid-cols-2 gap-5 p-5 sm:grid-cols-3">
            <ReadOnly label="Name">{influencer.name}</ReadOnly>
            <ReadOnly label="Instagram">@{influencer.instagramUsername}</ReadOnly>
            <ReadOnly label="Influencer ID">
              <span className="font-mono">{influencer.influencerCode}</span>
            </ReadOnly>
            <ReadOnly label="Coupon code">
              <span className="font-mono">{influencer.coupon?.code}</span>
            </ReadOnly>
            <ReadOnly label="Joined">{fmtDate(influencer.approvedAt ?? influencer.createdAt)}</ReadOnly>
            <div>
              <p className="text-xs font-bold text-muted-foreground">Account status</p>
              <div className="mt-1">
                <Badge tone={influencer.status === 'active' ? 'success' : 'neutral'}>{influencer.status === 'active' ? 'Active' : influencer.status}</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Contact & payout details" subtitle="Yoventra sends your payouts to these details." />
          <form onSubmit={handleSave} className="space-y-5 p-5" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Email">
                <Input type="email" value={form.email} onChange={set('email')} />
              </Field>
              <Field label="Phone">
                <Input type="tel" value={form.phone} onChange={set('phone')} />
              </Field>
            </div>
            <div className="border-t border-border pt-5">
              <p className="mb-3 text-sm font-bold text-foreground">UPI (preferred)</p>
              <Field label="UPI ID">
                <Input value={form.upiId} onChange={set('upiId')} placeholder="name@okbank" />
              </Field>
            </div>
            <div className="border-t border-border pt-5">
              <p className="mb-3 text-sm font-bold text-foreground">Or bank account</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Account holder name">
                  <Input value={form.accountHolderName} onChange={set('accountHolderName')} />
                </Field>
                <Field label="Account number">
                  <Input inputMode="numeric" value={form.accountNumber} onChange={set('accountNumber')} />
                </Field>
                <Field label="IFSC">
                  <Input value={form.ifsc} onChange={(e) => setForm((f) => ({ ...f, ifsc: e.target.value.toUpperCase() }))} className="uppercase" maxLength={11} />
                </Field>
                <Field label="Bank name">
                  <Input value={form.bankName} onChange={set('bankName')} />
                </Field>
              </div>
            </div>
            {message ? <Alert tone={message.tone}>{message.text}</Alert> : null}
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
          </form>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader title="Change password" />
        <div className="p-5">
          <ChangePasswordForm />
        </div>
      </Card>
    </div>
  );
}
