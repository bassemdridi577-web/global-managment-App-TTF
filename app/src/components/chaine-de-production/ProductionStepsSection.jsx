import React from 'react';
import ProductionStepCard from './ProductionStepCard';

/**
 * Production Steps Section Component
 * Manages all 9 production steps: CALAGE, FERMETURE, CABLAGE BT, CABLAGE MT, 
 * ETUVAGE, ECUVAGE, REMPLISSAGE D'HUILE, ÉTANCHEITÉ, PEINTURE
 */
const ProductionStepsSection = ({
    productionStepsData,
    setProductionStepsData,
    saveStatuses,
    saveHandlers
}) => {
    // Generic handler to update any step's field
    const handleStepDataChange = (stepKey, field, value) => {
        setProductionStepsData({
            ...productionStepsData,
            [stepKey]: {
                ...productionStepsData[stepKey],
                [field]: value
            }
        });
    };

    return (
        <>
            {/* CALAGE */}
            <ProductionStepCard
                title="CALAGE"
                stepKey="calage"
                stepData={productionStepsData.calage}
                onDataChange={handleStepDataChange}
                onSave={saveHandlers.handleSaveCalage}
                saveStatus={saveStatuses.calage}
            />

            {/* FERMETURE */}
            <ProductionStepCard
                title="FERMETURE"
                stepKey="fermeture"
                stepData={productionStepsData.fermeture}
                onDataChange={handleStepDataChange}
                onSave={saveHandlers.handleSaveFermeture}
                saveStatus={saveStatuses.fermeture}
            />

            {/* CABLAGE BT */}
            <ProductionStepCard
                title="CABLAGE BT"
                stepKey="cablageBT"
                stepData={productionStepsData.cablageBT}
                onDataChange={handleStepDataChange}
                onSave={saveHandlers.handleSaveCablageBT}
                saveStatus={saveStatuses.cablageBT}
            />

            {/* CABLAGE MT */}
            <ProductionStepCard
                title="CABLAGE MT"
                stepKey="cablageMT"
                stepData={productionStepsData.cablageMT}
                onDataChange={handleStepDataChange}
                onSave={saveHandlers.handleSaveCablageMT}
                saveStatus={saveStatuses.cablageMT}
            />

            {/* ETUVAGE - with extra "Four" field */}
            <ProductionStepCard
                title="ETUVAGE"
                stepKey="etuvage"
                stepData={productionStepsData.etuvage}
                onDataChange={handleStepDataChange}
                onSave={saveHandlers.handleSaveEtuvage}
                saveStatus={saveStatuses.etuvage}
                extraFields={
                    <tr>
                        <td className="label-cell">Four:</td>
                        <td colSpan="3">
                            <select
                                value={productionStepsData.etuvage.four || ''}
                                onChange={(e) => handleStepDataChange('etuvage', 'four', e.target.value)}
                            >
                                <option value="">-</option>
                                <option value="Triphasé">Triphasé</option>
                                <option value="Monophasé">Monophasé</option>
                                <option value="Réparation">Réparation</option>
                            </select>
                        </td>
                    </tr>
                }
            />

            {/* ECUVAGE - with extra "Controle (vente)" field */}
            <ProductionStepCard
                title="ECUVAGE"
                stepKey="ecuvage"
                stepData={productionStepsData.ecuvage}
                onDataChange={handleStepDataChange}
                onSave={saveHandlers.handleSaveEcuvage}
                saveStatus={saveStatuses.ecuvage}
                extraFields={
                    <tr>
                        <td className="label-cell">Controle (vente):</td>
                        <td colSpan="3">
                            <input
                                type="text"
                                className="full-width"
                                value={productionStepsData.ecuvage.controleVente || ''}
                                onChange={(e) => handleStepDataChange('ecuvage', 'controleVente', e.target.value)}
                            />
                        </td>
                    </tr>
                }
            />

            {/* REMPLISSAGE D'HUILE */}
            <ProductionStepCard
                title="REMPLISSAGE D'HUILE"
                stepKey="remplissageDhuile"
                stepData={productionStepsData.remplissageDhuile}
                onDataChange={handleStepDataChange}
                onSave={saveHandlers.handleSaveRemplissageDhuile}
                saveStatus={saveStatuses.remplissageDhuile}
            />

            {/* ÉTANCHEITÉ */}
            <ProductionStepCard
                title="ÉTANCHEITÉ"
                stepKey="etancheite"
                stepData={productionStepsData.etancheite}
                onDataChange={handleStepDataChange}
                onSave={saveHandlers.handleSaveEtancheite}
                saveStatus={saveStatuses.etancheite}
            />

            {/* PEINTURE */}
            <ProductionStepCard
                title="PEINTURE"
                stepKey="peinture"
                stepData={productionStepsData.peinture}
                onDataChange={handleStepDataChange}
                onSave={saveHandlers.handleSavePeinture}
                saveStatus={saveStatuses.peinture}
            />
        </>
    );
};

export default ProductionStepsSection;
