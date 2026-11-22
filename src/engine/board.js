/**
 * Utilidades del tablero: matriz board[y][x], con null o una pieza por casilla.
 * Se utilizan matrices rectangulares y piezas con la forma definida en mockState.js.
 * Las operaciones copian las filas; los objetos pieza se tratan como inmutables.
 *
 * @typedef {import('./mockState.js').Piece} Piece
 * @typedef {import('./mockState.js').Position} Position
 * @typedef {(Piece | null)[][]} Board
 */

/**
 * Crea un tablero vacío con filas independientes.
 * @param {number} width Número de columnas, entero positivo.
 * @param {number} height Número de filas, entero positivo.
 * @returns {Board}
 * @throws {RangeError} Si alguna dimensión no es un entero positivo.
 */
export function createBoard(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new RangeError('El ancho y el alto deben ser enteros mayores que cero.');
  }

  return Array.from({ length: height }, () => Array(width).fill(null));
}
/**
 * Comprueba si unas coordenadas enteras están dentro del tablero.
 * @param {Board} board
 * @param {Position} pos
 * @returns {boolean} false también para un tablero vacío.
 */
export function isInside(board, { x, y }) {
  return (
    Number.isInteger(x) &&
    Number.isInteger(y) &&
    y >= 0 &&
    y < board.length &&
    x >= 0 &&
    x < board[0].length
  );
}

/**
 * Consulta una casilla sin modificar el tablero.
 * @param {Board} board
 * @param {Position} pos
 * @returns {Piece | null} null si la casilla está vacía o fuera del tablero.
 */
export function getPiece(board, pos) {
  if (isInside(board, pos)) {
    return board[pos.y][pos.x];
  } else {
    return null;
  }
}

/**
 * Devuelve un tablero nuevo con la pieza colocada; null vacía la casilla.
 * @param {Board} board
 * @param {Position} pos
 * @param {Piece | null} piece
 * @returns {Board} Conserva el tablero original y sus filas.
 * @throws {RangeError} Si la posición no es válida.
 */
export function setPiece(board, pos, piece) {
  if (!isInside(board, pos)) {
    throw new RangeError(`Casilla fuera del tablero: (${pos.x}, ${pos.y}).`);
  }

  const copy = board.map((fila) => [...fila]);
  copy[pos.y][pos.x] = piece;
  return copy;
}

/**
 * Traslada una pieza y sustituye lo que hubiera en el destino.
 * Las reglas de ajedrez, los turnos y los obstáculos no se validan en esta función.
 * @param {Board} board
 * @param {Position} from posicion inicial
 * @param {Position} to posicion destino
 * @returns {Board} Tablero nuevo, incluso si origen y destino coinciden.
 * @throws {RangeError} Si alguna posición no es válida.
 * @throws {Error} Si no hay pieza en el origen.
 */
export function movePiece(board, from, to) {
  if (!isInside(board, from) || !isInside(board, to)) {
    throw new RangeError('El origen y el destino deben estar dentro del tablero.');
  }

  const piece = getPiece(board, from);
  if (piece === null) {
    throw new Error(`No hay pieza en (${from.x}, ${from.y}).`);
  }

  const copy = board.map((row) => [...row]);
  copy[from.y][from.x] = null;
  copy[to.y][to.x] = piece;
  return copy;
}

/**
 * Busca por filas, de arriba abajo y de izquierda a derecha.
 * @param {Board} board
 * @param {(piece: Piece) => boolean} predicate Condición que debe cumplir la pieza.
 * @returns {{ x: number, y: number, piece: Piece } | null} Primera coincidencia o null.
 */
export function findPiece(board, predicate) {
  for (let y = 0; y < board.length; y += 1) {
    for (let x = 0; x < board[y].length; x += 1) {
      const piece = board[y][x];
      if (piece !== null && predicate(piece)) {
        return { x, y, piece };
      }
    }
  }

  return null;
}