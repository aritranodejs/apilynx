import {
  BarChart3,
  Gift,
  Layers,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const MARKETING_STATS: {
  value: number;
  suffix: string;
  label: string;
  detail: string;
  icon: LucideIcon;
}[] = [
  {
    value: 9,
    suffix: '+',
    label: 'Core workflows',
    detail: 'REST, GraphQL, mocks, tests & more',
    icon: Layers,
  },
  {
    value: 6,
    suffix: '',
    label: 'Tools compared',
    detail: 'Postman, Insomnia, Bruno & more',
    icon: BarChart3,
  },
  {
    value: 8,
    suffix: '',
    label: 'HTTP methods',
    detail: 'GET, QUERY, POST, PUT, PATCH, DELETE…',
    icon: Zap,
  },
  {
    value: 100,
    suffix: '%',
    label: 'Free core testing',
    detail: 'No paywall on essentials',
    icon: Gift,
  },
];

export const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Install or open in browser',
    text: 'Download for Windows, macOS, or Linux — or try Apilynx instantly at /app with zero setup.',
    accent: 'text-orange-400',
  },
  {
    step: '02',
    title: 'Send your first request',
    text: 'Paste a URL, import cURL, pick a method, and hit Send. Environments swap {{variables}} for you.',
    accent: 'text-emerald-400',
  },
  {
    step: '03',
    title: 'Organize & ship faster',
    text: 'Save to collections, run tests, generate docs, and share with your team — all in one place.',
    accent: 'text-sky-400',
  },
] as const;

export const WHY_SWITCH = [
  {
    title: 'Lightweight, not bloated',
    text: 'Focused on API testing — no heavy cloud account required just to send a GET request.',
  },
  {
    title: 'Built for real teams',
    text: 'Workspaces, collections, environments, and generated docs keep everyone aligned.',
  },
  {
    title: 'Honest comparison',
    text: 'See exactly how Apilynx stacks up against Postman, Insomnia, Bruno, and more.',
  },
] as const;

export const HERO_BADGE = 'Free · MIT · No signup required';

export const HERO_TRUST_LINE = 'MIT licensed · Desktop & browser · Postman-style workflows';
