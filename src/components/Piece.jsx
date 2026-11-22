import styles from './Piece.module.css';

// Vite carga todos los SVG de la carpeta
const iconos = import.meta.glob('../assets/pieces/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

// Solo para el texto alternativo (lo que lee un lector de pantalla)
const NOMBRE_VISIBLE = {
  king: 'Rey', queen: 'Reina', rook: 'Torre',
  bishop: 'Alfil', knight: 'Caballo', pawn: 'Peón',
};

/**
 * @param {object} props
 * @param {string} props.type
 * @param {'white' | 'black'} props.color
 * @param {{ dx: number, dy: number } | null} [props.offset=null]
 *   Casillas hasta el origen si la pieza se acaba de mover; null si no.
 */

export default function Piece({ type, color, offset = null }) {
  const src = iconos[`../assets/pieces/${color}-${type}.svg`];
  if (!src) return null; // si falta un icono, no rompe la pantalla

  const nombre = `${NOMBRE_VISIBLE[type]} ${color === 'white' ? 'blanco' : 'negro'}`;

  //Elegimos la clase y las variables CSS
  //clase vale styles.moving si la pieza viene de otra casilla y styles.piece si no.
  //estilo contiene las variables CSS --dx y --dy solo cuando hace falta.
  const clase = offset !== null ? styles.moving : styles.piece; //si vale null la pieza no se acaba de mover
  const estilo = offset !== null ? { '--dx': offset.dx, '--dy': offset.dy } : undefined; //null es el valor por defecto si nadie lo pasa

return (
    <img
      className={`pieza ${clase}`}   //Pone dos clases a la imagen, el global pieza (estilos.css), y la de animacion
      src={src}
      alt={nombre}
      draggable={false}
      style={estilo} //pega las variables --dx y --dy en la imagen, y el CSS las lee con var(--dx).             
    />
  );  
}