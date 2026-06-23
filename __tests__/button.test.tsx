import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Send Request</Button>);
    expect(screen.getByRole('button', { name: 'Send Request' })).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Button variant="primary">Send</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-[var(--accent)]');
  });

  it('can be disabled', () => {
    render(<Button disabled>Send</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
