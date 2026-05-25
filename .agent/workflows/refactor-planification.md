---
description: Refactor PlanificationPage into multiple files
---

# Refactoring Plan for PlanificationPage

## Current State
- **File**: PlanificationPage.jsx
- **Lines**: 1275 lines
- **Size**: ~70KB
- **Functions**: 31 functions/components

## Proposed Structure

### 1. Core Files

#### `PlanificationPage.jsx` (Main Container)
- Main component orchestration
- State management
- Tab navigation
- Data fetching (useEffect hooks)
- Render main layout

#### `hooks/usePlanification.js`
- Custom hook for planification logic
- State management
- API calls
- Data processing

#### `hooks/useTransformerCreation.js`
- Custom hook for transformer creation logic
- handleAddRow, handleBulkAdd, handleAddAllGroups
- handleAddAllTransformersFromAllCommands
- handleSaveAllTransformers

### 2. Component Files

#### `components/AddTransformerSection.jsx`
- Section for adding new transformers
- Command selection
- Group selection table
- Bulk add controls
- Transformer list table

#### `components/TransformerListTable.jsx`
- Table displaying transformers to add
- Row editing
- Bulk delete functionality
- Filtering logic

#### `components/StageSelector.jsx`
- Stage selection UI
- Multi-select checkboxes
- Planifier button

#### `components/PlanificationTable.jsx`
- Main planification table
- Transformer rows
- Inline editing
- Action buttons

#### `components/PlanningView.jsx`
- Planning view with stage dates
- Date inputs for each stage
- Save planning functionality

### 3. Utility Files

#### `utils/transformerUtils.js`
- processCommande
- formatDate, getU1, getU2
- formatYesNo
- Data transformation helpers

#### `utils/planificationHelpers.js`
- Filtering logic
- Calculation helpers
- Validation functions

### 4. Constants

#### `constants/planificationConstants.js`
- Production stages
- Default values
- Configuration

## Implementation Steps

1. Create directory structure
2. Extract utility functions
3. Create custom hooks
4. Split into components
5. Update imports in main file
6. Test functionality
7. Clean up unused code

## Benefits

- **Maintainability**: Easier to find and modify specific functionality
- **Reusability**: Components can be reused in other parts of the app
- **Testing**: Smaller units are easier to test
- **Performance**: Potential for better code splitting
- **Collaboration**: Multiple developers can work on different files
- **Readability**: Each file has a clear, focused purpose
