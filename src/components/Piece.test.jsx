import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Piece from './Piece';

const TIPOS = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'];
const COLORES = ['white', 'black'];

describe('Piece', () => {
  it('muestra un icono distinto para cada una de las 12 piezas (6 tipos x 2 colores)', () => {
    // Vite puede convertir los SVG pequeños en data:, así que no miramos el nombre del archivo
    // sino que cada pieza tenga imagen y que no haya dos iguales.
    const srcs = new Set();
    for (const color of COLORES) {
      for (const type of TIPOS) {
        const { container, unmount } = render(<Piece type={type} color={color} />);
        const img = container.querySelector('img');
        expect(img, `${color}-${type}`).not.toBeNull();
        expect(img.getAttribute('src')).toBeTruthy();
        srcs.add(img.getAttribute('src'));
        unmount();
      }
    }
    expect(srcs.size).toBe(12);
  });

  it('pone un texto alternativo en castellano', () => {
    render(<Piece type="king" color="white" />);
    expect(screen.getByAltText('Rey blanco')).toBeTruthy();
  });

  it('no rompe si la pieza no existe', () => {
    const { container } = render(<Piece type="dragon" color="white" />);
    expect(container.firstChild).toBeNull();
  });
});
