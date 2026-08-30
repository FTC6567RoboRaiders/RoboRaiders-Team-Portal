/**
 * Timezone-safe Date Formatting and Helpers for FTC RoboRaiders
 * Prevents UTC midnight off-by-one day bugs when parsing YYYY-MM-DD strings.
 */

/**
 * Returns today's date formatted as YYYY-MM-DD in the user's local timezone.
 */
export function getTodayLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Safely parses a YYYY-MM-DD (or ISO) date string into local date parts
 * to avoid UTC midnight timezone rollback in Western/US timezones.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  // Check if it's YYYY-MM-DD format
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    return new Date(year, month, day);
  }

  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Formats an event date string safely into a localized date string.
 * Example output: "Sun, Aug 30, 2026"
 */
export function formatEventDate(
  dateStr: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };
  return d.toLocaleDateString(undefined, options || defaultOptions);
}

/**
 * Formats an event date string with full weekday and month.
 * Example output: "Sunday, August 30, 2026"
 */
export function formatEventDateLong(dateStr: string): string {
  return formatEventDate(dateStr, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Formats an event date string into a concise format.
 * Example output: "Aug 30, 2026"
 */
export function formatEventDateShort(dateStr: string): string {
  return formatEventDate(dateStr, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
