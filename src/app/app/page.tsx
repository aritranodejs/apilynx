import { AppShell } from '@/components/layout/app-shell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'App — Apilynx',
  description: 'Apilynx API client workspace',
};

export default function AppPage() {
  return <AppShell />;
}
