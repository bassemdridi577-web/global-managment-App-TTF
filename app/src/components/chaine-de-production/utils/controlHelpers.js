/**
 * Utility functions for control components
 */

/**
 * Safely extract value from cell data (handles both string and object formats)
 * @param {string|object} cellData - The cell data which might be a string or object
 * @returns {string} The extracted value
 */
export const getCellValue = (cellData) => {
    if (typeof cellData === 'object' && cellData !== null) {
        return cellData.value || '';
    }
    return cellData || '';
};

/**
 * Format date string to French locale
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date or '-'
 */
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
};

/**
 * Create initial state for a bobinage row with only values
 * @returns {object} Initial row state
 */
export const createRowState = () => ({
    a: '',
    b: '',
    c: '',
    prevue: '',
    cnc: ''
});

/**
 * Handles keyboard navigation within a table
 * @param {KeyboardEvent} e - The keyboard event
 */
export const handleTableKeyDown = (e) => {
    const { key, target } = e;
    const isNavigationKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(key);

    if (!isNavigationKey) return;

    // Only navigate if it's a text input or select
    const isInput = target.tagName === 'INPUT' || target.tagName === 'SELECT';
    if (!isInput) return;

    // Special handling for Left/Right arrows in text inputs: only move if at the start/end of the text
    if (target.tagName === 'INPUT' && target.type === 'text') {
        if (key === 'ArrowLeft' && target.selectionStart !== 0) return;
        if (key === 'ArrowRight' && target.selectionStart !== target.value.length) return;
    }

    const cell = target.closest('td');
    if (!cell) return;

    const row = cell.closest('tr');
    if (!row) return;

    const table = row.closest('table');
    if (!table) return;

    const colIndex = Array.from(row.cells).indexOf(cell);
    const rowIndex = Array.from(table.rows).indexOf(row);

    let nextCell;


    if (key === 'ArrowUp') {
        // Find previous row with a cell at the same index
        for (let i = rowIndex - 1; i >= 0; i--) {
            if (table.rows[i].cells[colIndex]) {
                nextCell = table.rows[i].cells[colIndex];
                break;
            }
        }
    } else if (key === 'ArrowDown' || key === 'Enter') {
        // Find next row with a cell at the same index
        for (let i = rowIndex + 1; i < table.rows.length; i++) {
            if (table.rows[i].cells[colIndex]) {
                nextCell = table.rows[i].cells[colIndex];
                break;
            }
        }
    } else if (key === 'ArrowLeft') {
        nextCell = cell.previousElementSibling;
        // If the previous sibling doesn't have an input, look further left
        while (nextCell && !nextCell.querySelector('input:not([type="hidden"]), select')) {
            nextCell = nextCell.previousElementSibling;
        }
    } else if (key === 'ArrowRight') {
        nextCell = cell.nextElementSibling;
        // If the next sibling doesn't have an input, look further right
        while (nextCell && !nextCell.querySelector('input:not([type="hidden"]), select')) {
            nextCell = nextCell.nextElementSibling;
        }
    }

    if (nextCell) {
        const nextInput = nextCell.querySelector('input:not([type="hidden"]), select');
        if (nextInput) {
            e.preventDefault();
            nextInput.focus();
            if (nextInput.tagName === 'INPUT' && nextInput.select) {
                nextInput.select();
            }
        }
    }
};
