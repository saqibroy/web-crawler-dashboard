import { expect, describe, test, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';

describe('useDebounce', () => {
  vi.useFakeTimers();

  test('debounced value updates after delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'a', delay: 500 },
    });
    expect(result.current).toBe('a');
    rerender({ value: 'b', delay: 500 });
    expect(result.current).toBe('a');
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('b');
  });

  test('immediate value changes within delay do not trigger update', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'a', delay: 300 },
    });
    rerender({ value: 'b', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('a');
    rerender({ value: 'c', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('c');
  });
}); 