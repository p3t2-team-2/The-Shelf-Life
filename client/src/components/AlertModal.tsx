import React from 'react';
import '../css/alertModal.css';

interface AlertModalProps {
  message: string;
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ message, onClose }) => {
  return (
    <div className="alert-modal-overlay">
      <div className="alert-modal">
        <p>{message}</p>
        <button onClick={onClose} className="alert-modal-close">
          Close
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
