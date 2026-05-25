
/**
 * Modular API Service Layer
 * 
 * This file serves as a legacy entry point that re-exports all modular services
 * to maintain backward compatibility. For new features, consider importing 
 * directly from 'src/services/api/'.
 */

export {
  default as default,
  setAuthHeaders,
  API_BASE
} from './services/api/apiClient';

export * from './services/api/authService';
export * from './services/api/stockService';
export * from './services/api/transformerService';
export * from './services/api/pvService';
export * from './services/api/adminService';
export * from './services/api/nonConformityService';
export * from './services/api/studyService';
