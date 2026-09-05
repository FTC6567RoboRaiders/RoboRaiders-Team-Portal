import { GrantApplication } from '../types';

export const PRESET_GRANT_TEMPLATES: Omit<GrantApplication, 'id' | 'createdAt' | 'createdBy' | 'createdByEmail' | 'updatedAt' | 'updatedBy'>[] = [];

export const DEFAULT_GRANT_APPLICATIONS: GrantApplication[] = [];
