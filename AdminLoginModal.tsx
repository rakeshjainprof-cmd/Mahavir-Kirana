import React, { useState } from 'react';
import { X, ShieldCheck, Lock, KeyRound, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adminId.trim(), password: password.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('mahavir_admin_token', data.token);
        onSuccess(data.token);
        setAdminId('');
        setPassword('');
        onClose();
      } else {
        setError(data.message || 'Invalid Admin Credentials');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      
      <div className="relative w-full max-w-sm bg-stone-200 rounded-3xl shadow-2xl border border-stone-300 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-stone-900 font-extrabold text-xs shadow-md">
              <ShieldCheck className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <h2 className="font-black text-base leading-tight">Store Admin Portal</h2>
              <p className="text-[11px] text-emerald-200">Mahavir Kirana and General Store</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-900 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Admin ID */}
          <div>
            <label className="block text-xs font-extrabold text-stone-800 mb-1.5">
              Admin Login ID
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                required
                placeholder="Enter Admin ID"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-full text-xs font-bold text-stone-900 focus:border-emerald-700 focus:outline-none shadow-xs"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-extrabold text-stone-800 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-full text-xs font-bold text-stone-900 focus:border-emerald-700 focus:outline-none shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-900 hover:bg-emerald-950 active:bg-black text-amber-300 font-black text-xs py-3.5 px-4 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 text-white">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Authenticating...
              </span>
            ) : (
              <span>LOGIN TO ADMIN DASHBOARD</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
