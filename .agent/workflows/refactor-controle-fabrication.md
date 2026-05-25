# Refactoring Plan: ControleEnCoursDeFabricationPage.jsx

## Current State
- **File Size**: 2609 lines, ~170KB
- **Problem**: File is too large and difficult to maintain

## Proposed Split (3 Files)

### File 1: `ControleEnCoursDeFabricationPage.jsx` (Main Component)
**Purpose**: Main page component with state management and tab navigation
**Contents**:
- All imports
- All state declarations (lines 8-270)
- Helper functions (createRowState, migrateBobinageData, formatDate, getCellValue)
- fetchData function
- Main render function with tab navigation
- Imports for the two new components

**Estimated Size**: ~800 lines

### File 2: `ProductionStepsSection.jsx` (New Component)
**Purpose**: Handle all 9 production steps rendering and logic
**Contents**:
- Production steps rendering (CALAGE, FERMETURE, CABLAGE BT, CABLAGE MT, ETUVAGE, ECUVAGE, REMPLISSAGE D'HUILE, ÉTANCHEITÉ, PEINTURE)
- All production step save handlers (handleSaveCalage, handleSaveFermeture, etc.)
- Production steps state management (passed as props)

**Estimated Size**: ~600 lines

### File 3: `SaveHandlers.js` (Utility Module)
**Purpose**: Centralize all save handler functions
**Contents**:
- handleSaveBobinage
- handleSaveCircuitMagnetique
- handleSaveMontage
- handleSaveEssai
- handleSaveControleFinal
- handleSaveTestsEssais
- handleSaveOndules
- handleSaveCuvePied
- handleSaveUPN
- handleSaveDecoupage
- handleSaveCouvercleContainer
- handleSaveCuveContainer
- All 9 production step save handlers

**Estimated Size**: ~400 lines

## Benefits
1. **Maintainability**: Easier to find and edit specific functionality
2. **Readability**: Each file has a clear, single responsibility
3. **Performance**: Potentially better code splitting
4. **Collaboration**: Multiple developers can work on different files

## Implementation Steps
1. Create `ProductionStepsSection.jsx`
2. Create `SaveHandlers.js`
3. Refactor main `ControleEnCoursDeFabricationPage.jsx`
4. Test all functionality

## Notes
- All files will remain in the same directory
- CSS imports will stay in the main component
- API calls will be centralized in SaveHandlers
- Props will be passed down to child components
