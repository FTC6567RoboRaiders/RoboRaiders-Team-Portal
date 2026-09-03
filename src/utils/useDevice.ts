import { useState, useEffect, useCallback } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type DeviceMode = 'auto' | 'mobile' | 'tablet' | 'desktop';
export type OrientationType = 'portrait' | 'landscape';

export interface DeviceInfo {
  // Detected physical properties
  detectedType: DeviceType;
  effectiveType: DeviceType;
  deviceMode: DeviceMode;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  width: number;
  height: number;
  os: 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'other';
  isStandalonePWA: boolean;
  setDeviceMode: (mode: DeviceMode) => void;
}

const STORAGE_KEY = 'roboraiders_device_mode_override';

// Detect operating system from user agent
function detectOS(): 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'other' {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
  if (/iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream) return 'ios';
  if (/android/i.test(ua)) return 'android';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macos';
  if (/Windows NT/i.test(ua)) return 'windows';
  if (/Linux/i.test(ua)) return 'linux';
  return 'other';
}

// Detect physical device type
function detectDeviceType(width: number, isTouch: boolean): DeviceType {
  // Mobile: < 768px wide, or coarse pointer on small-to-medium screen
  if (width < 768) {
    return 'mobile';
  }
  // Tablet: between 768px and 1024px, or touch screen under 1180px
  if (width < 1024 || (isTouch && width < 1180)) {
    return 'tablet';
  }
  return 'desktop';
}

export function useDevice(): DeviceInfo {
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1200, height: 800 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  });

  const [deviceMode, setDeviceModeState] = useState<DeviceMode>(() => {
    if (typeof window === 'undefined') return 'auto';
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as DeviceMode | null;
      if (saved && ['auto', 'mobile', 'tablet', 'desktop'].includes(saved)) {
        return saved;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 'auto';
  });

  const setDeviceMode = useCallback((mode: DeviceMode) => {
    setDeviceModeState(mode);
    try {
      if (mode === 'auto') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, mode);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isTouch = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    (navigator && navigator.maxTouchPoints > 0) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  );

  const isStandalonePWA = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );

  const detectedType = detectDeviceType(dimensions.width, isTouch);
  const effectiveType: DeviceType = deviceMode === 'auto' ? detectedType : deviceMode;

  const isMobile = effectiveType === 'mobile';
  const isTablet = effectiveType === 'tablet';
  const isDesktop = effectiveType === 'desktop';

  const isPortrait = dimensions.height >= dimensions.width;
  const isLandscape = dimensions.width > dimensions.height;
  const os = detectOS();

  return {
    detectedType,
    effectiveType,
    deviceMode,
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    isPortrait,
    isLandscape,
    width: dimensions.width,
    height: dimensions.height,
    os,
    isStandalonePWA,
    setDeviceMode
  };
}
