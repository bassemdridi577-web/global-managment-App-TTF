import React from 'react';
import { FaTimes } from 'react-icons/fa';
import TransformerVisualizer from './VisualDiagram';

const VisualizerModal = ({ isOpen, onClose, L, b1, A, B }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                position: 'relative',
                background: '#1e293b',
                padding: '60px',
                borderRadius: '32px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 35px 70px -15px rgba(0, 0, 0, 0.6)',
                width: '850px',
                height: '700px',
                maxWidth: '95%',
                maxHeight: '95%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: 'white',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '18px',
                        transition: 'background 0.3s'
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                    onMouseLeave={e => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                    <FaTimes />
                </button>


                <TransformerVisualizer L={L} b1={b1} A={A} B={B} />

                <p style={{
                    color: '#94a3b8',
                    fontSize: '12px',
                    marginTop: '20px',
                    fontStyle: 'italic'
                }}>
                    Utilisez votre souris pour faire pivoter le modèle dans l'espace.
                </p>
            </div>
        </div>
    );
};

export default VisualizerModal;
