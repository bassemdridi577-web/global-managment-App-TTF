import { useEffect } from 'react';
import { parseNumber } from '../../etude/etudeCalculations';

export const useBilanUpnSync = ({ etudeData, calculatedData, setEtudeData }) => {
    useEffect(() => {
        if (!etudeData.donneesUpn) return;

        setEtudeData(prev => {
            const upn = { ...prev.donneesUpn };
            let changed = false;

            const b1 = parseNumber(prev.donneesCM4C?.[0]?.b);
            const cCourtMT = parseNumber(calculatedData?.coteCourtAxeExterneMT) || parseNumber(prev.donneesBobinage?.primaire?.coteCourtAxeExterne);
            const c_val = parseNumber(prev.parametresCM?.c);
            const a_val = parseNumber(prev.parametresCM?.A);
            const z_val = parseNumber(prev.parametresCM?.Z);
            const b_val = parseNumber(prev.parametresCM?.B);

            const updates = {};
            const checkUpdate = (field, val) => {
                const valStr = val.toString();
                if (upn[field] !== valStr) {
                    updates[field] = valStr;
                    changed = true;
                }
            };

            if (cCourtMT > 0) checkUpdate('diametreExtMt', (cCourtMT + 9).toFixed(0));
            if (c_val > 0) checkUpdate('larg4Colone', c_val);
            if (a_val > 0) checkUpdate('entraxe', a_val);
            if (z_val > 0) checkUpdate('longCm', z_val);

            if (b1 > 0) {
                checkUpdate('largCulasse', b1);
                checkUpdate('largUpn', b1 - 20);
            }
            if (b_val > 0) checkUpdate('l3', b_val);

            if (changed) {
                return { ...prev, donneesUpn: { ...upn, ...updates } };
            }
            return prev;
        });
    }, [etudeData.donneesCM4C, etudeData.parametresCM, etudeData.donneesBobinage, calculatedData, setEtudeData]);
};
