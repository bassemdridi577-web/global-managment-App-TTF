import { useEffect } from 'react';
import { initialThermique } from '../etude/EtudeConstants';

// Sub-hooks
import { useBilanElectricalSync } from './hooks/useBilanElectricalSync';
import { useBilanBTMTDimensionSync } from './hooks/useBilanBTMTDimensionSync';
import { useBilanMagneticSync } from './hooks/useBilanMagneticSync';
import { useBilanLossSync } from './hooks/useBilanLossSync';
import { useBilanWeightSync } from './hooks/useBilanWeightSync';
import { useBilanThermalSync } from './hooks/useBilanThermalSync';
import { useBilanP0Sync } from './hooks/useBilanP0Sync';
import { useBilanBobinageSync } from './hooks/useBilanBobinageSync';
import { useBilanUpnSync } from './hooks/useBilanUpnSync';
import { useBilanGraduationSync } from './hooks/useBilanGraduationSync';
import { useBilanConsolidatedResults } from './hooks/useBilanConsolidatedResults';

/**
 * Main hook for Bilan module calculations.
 * Decomposed into specialized sub-hooks for better maintainability.
 */
const useBilanCalculations = (props) => {
    const { etudeData, setEtudeData, calculatedData, setCalculatedData } = props;

    // 0. Self-healing for donneesThermique and Regime Sync
    useEffect(() => {
        const checkSection = (sec) => {
            if (!etudeData.donneesThermique || !etudeData.donneesThermique[sec] || !Array.isArray(etudeData.donneesThermique[sec])) return true;
            const existingLabels = etudeData.donneesThermique[sec].map(r => r.label);
            return initialThermique[sec].some(row => !existingLabels.includes(row.label));
        };

        const needsHealing = !etudeData.donneesThermique ||
            checkSection('secondaire') ||
            checkSection('primaire') ||
            checkSection('huile');

        if (needsHealing) {
            setEtudeData(prev => {
                const fullBase = JSON.parse(JSON.stringify(initialThermique));
                if (!prev.donneesThermique) return { ...prev, donneesThermique: fullBase };

                const healSection = (sec) => {
                    const existing = prev.donneesThermique[sec] || [];
                    const baseRows = fullBase[sec];
                    return baseRows.map(baseRow => {
                        const found = existing.find(r => r.label === baseRow.label);
                        return found || baseRow;
                    });
                };

                return {
                    ...prev,
                    donneesThermique: {
                        ...fullBase,
                        ...prev.donneesThermique,
                        secondaire: healSection('secondaire'),
                        primaire: healSection('primaire'),
                        huile: healSection('huile')
                    }
                };
            });
            return;
        }

        const eBT = etudeData.donneesThermique.regimeTempSecondaire || '';
        const eMT = etudeData.donneesThermique.regimeTempPrimaire || '';
        const eH = etudeData.donneesThermique.regimeTempHuile || '';

        if (calculatedData.echauffementBT !== eBT || calculatedData.echauffementMT !== eMT || calculatedData.echauffementHuile !== eH) {
            setCalculatedData(prev => ({
                ...prev,
                echauffementBT: eBT,
                echauffementMT: eMT,
                echauffementHuile: eH
            }));
        }
    }, [etudeData.donneesThermique, calculatedData.echauffementBT, calculatedData.echauffementMT, calculatedData.echauffementHuile, setEtudeData, setCalculatedData]);

    // Decomposed Synchronization Hooks
    useBilanElectricalSync(props);
    useBilanBTMTDimensionSync(props);
    useBilanMagneticSync(props);
    useBilanLossSync(props);
    useBilanWeightSync(props);
    useBilanThermalSync(props);
    useBilanP0Sync(props);
    useBilanBobinageSync(props);
    useBilanUpnSync(props);
    useBilanGraduationSync(props);
    useBilanConsolidatedResults(props);
};

export default useBilanCalculations;
