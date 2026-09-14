export interface AccentColorConfig {
  id: string;
  name: string;
  hex: string;
  hoverHex: string;
  lightHex: string;
  darkHex: string;
  bgClass: string;
}

export const ACCENT_COLOR_PRESETS: AccentColorConfig[] = [
  { id: 'red', name: 'FTC Crimson', hex: '#c00000', hoverHex: '#a30000', lightHex: '#fef2f2', darkHex: '#7f0000', bgClass: 'bg-[#c00000]' },
  { id: 'blue', name: 'Sapphire Blue', hex: '#2563eb', hoverHex: '#1d4ed8', lightHex: '#eff6ff', darkHex: '#1e40af', bgClass: 'bg-[#2563eb]' },
  { id: 'emerald', name: 'Emerald Green', hex: '#059669', hoverHex: '#047857', lightHex: '#ecfdf5', darkHex: '#064e3b', bgClass: 'bg-[#059669]' },
  { id: 'purple', name: 'Imperial Purple', hex: '#7c3aed', hoverHex: '#6d28d9', lightHex: '#f5f3ff', darkHex: '#4c1d95', bgClass: 'bg-[#7c3aed]' },
  { id: 'orange', name: 'Cobalt Orange', hex: '#ea580c', hoverHex: '#c2410c', lightHex: '#fff7ed', darkHex: '#7c2d12', bgClass: 'bg-[#ea580c]' },
  { id: 'teal', name: 'Neon Teal', hex: '#0d9488', hoverHex: '#0f766e', lightHex: '#f0fdfa', darkHex: '#134e4a', bgClass: 'bg-[#0d9488]' },
  { id: 'rose', name: 'Rose Pink', hex: '#e11d48', hoverHex: '#be123c', lightHex: '#fff1f2', darkHex: '#881337', bgClass: 'bg-[#e11d48]' },
  { id: 'amber', name: 'Amber Gold', hex: '#d97706', hoverHex: '#b45309', lightHex: '#fffbeb', darkHex: '#78350f', bgClass: 'bg-[#d97706]' },
];

export function applyAccentColor(accentId: string) {
  const preset = ACCENT_COLOR_PRESETS.find(p => p.id === accentId) || ACCENT_COLOR_PRESETS[0];
  const root = document.documentElement;
  root.style.setProperty('--color-brand', preset.hex);
  root.style.setProperty('--color-brand-hover', preset.hoverHex);
  root.style.setProperty('--color-brand-light', preset.lightHex);
  root.style.setProperty('--color-brand-dark', preset.darkHex);
}
