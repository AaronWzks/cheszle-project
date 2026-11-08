import { Link } from 'react-router-dom';

export default function Menu() {
  return (
    <div>
      <h1>Menú Principal</h1>
      {/* Paso 4: Enlace para probar la navegación */}
      <nav>
        <Link to="/levels">Ir a Selección de Niveles</Link>
      </nav>
    </div>
  );
}