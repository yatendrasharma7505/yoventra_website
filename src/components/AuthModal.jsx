import { useState, useEffect } from 'react';
import { X, Smartphone, ArrowRight, ShieldCheck, CheckCircle2, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthModal() {
  const { authModal, closeAuthModal, sendOtp, verifyOtp, registerCustomer } = useAuth();
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'profile'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (authModal.isOpen) {
      setStep('phone');
      setPhoneNumber('');
      setOtp(['', '', '', '', '', '']);
      setError(null);
    }
  }, [authModal.isOpen]);

  useEffect(() => {
    let interval;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  if (!authModal.isOpen) return null;

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await sendOtp(`+91${cleanPhone}`);
      setStep('otp');
      setResendTimer(30);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const res = await verifyOtp(`+91${cleanPhone}`, code);
      if (res.isNewUser) {
        setStep('profile');
      } else {
        closeAuthModal();
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await registerCustomer(name.trim(), email.trim() || undefined);
      closeAuthModal();
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextIdx = Math.min(pasted.length, 5);
      document.getElementById(`otp-${nextIdx}`)?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, '');
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Smartphone className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold font-display text-foreground">
            {step === 'phone' ? 'Login or Sign Up' : step === 'otp' ? 'Verify OTP' : 'Complete Profile'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {authModal.message || (
              step === 'phone'
                ? 'Enter your mobile number to get an instant OTP'
                : step === 'otp'
                ? `Enter the 6-digit code sent to +91 ${phoneNumber}`
                : 'Help us personalize your orders'
            )}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-danger-bg p-3 text-xs sm:text-sm font-semibold text-danger border border-danger/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Phone */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="flex rounded-xl border border-border bg-background focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all overflow-hidden">
                <span className="flex items-center px-3.5 text-sm font-bold text-foreground bg-secondary/50 border-r border-border">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  autoFocus
                  className="flex-1 px-4 py-3 text-base font-semibold text-foreground bg-transparent focus:outline-none placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.length !== 10}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent py-3.5 px-4 text-sm font-extrabold text-accent-foreground shadow-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Continue</span><ArrowRight className="h-4 w-4" /></>}
            </button>

            <div className="text-center">
              <p className="text-[11px] text-muted-foreground">
                By continuing, you agree to Yoventra's{' '}
                <a href="/privacy-policy" className="underline hover:text-foreground">Privacy Policy</a>
              </p>
            </div>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    autoFocus={idx === 0}
                    className="h-12 w-12 text-center text-xl font-extrabold rounded-xl border border-border bg-background focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-muted-foreground hover:text-foreground font-semibold"
              >
                Change Number
              </button>
              {resendTimer > 0 ? (
                <span className="text-muted-foreground">Resend OTP in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-accent font-bold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent py-3.5 px-4 text-sm font-extrabold text-accent-foreground shadow-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Verify & Login</span><CheckCircle2 className="h-4 w-4" /></>}
            </button>
          </form>
        )}

        {/* STEP 3: Profile */}
        {step === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Your Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                autoFocus
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground font-semibold focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground font-semibold focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent py-3.5 px-4 text-sm font-extrabold text-accent-foreground shadow-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Complete Setup</span><CheckCircle2 className="h-4 w-4" /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
