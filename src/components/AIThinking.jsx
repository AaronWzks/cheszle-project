import styles from './AIThinking.module.css';

/**
 * TAREA 2.C3 · Indicador «La IA está pensando...»
 *
 * Un spinner (círculo que gira) y un texto. Se ve solo cuando `visible` es true.
 *
 * ¿Por qué no lo quitamos del todo cuando no se ve?
 *   - Si apareciera y desapareciera, el tablero «saltaría» arriba y abajo en
 *     cada turno. Ocultándolo con CSS, el hueco se mantiene siempre.
 *   - role="status" avisa a los lectores de pantalla cuando cambia el texto,
 *     pero solo funciona bien si el elemento ya existía antes del cambio.
 *
 * @param {object} props
 * @param {boolean} props.visible true mientras la IA está pensando (state.aiThinking).
 */
export default function AIThinking({ visible }) {
  const classes = [styles.indicator];
  if (!visible) {
    classes.push(styles.hidden);
  }

  return (
    <div className={classes.join(' ')} role="status" aria-live="polite">
      {visible && (
        <>
          {/* El spinner es solo decorativo: el lector de pantalla lee el texto. */}
          <span className={styles.spinner} aria-hidden="true" />
          <span>La IA está pensando...</span>
        </>
      )}
    </div>
  );
}