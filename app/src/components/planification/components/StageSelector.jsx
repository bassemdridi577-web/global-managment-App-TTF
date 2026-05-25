import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * StageSelector Component
 * Displays checkboxes for selecting production stages and a button to plan them
 */
const StageSelector = ({
    selectedTransformers,
    selectedStages,
    setSelectedStages,
    productionStages,
    filteredLines,
    handlePlanifier
}) => {
    const navigate = useNavigate();
    if (!selectedTransformers || selectedTransformers.length === 0 || !productionStages) {
        return null;
    }

    const handleSelectAll = () => {

        const allPossibleStages = (productionStages || []).flatMap(s =>
            s === 'Couvercle (Découpage & Soudure)' ? ['Couvercle : Découpage', 'Couvercle : Soudure'] : s
        );

        if (selectedStages.length >= allPossibleStages.length) {
            setSelectedStages([]);
        } else {
            setSelectedStages(allPossibleStages);
        }
    };

    return (
        <div className="stage-selector-container">
            <div className="stage-selector-info">
                <span className="selected-count">
                    {selectedTransformers.length} transformateur(s) sélectionné(s)
                </span>
                <span className="selected-stages-count">
                    {selectedStages.length > 0 && ` • ${selectedStages.length} étape(s) sélectionnée(s)`}
                </span>
                <button
                    onClick={handleSelectAll}
                    className="btn btn-select-all"
                >
                    {(() => {
                        const allPossibleStages = (productionStages || []).flatMap(s =>
                            s === 'Couvercle (Découpage & Soudure)' ? ['Couvercle : Découpage', 'Couvercle : Soudure'] : s
                        );
                        return selectedStages.length >= allPossibleStages.length ? '❌ Tout désélectionner' : '✅ Tout sélectionner';
                    })()}
                </button>
            </div>
            <div className="stage-selector-grid">
                {(productionStages || []).map((stage, index) => {
                    // Check if this stage is already planned for any selected transformer
                    const selectedTransformerData = filteredLines.filter(item => selectedTransformers.includes(item.id));
                    let plannedCount = 0;
                    if (stage === 'Couvercle (Découpage & Soudure)') {
                        plannedCount = selectedTransformerData.filter(item =>
                            item.stageDates && (item.stageDates['Couvercle : Découpage'] || item.stageDates['Couvercle : Soudure'])
                        ).length;
                    } else {
                        plannedCount = selectedTransformerData.filter(item =>
                            item.stageDates && item.stageDates[stage]
                        ).length;
                    }
                    const isAlreadyPlanned = plannedCount > 0;
                    const allPlanned = plannedCount === selectedTransformerData.length;

                    return (
                        <label
                            key={index}
                            className={`stage-checkbox-label ${isAlreadyPlanned ? 'already-planned' : ''} ${allPlanned ? 'fully-planned' : ''}`}
                            title={isAlreadyPlanned ? `Déjà planifié pour ${plannedCount}/${selectedTransformerData.length} transformateur(s)` : ''}
                        >
                            <input
                                type="checkbox"
                                checked={stage === 'Couvercle (Découpage & Soudure)'
                                    ? (selectedStages.includes('Couvercle : Découpage') && selectedStages.includes('Couvercle : Soudure'))
                                    : selectedStages.includes(stage)}
                                onChange={(e) => {
                                    if (stage === 'Couvercle (Découpage & Soudure)') {
                                        if (e.target.checked) {
                                            setSelectedStages(prev => [...new Set([...prev, 'Couvercle : Découpage', 'Couvercle : Soudure'])]);
                                        } else {
                                            setSelectedStages(prev => prev.filter(s => s !== 'Couvercle : Découpage' && s !== 'Couvercle : Soudure'));
                                        }
                                    } else {
                                        if (e.target.checked) {
                                            setSelectedStages(prev => [...prev, stage]);
                                        } else {
                                            setSelectedStages(prev => prev.filter(s => s !== stage));
                                        }
                                    }
                                }}
                            />
                            <span className="stage-name">
                                {stage}
                                {isAlreadyPlanned && (
                                    <span className="planned-badge">
                                        {allPlanned ? '✓ Planifié' : `✓ ${plannedCount}/${selectedTransformerData.length}`}
                                    </span>
                                )}
                            </span>
                        </label>
                    );
                })}
            </div>
            <div className="stage-selector-actions">
                <button
                    onClick={handlePlanifier}
                    className="btn btn-primary"
                    disabled={selectedStages.length === 0}
                >
                    📅 Planifier {selectedStages.length > 0 && `(${selectedStages.length} étape${selectedStages.length > 1 ? 's' : ''})`}
                </button>
                <button
                    onClick={() => navigate('/operator-activities')}
                    className="btn btn-info"
                    style={{ marginLeft: '10px' }}
                >
                    👷 journaux des opération
                </button>
            </div>
        </div>
    );
};

export default StageSelector;
