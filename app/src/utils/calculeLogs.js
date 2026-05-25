
/**
 * Utility to log all transformer calculations to the console.
 */

export const logCalculation = (name, inputs, result, formula = '') => {
    console.group(`%c CALCULATION: ${name} `, 'background: #2d3748; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 4px;');

    if (formula) {
        console.log(`%cFormula:%c ${formula}`, 'color: #dd6b20; font-weight: bold;', 'font-style: italic; color: #718096;');
    }

    console.group('%c Inputs ', 'color: #3182ce; font-weight: bold;');
    Object.entries(inputs).forEach(([key, value]) => {
        console.log(`%c${key}:%c ${value}`, 'color: #718096;', 'color: #2d3748; font-weight: 500;');
    });
    console.groupEnd();

    console.log(`%c Result =>%c ${result} `, 'color: #38a169; font-weight: bold;', 'background: #f0fff4; color: #22543d; font-weight: bold; padding: 2px 4px;');

    console.groupEnd();
};

export const logDimensions = (section, data) => {
    console.group(`%c DIMENSIONS: ${section.toUpperCase()} `, 'background: #4a5568; color: #fff; font-weight: bold; padding: 2px 4px;');
    console.table(data);
    console.groupEnd();
};
