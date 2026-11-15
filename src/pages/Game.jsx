import Board from '../components/Board';

export default function Game() {
    function handleSquareClick(pos) {
    console.log('Casilla pulsada:', pos);
  }

  return (
    <main className="pantalla pantalla--centrada">
      <h1>Juego</h1>

      <Board onSquareClick={handleSquareClick} />
    </main>
  );  
}