import { KeyValueEditor } from '@/components/ui/key-value-editor';
import { createEmptyKeyValue } from '@/lib/utils';
import { render, screen, fireEvent } from '@testing-library/react';

describe('KeyValueEditor', () => {
  it('renders key-value rows', () => {
    const pairs = [createEmptyKeyValue()];
    const onChange = jest.fn();
    render(<KeyValueEditor pairs={pairs} onChange={onChange} />);
    expect(screen.getByPlaceholderText('Key')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Value')).toBeInTheDocument();
  });

  it('calls onChange when adding a row', () => {
    const pairs = [createEmptyKeyValue()];
    const onChange = jest.fn();
    render(<KeyValueEditor pairs={pairs} onChange={onChange} />);
    fireEvent.click(screen.getByText('Add'));
    expect(onChange).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ key: '' })]));
  });
});
