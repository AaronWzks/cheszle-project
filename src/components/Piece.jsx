// Vite carga todos los SVG de la carpeta
const iconos = import.meta.glob('../assets/pieces/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

// Solo para el texto alternativo (lo que lee un lector de pantalla)
const NOMBRE_VISIBLE = {
  king: 'Rey', queen: 'Dama', rook: 'Torre',
  bishop: 'Alfil', knight: 'Caballo', pawn: 'Peón',
};

export default function Piece({ type, color }) {
  const src = iconos[`../assets/pieces/${color}-${type}.svg`];
  if (!src) return null; // si falta un icono, no rompe la pantalla

  const nombre = `${NOMBRE_VISIBLE[type]} ${color === 'white' ? 'blanco' : 'negro'}`;
  return <img className="pieza" src={src} alt={nombre} draggable={false} />;
}