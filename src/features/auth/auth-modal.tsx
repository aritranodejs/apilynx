'use client';

import { useEffect, useState } from 'react';
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

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setProjects = useWorkspaceStore((s) => s.setProjects);

  useEffect(() => {
    if (!open) return;
    void authService.isGoogleConfigured().then(setGoogleEnabled).catch(() => setGoogleEnabled(false));
  }, [open]);

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

  const completeAuth = async (result: Awaited<ReturnType<typeof authService.login>>) => {
    setAuth(result.user, result.token);
    const projects = await projectService.getAll(result.user.id);
    setProjects(projects);
    handleClose();
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
      await completeAuth(result);
      showSuccess(mode === 'login' ? 'Welcome back!' : 'Account created');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await authService.loginWithGoogle();
      await completeAuth(result);
      showSuccess('Signed in with Google');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const busy = loading || googleLoading;

  return (
    <Modal open={open} onClose={handleClose} title={mode === 'login' ? 'Sign in' : 'Create account'}>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        {googleEnabled && (
          <>
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2"
              onClick={() => void handleGoogleSignIn()}
              disabled={busy}
            >
              <GoogleIcon />
              {googleLoading ? 'Opening Google...' : 'Continue with Google'}
            </Button>
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-[10px] uppercase tracking-wide text-zinc-500">or</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>
          </>
        )}

        {mode === 'register' && (
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              disabled={busy}
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
            disabled={busy}
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
            disabled={busy}
          />
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={busy}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>
        <p className="text-center text-xs text-zinc-500">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            className="text-orange-400 hover:underline"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            disabled={busy}
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </form>
    </Modal>
  );
}
