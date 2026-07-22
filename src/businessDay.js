/**
 * Business day helpers for the till.
 *
 * Mirrors chicken-coop-api/src/utils/businessDay.util.ts: the restaurant day
 * starts at 06:00, so anything before that still belongs to the day before.
 *
 * A business day is a plain 'YYYY-MM-DD' string. The server has the final say —
 * these helpers only pick a sensible default and bound the date picker, so the
 * screen never shows a day the API would refuse.
 */

export const BUSINESS_TIMEZONE = 'Africa/Casablanca'
export const BUSINESS_DAY_START_HOUR = 6

// Explicit timezone, so a till whose clock is set wrong still agrees with the API
const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIMEZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
})

const pad = (n) => String(n).padStart(2, '0')

/** Business day of an instant, as 'YYYY-MM-DD'. */
export const businessDay = (at = new Date()) => {
  const parts = partsFormatter.formatToParts(at)
  const get = (type) => Number(parts.find((p) => p.type === type)?.value)
  const shift = get('hour') < BUSINESS_DAY_START_HOUR ? -1 : 0
  const d = new Date(Date.UTC(get('year'), get('month') - 1, get('day') + shift))
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

/** Shift a 'YYYY-MM-DD' key by whole days. */
export const shiftBusinessDay = (day, days) => {
  const [y, m, d] = day.split('-').map(Number)
  const shifted = new Date(Date.UTC(y, m - 1, d + days))
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`
}

/**
 * 'YYYY-MM-DD' to a Date for the picker. Midday keeps it clear of the midnight
 * edge, where a timezone shift could roll it onto the neighbouring day.
 */
export const dayToDate = (day) => {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

/**
 * A picked Date back to 'YYYY-MM-DD', read as the calendar day the user saw
 * rather than converted as an instant.
 */
export const dateToDay = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Human label for a business day key. */
export const formatDay = (day) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' }).format(dayToDate(day))
