import React from 'react';

const PrintButton = () => (
  <button
    className="pvessai-printable-print-btn"
    style={{
      position: 'fixed',
      bottom: '32px',
      left: '32px',
      padding: '12px 28px',
      background: '#2a3b8f',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1.1rem',
      fontWeight: 600,
      boxShadow: '0 2px 8px rgba(30,34,90,0.10)',
      cursor: 'pointer',
      zIndex: 1000,
      printColorAdjust: 'exact',
    }}
    onClick={() => window.print()}
  >
    Imprimer
  </button>
);

export default PrintButton;
