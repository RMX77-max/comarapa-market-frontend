import { describe, expect, it } from 'vitest';
import { formatearPrecio } from './formatearPrecio';

describe('formatearPrecio', () => {
  it('presenta importes en bolivianos', () => {
    expect(formatearPrecio(1250)).toContain('1.250');
    expect(formatearPrecio(1250)).toContain('Bs');
  });
});
