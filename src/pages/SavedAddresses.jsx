import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function SavedAddresses() {
  const { isLoggedIn, openAuthModal } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', line: '', city: '', state: '', pin: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      openAuthModal('Please login to view saved addresses');
      return;
    }
    load();
  }, [isLoggedIn]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.getAddresses();
      const list = Array.isArray(res) ? res : res?.items || res?.addresses || [];
      setAddresses(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.addAddress(newAddr);
      setNewAddr({ name: '', phone: '', line: '', city: '', state: '', pin: '' });
      setShowAddForm(false);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to save address.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await api.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => (a.id || a._id) !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete address.');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.setDefaultAddress(id);
      await load();
    } catch (err) {
      alert(err.message || 'Failed to set default address.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-foreground">Saved Addresses</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage delivery locations for quick checkout</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-foreground shadow-md hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" /> Add Address
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-danger-bg p-4 text-xs font-bold text-danger border border-danger/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showAddForm && (
        <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
          <h3 className="text-sm font-extrabold text-foreground">Add New Address</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Full Name *"
                value={newAddr.name}
                onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold"
              />
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit Phone *"
                value={newAddr.phone}
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value.replace(/\D/g, '') })}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold"
              />
            </div>
            <input
              type="text"
              required
              placeholder="Address Line / House No. / Area *"
              value={newAddr.line}
              onChange={(e) => setNewAddr({ ...newAddr, line: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="City *"
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold"
              />
              <input
                type="text"
                placeholder="State"
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold"
              />
              <input
                type="text"
                required
                maxLength={6}
                placeholder="6-digit PIN *"
                value={newAddr.pin}
                onChange={(e) => setNewAddr({ ...newAddr, pin: e.target.value.replace(/\D/g, '') })}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 rounded-xl border border-border py-2 text-xs font-bold text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-primary py-2 text-xs font-bold text-white hover:bg-foreground"
              >
                {submitting ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {addresses.map((addr) => {
          const id = addr.id || addr._id;
          return (
            <div key={id} className="p-5 rounded-2xl bg-card border border-border flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-foreground">{addr.name}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-success bg-success-bg px-2 py-0.5 rounded-md">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{addr.phone}</p>
                <p className="text-xs text-muted-foreground">
                  {addr.line}, {addr.city}, {addr.state} - <strong>{addr.pin}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(id)}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground underline"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(id)}
                  className="p-1.5 text-muted-foreground hover:text-danger"
                  title="Delete address"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
