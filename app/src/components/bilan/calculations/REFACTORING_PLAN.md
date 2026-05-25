# Refactoring Plan: useBilanCalculations.js

## Overview
The file `useBilanCalculations.js` has been split into multiple smaller, focused modules to improve maintainability and reduce file size (from 1100+ lines to manageable chunks).

## New File Structure

### 1. **thermalDataHealing.js** (~70 lines)
**Purpose:** Self-healing logic for thermal data initialization
**Exports:** `useThermalDataHealing`
**Responsibilities:**
- Check if thermal sections (secondaire, primaire, huile) are properly initialized
- Heal missing labels by restoring from initialThermique
- Sync regime temperature values to calculatedData

### 2. **electricalCalculations.js** (~100 lines)
**Purpose:** Basic electrical calculations
**Exports:** `useElectricalCalculations`
**Responsibilities:**
- Calculate primary and secondary currents
- Calculate spires (MT/BT)
- Calculate section active
- Calculate resistances (VN)
- Calculate losses (connection, resistance, short-circuit)
- Calculate ampere per mm²
- Sync WATT DE PERTE to thermal data

### 3. **thermalCalculations.js** (~240 lines)
**Purpose:** Thermal surface calculations and regime temperatures
**Exports:** `useThermalCalculations`
**Responsibilities:**
- Calculate all convective surfaces (secondaire, primaire)
- Calculate surface totale, nette, couverte
- Calculate densité watt
- Calculate wave center
- Calculate oil surfaces (ondes latérales, cuve)
- Calculate regime temperatures for all sections

### 4. **dimensionCalculations.js** (To be created)
**Purpose:** Dimensional calculations (bobine, CM, axes)
**Exports:** `useDimensionCalculations`
**Responsibilities:**
- Bobine ovale moyenne
- Epaisseur radiale
- Diamètres (interne/externe)
- Axes (court/long)
- Hauteur active/bobine
- Canal calculations

### 5. **magneticCircuitCalculations.js** (To be created)
**Purpose:** Magnetic circuit calculations
**Exports:** `useMagneticCircuitCalculations`
**Responsibilities:**
- CM4C graduation table sync
- Poids CM
- Epaisseur ACM
- Induction (théorique/pratique)
- P0 and I0 calculations
- Section calculations

### 6. **bobinageSync.js** (To be created)
**Purpose:** Bobinage tab data synchronization
**Exports:** `useBobinageSync`
**Responsibilities:**
- Sync BT dimensions to donneesBobinage.secondaire
- Sync MT dimensions to donneesBobinage.primaire
- Sync weights (conducteur, papier)
- Sync counts (couche, canal, spire)

### 7. **useBilanCalculations.js** (Main orchestrator, ~150 lines)
**Purpose:** Main hook that orchestrates all sub-calculations
**Exports:** `useBilanCalculations`
**Responsibilities:**
- Import and call all sub-hooks in correct order
- Manage dependencies between calculations
- Provide single entry point for BilanPage

## Benefits
1. **Maintainability:** Each file has a single, clear responsibility
2. **Readability:** Easier to understand and navigate
3. **Testability:** Each module can be tested independently
4. **Performance:** No change (same useEffect structure)
5. **Reusability:** Modules can be used independently if needed

## Migration Status
✅ Created: thermalDataHealing.js
✅ Created: electricalCalculations.js
✅ Created: thermalCalculations.js
⏳ Pending: dimensionCalculations.js
⏳ Pending: magneticCircuitCalculations.js
⏳ Pending: bobinageSync.js
⏳ Pending: Update main useBilanCalculations.js to use new modules

## Next Steps
1. Create remaining calculation modules
2. Update main useBilanCalculations.js to import and use all modules
3. Test to ensure no regressions
4. Remove old code from main file
