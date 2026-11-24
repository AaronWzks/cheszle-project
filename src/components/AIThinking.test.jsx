/**
 * Tests de la tarea 2.C3: indicador «La IA está pensando...».
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AIThinking from './AIThinking';

describe('AIThinking (2.C3)', () => {
  it('muestra el texto cuando visible es true', () => {
    render(<AIThinking visible={true} />);
    expect(screen.getByRole('status').textContent).toBe('La IA está pensando...');
  });

  it('no muestra el texto cuando visible es false (pero el hueco sigue)', () => {
    render(<AIThinking visible={false} />);
    expect(screen.getByRole('status').textContent).toBe('');
  });
});