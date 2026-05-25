/**
 * Migration function to convert old bobinage data format to new format
 * Old format: { a: { value: '', date: '' }, b: { value: '', date: '' }, ... }
 * New format: { columns: { a: { date: '', operateur: '' }, ... }, rows: { a: '', b: '', ... } }
 */
export const migrateBobinageData = (oldData) => {
    const migrateSection = (section) => {
        // Check if this section has the old format (with value/date objects)
        const firstRow = section.dimensionFil || {};
        const hasOldFormat = firstRow.a && typeof firstRow.a === 'object' && 'value' in firstRow.a;

        if (!hasOldFormat) {
            // Already in new format or empty, ensure columns exist
            return {
                columns: section.columns || {
                    a: { date: '', operateur: '' },
                    b: { date: '', operateur: '' },
                    c: { date: '', operateur: '' }
                },
                ...section
            };
        }

        // Migrate from old format to new format
        const columns = {
            a: { date: '', operateur: '' },
            b: { date: '', operateur: '' },
            c: { date: '', operateur: '' }
        };

        // Extract dates from first row (they were duplicated across all rows)
        if (firstRow.a?.date) columns.a.date = firstRow.a.date;
        if (firstRow.b?.date) columns.b.date = firstRow.b.date;
        if (firstRow.c?.date) columns.c.date = firstRow.c.date;

        // Convert row data
        const rowKeys = [
            'dimensionFil', 'nombreFiligrane', 'diametreInterBobine',
            'diametreExtBobine', 'epaisseurCouche', 'nombreSpireCouche',
            'nombreSpireTotales', 'hauteurBobinage', 'hauteurBobine'
        ];

        const newSection = { columns };

        rowKeys.forEach(rowKey => {
            if (section[rowKey]) {
                newSection[rowKey] = {
                    a: section[rowKey].a?.value || section[rowKey].a || '',
                    b: section[rowKey].b?.value || section[rowKey].b || '',
                    c: section[rowKey].c?.value || section[rowKey].c || '',
                    prevue: section[rowKey].prevue || '',
                    cnc: section[rowKey].cnc || ''
                };
            }
        });

        // Copy other fields
        newSection.controleur = section.controleur || '';
        newSection.verificateur = section.verificateur || '';

        return newSection;
    };

    return {
        bt: migrateSection(oldData.bt || {}),
        mt: migrateSection(oldData.mt || {})
    };
};
