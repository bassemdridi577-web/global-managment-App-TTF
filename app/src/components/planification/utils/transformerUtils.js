/**
 * Utility functions for transformer data processing
 */

/**
 * Process a command and ensure it has groups
 */
export const processCommande = (cmd) => {
    if (!cmd) return null;

    let groups = [];
    if (cmd.formData && cmd.formData.groups) {
        groups = cmd.formData.groups;
    } else if (cmd.groups) {
        groups = cmd.groups;
    }

    return {
        ...cmd,
        groups,
        client: cmd.client || cmd.formData?.client || 'N/A',
        couplage: cmd.formData?.couplage,
        traverseHT: cmd.formData?.traverseHT,
        relaisSecurite: cmd.formData?.relaisSecurite,
        thermostat: cmd.formData?.thermostat,
        adAir: cmd.formData?.adAir,
        soupapeSecurite: cmd.formData?.soupapeSecurite,
        typeInstallation: cmd.formData?.typeInstallation,
        matiere: cmd.formData?.matiere
    };
};

/**
 * Format date string to display format
 */
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
};

/**
 * Extract U1 value from U1/U2 string
 */
export const getU1 = (u1u2) => {
    if (!u1u2) return '-';
    return u1u2.split('/')[0] || '-';
};

/**
 * Extract U2 value from U1/U2 string
 */
export const getU2 = (u1u2) => {
    if (!u1u2) return '-';
    return u1u2.split('/')[1] || '-';
};

/**
 * Format yes/no values
 */
export const formatYesNo = (value) => {
    if (value === 'oui') return 'Oui';
    if (value === 'non') return 'Non';
    return value || '-';
};

/**
 * Calculate the next transformer number based on existing production lines
 */
export const getNextTransformerNumber = (productionLines) => {
    if (!productionLines || productionLines.length === 0) return 1;

    const maxNum = Math.max(
        ...productionLines.map(item => {
            const num = parseInt(item.numeroTransformateur);
            return isNaN(num) ? 0 : num;
        })
    );
    return maxNum + 1;
};

/**
 * Filter transformers by command and group
 */
export const filterTransformersByCommand = (transformers, selectedGroupIndex, selectedCommandeForCreation) => {
    // If a specific group is selected, show only transformers from that command and group
    if (selectedGroupIndex !== null && selectedCommandeForCreation) {
        return transformers.filter(item => {
            // Show transformers that match the command (or have no commandeId set yet)
            const matchesCommand = item.commandeId === selectedCommandeForCreation || !item.commandeId;
            // And match the group index
            const matchesGroup = item.groupIndex === selectedGroupIndex;
            return matchesCommand && matchesGroup;
        });
    }

    // If only a command is selected (no group), show all transformers from that command
    if (selectedCommandeForCreation && selectedGroupIndex === null) {
        return transformers.filter(item => item.commandeId === selectedCommandeForCreation || !item.commandeId);
    }

    // Otherwise show all transformers
    return transformers;
};

/**
 * Get filtered transformer count
 */
export const getFilteredTransformerCount = (transformers, selectedGroupIndex, selectedCommandeForCreation) => {
    return filterTransformersByCommand(transformers, selectedGroupIndex, selectedCommandeForCreation).length;
};
