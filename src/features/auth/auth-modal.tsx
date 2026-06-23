'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authService, projectService } from '@/services/auth';
import { useAuthStore } from '@/stores/auth-store';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { showError, showSuccess } from '@/stores/toast-store';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setProjects = useWorkspaceStore((s) => s.setProjects);

  const reset = () => {
    setEmail('');
    setPassword('');
    setName('');
    setMode('login');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showError('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const result =
        mode === 'login'
          ? await authService.login({ email: email.trim(), password })
          : await authService.register({
              email: email.trim(),
              password,
              name: name.trim() || email.split('@')[0],
            });
      setAuth(result.user, result.token);
      const projects = await projectService.getAll(result.user.id);
      setProjects(projects);
      showSuccess(mode === 'login' ? 'Welcome back!' : 'Account created');
      handleClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={mode === 'login' ? 'Sign in' : 'Create account'}>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        {mode === 'register' && (
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={6}
          />
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>
        <p className="text-center text-xs text-zinc-500">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            className="text-orange-400 hover:underline"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </form>
    </Modal>
  );
}
