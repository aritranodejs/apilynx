'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/stores/auth-store';
import { showError, showSuccess } from '@/stores/toast-store';
import { User, Mail, Lock } from 'lucide-react';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const [name, setName] = useState(user?.name ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [tab, setTab] = useState<'profile' | 'security'>('profile');

  useEffect(() => {
    if (open && user) setName(user.name);
  }, [open, user]);

  if (!user) return null;

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      showError('Name is required');
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await authService.updateProfile({ userId: user.id, name: name.trim() });
      if (token) setAuth(updated, token);
      showSuccess('Profile updated');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await authService.changePassword({
        userId: user.id,
        currentPassword,
        newPassword,
      });
      showSuccess('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="My Profile" className="max-w-lg">
      <div className="flex gap-2 mb-4 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setTab('profile')}
          className={`px-3 py-1.5 text-xs rounded ${tab === 'profile' ? 'bg-zinc-800 text-orange-400' : 'text-zinc-500'}`}
        >
          Profile
        </button>
        <button
          type="button"
          onClick={() => setTab('security')}
          className={`px-3 py-1.5 text-xs rounded ${tab === 'security' ? 'bg-zinc-800 text-orange-400' : 'text-zinc-500'}`}
        >
          Security
        </button>
      </div>

      {tab === 'profile' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
            <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <User className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">{user.name}</p>
              <p className="text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs text-zinc-400">
              <User className="h-3 w-3" /> Display name
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs text-zinc-400">
              <Mail className="h-3 w-3" /> Email
            </label>
            <Input value={user.email} disabled className="opacity-60" />
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => void handleSaveProfile()} disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save profile'}
            </Button>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-3">
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs text-zinc-400">
              <Lock className="h-3 w-3" /> Current password
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">New password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Confirm new password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => void handleChangePassword()} disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Change password'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
