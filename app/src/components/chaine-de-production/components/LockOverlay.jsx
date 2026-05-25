import React from 'react';

const LockOverlay = ({ previousStepName }) => (
    <div className="lock-overlay">
        <div className="lock-message">
            🔒 Verrouillé: Veuillez terminer l'étape "{previousStepName}" d'abord.
        </div>
    </div>
);

export default LockOverlay;
