import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;

beforeAll(function () {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };

  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});

afterAll(function () {
  if (originalShowModal === undefined) {
    delete HTMLDialogElement.prototype.showModal;
  } else {
    HTMLDialogElement.prototype.showModal = originalShowModal;
  }

  if (originalClose === undefined) {
    delete HTMLDialogElement.prototype.close;
  } else {
    HTMLDialogElement.prototype.close = originalClose;
  }
});

describe('Modal', function () {
  it('abre el diálogo con título, texto y contenido recibidos', function () {
    const onClose = vi.fn();

    render(
      <Modal
        title="Resultado de prueba"
        text="Mensaje del resultado."
        onClose={onClose}
      >
        <button type="button">Aceptar</button>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog', {
      name: 'Resultado de prueba',
    });

    const description = document.getElementById(
      dialog.getAttribute('aria-describedby'),
    );

    expect(dialog.open).toBe(true);
    expect(description.textContent).toBe('Mensaje del resultado.');
    expect(screen.getByRole('button', { name: 'Aceptar' })).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('comunica cancel al propietario e impide el cierre nativo automático', function () {
    const onClose = vi.fn();

    render(
      <Modal title="Resultado" text="Mensaje." onClose={onClose} />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Resultado' });
    const event = new Event('cancel', { cancelable: true });

    fireEvent(dialog, event);

    expect(event.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra el diálogo al desmontar el componente', function () {
    const view = render(
      <Modal title="Resultado" text="Mensaje." onClose={vi.fn()} />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Resultado' });

    view.unmount();

    expect(dialog.open).toBe(false);
    expect(document.body.contains(dialog)).toBe(false);
  });
});