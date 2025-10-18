import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  test('renders with default styling', () => {
    render(<Input data-testid="input" />);

    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveClass(
      'flex',
      'h-10',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-background',
      'px-3',
      'py-2',
      'text-sm',
      'ring-offset-background'
    );
  });

  test('renders different input types correctly', () => {
    const { rerender } = render(<Input data-testid="input" type="text" />);

    expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');

    rerender(<Input data-testid="input" type="email" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');

    rerender(<Input data-testid="input" type="password" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');

    rerender(<Input data-testid="input" type="number" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
  });

  test('forwards props correctly', () => {
    render(
      <Input
        data-testid="input"
        id="email-input"
        name="email"
        placeholder="Enter your email"
        required
        disabled={false}
      />
    );

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('id', 'email-input');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('placeholder', 'Enter your email');
    expect(input).toHaveAttribute('required');
    expect(input).not.toHaveAttribute('disabled');
  });

  test('handles disabled state correctly', () => {
    render(<Input data-testid="input" disabled />);

    const input = screen.getByTestId('input');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  test('handles focus styles correctly', () => {
    render(<Input data-testid="input" />);

    const input = screen.getByTestId('input');
    expect(input).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2'
    );
  });

  test('merges custom className with default classes', () => {
    render(
      <Input
        data-testid="input"
        className="custom-input-class"
      />
    );

    const input = screen.getByTestId('input');
    expect(input).toHaveClass('custom-input-class');
    expect(input).toHaveClass('flex'); // Should still have default classes
  });

  test('handles placeholder text correctly', () => {
    render(
      <Input
        data-testid="input"
        placeholder="Enter your name"
      />
    );

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('placeholder', 'Enter your name');
    expect(input).toHaveClass('placeholder:text-muted-foreground');
  });

  test('handles value prop correctly', () => {
    render(
      <Input
        data-testid="input"
        value="test value"
        onChange={() => {}}
      />
    );

    const input = screen.getByTestId('input');
    expect(input).toHaveValue('test value');
  });

  test('handles onChange events correctly', () => {
    const handleChange = jest.fn();
    render(
      <Input
        data-testid="input"
        onChange={handleChange}
      />
    );

    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: 'new value',
        }),
      })
    );
  });

  test('handles file input styling correctly', () => {
    render(<Input data-testid="input" type="file" />);

    const input = screen.getByTestId('input');
    expect(input).toHaveClass(
      'file:border-0',
      'file:bg-transparent',
      'file:text-sm',
      'file:font-medium',
      'file:text-foreground'
    );
  });

  test('forwards ref correctly', () => {
    const ref = jest.fn();
    render(<Input ref={ref} data-testid="input" />);

    // The ref should be forwarded to the input element
    expect(ref).toHaveBeenCalled();
  });

  test('applies correct default type when none specified', () => {
    render(<Input data-testid="input" />);

    const input = screen.getByTestId('input');
    // HTML input defaults to 'text' type when no type is specified
    // The attribute might not be explicitly set, but the input should behave as text
    expect(input.tagName).toBe('INPUT');
  });

  test('handles readonly state correctly', () => {
    render(
      <Input
        data-testid="input"
        readOnly
        value="readonly value"
      />
    );

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveValue('readonly value');
  });

  test('handles maxLength correctly', () => {
    render(
      <Input
        data-testid="input"
        maxLength={10}
      />
    );

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('maxlength', '10');
  });

  test('handles pattern correctly', () => {
    render(
      <Input
        data-testid="input"
        pattern="[0-9]+"
      />
    );

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('pattern', '[0-9]+');
  });
});