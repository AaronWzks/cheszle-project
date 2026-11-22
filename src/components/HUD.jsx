import { useNavigate } from 'react-router-dom';
import { isInCheck } from '../engine';
import levels from '../engine/levels.json';
import { useGame } from '../state/GameContext';
import styles from './HUD.module.css';

/**
 * Obtiene el nombre del nivel a partir del id guardado en la partida.
 * @param {string} levelId
 * @returns {string}
 */
function getLevelName(levelId) {
  for (const level of levels) {
    if (level.id === levelId) {
      return level.name;
    }
  }

  return levelId;
}

/**
 * Convierte uno de los dos objetivos del proyecto en una instrucción legible.
 * @param {import('../engine/mockState.js').Objective} objective
 * @returns {string}
 */
function getObjectiveText(objective) {
  if (objective.type === 'reachSquare') {
    return 'Lleva al rey a la casilla marcada';
  }

  return 'Da jaque mate a las negras.';
}

/**
 * Muestra la información y los controles de la partida alrededor del tablero.
 * Reutiliza las clases y los colores del diseño compartido.
 * @param {object} props
 * @param {import('react').ReactNode} props.children Tablero de la partida.
 */
export default function HUD(props) {
  const game = useGame();
  const state = game.state;
  const dispatch = game.dispatch;
  const navigate = useNavigate();

  const levelName = getLevelName(state.levelId);
  const objectiveText = getObjectiveText(state.objective);
  const playerInCheck = isInCheck(state.board, 'white');
  const remainingMoves = Math.max(0, state.maxMoves - state.moveCount);

  let turnClass = 'turno';
  let turnText = 'Tu turno';

  if (state.turn === 'black') {
    turnClass = 'turno turno--ia';
    turnText = 'Turno de la IA';
  }

  function handleRestart() {
    dispatch({ type: 'START', levelId: state.levelId });
  }

  function handleExit() {
    navigate('/levels');
  }

  return (
    <div className="app">
      <header className="cabecera">
        <button
          type="button"
          className="btn-cuadro"
          aria-label="Salir"
          title="Salir"
          onClick={handleExit}
        >
          ‹
        </button>

        <h1 className="cabecera__titulo">{levelName}</h1>

        <button
          type="button"
          className="btn-cuadro"
          aria-label="Reiniciar"
          title="Reiniciar"
          onClick={handleRestart}
        >
          ↻
        </button>
      </header>

      <main className={`pantalla ${styles.content}`}>
        <section
          className={styles.information}
          aria-label="Información de la partida"
        >
          <p className="objetivo">
            <span
              className={`objetivo__icono ${styles.icon}`}
              aria-hidden="true"
            >
              ★
            </span>

            <span>
              <strong>Objetivo:</strong> {objectiveText}
            </span>
          </p>

          <div
            className={styles.details}
            aria-live="polite"
            aria-atomic="true"
          >
            <p className={turnClass}>{turnText}</p>

            <p className={styles.movements}>
              Movimientos restantes: {remainingMoves}
            </p>
          </div>

          {playerInCheck && (
            <p className="mensaje mensaje--error" role="alert">
              <strong>Tu rey está en jaque.</strong>
            </p>
          )}
        </section>

        {props.children}
      </main>
    </div>
  );
}