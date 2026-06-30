import * as React from 'react';

export interface ModalProps {
  /** Whether the dialog is shown. */
  open?: boolean;
  /** Dialog title. */
  title?: React.ReactNode;
  /** Dialog body. */
  children?: React.ReactNode;
  /** Footer actions, e.g. Buttons. */
  actions?: React.ReactNode;
  /** Dialog width. */
  size?: 'small' | 'medium' | 'large';
  onClose?: () => void;
}

/**
 * A modal dialog — WaniKani uses these for the lesson picker, confirmations and
 * settings prompts. The overlay fills its positioned container (use a fixed
 * wrapper in the app).
 */
export function Modal({ open = true, title, children, actions, size = 'medium', onClose }: ModalProps) {
  if (!open) return null;
  return (
    <div className="wk-modal-overlay" onClick={onClose}>
      <div className={`wk-modal wk-modal--${size}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {title ? (
          <div className="wk-modal__head">
            <h3 className="wk-modal__title">{title}</h3>
            <button type="button" className="wk-modal__close" aria-label="Close" onClick={onClose}>
              ✕
            </button>
          </div>
        ) : null}
        <div className="wk-modal__body">{children}</div>
        {actions ? <div className="wk-modal__footer">{actions}</div> : null}
      </div>
    </div>
  );
}
