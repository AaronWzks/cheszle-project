import { useEffect, useId, useRef } from 'react';
import styles from './Modal.module.css';

/**
 * Ventana modal reutilizable.
 * Escape solicita el cierre mediante onClose.
 * @param {object} props
 * @param {string} props.title Título de la ventana.
 * @param {string} props.text Mensaje de la ventana.
 * @param {import('react').ReactNode} props.children Botones o contenido adicional.
 * @param {() => void} props.onClose Función que se ejecuta al cerrar con Escape.
 */
export default function Modal(props) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const textId = useId();

  useEffect(function () {
    const dialog = dialogRef.current;
    dialog.showModal();

    return function () {
      dialog.close();
    };
  }, []);

  function handleCancel(event) {
    event.preventDefault();
    props.onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={`modal ${styles.dialog}`}
      aria-labelledby={titleId}
      aria-describedby={textId}
      onCancel={handleCancel}
    >
      <h2 className="modal__titulo" id={titleId}>
        {props.title}
      </h2>

      <p className="modal__texto" id={textId}>
        {props.text}
      </p>

      {props.children}
    </dialog>
  );
}