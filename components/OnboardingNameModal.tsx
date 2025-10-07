"use client";
import { useEffect, useState } from 'react';

interface OnboardingNameModalProps {
  onComplete: () => void;
}

export default function OnboardingNameModal({ onComplete }: OnboardingNameModalProps) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/users/me-basic');
        if (!res.ok) return;
        const data = await res.json();
        if (active && data.needs_name) {
          setOpen(true);
        }
      } catch {/* ignore */}
    })();
    return () => { active = false; };
  }, []);

  async function submit(_e: React.FormEvent) {
    _e.preventDefault();
    setError(null);
    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/users/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName || undefined })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed');
      } else {
        setOpen(false);
        onComplete();
      }
    } catch (e: any) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-[#1b1b1f] border border-[#2f2f36] rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-1">Complete your profile</h2>
        <p className="text-sm text-zinc-400 mb-4">Choose your display name. First name is required; last name is optional.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide mb-1 text-zinc-400">First Name *</label>
            <input
              className="w-full px-3 py-2 rounded-md bg-[#232327] border border-[#33333a] focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              maxLength={60}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide mb-1 text-zinc-400">Last Name (optional)</label>
            <input
              className="w-full px-3 py-2 rounded-md bg-[#232327] border border-[#33333a] focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              maxLength={60}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="submit" disabled={loading || !firstName.trim()} className="px-4 py-2 text-sm rounded-md bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-medium hover:opacity-90 disabled:opacity-60">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
