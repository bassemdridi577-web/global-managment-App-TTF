import { useEffect } from 'react';
import { initialThermique } from '../../etude/EtudeConstants';

/**
 * Hook for self-healing thermal data and syncing regime temperatures
 */
export const useThermalDataHealing = (etudeData, setEtudeData, calculatedData, setCalculatedData) => {
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

        // Sync calculated echauffement values back to calculatedData for UI display
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
};
