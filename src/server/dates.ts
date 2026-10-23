const TIMEZONE = process.env.APP_TIMEZONE ?? 'Asia/Kolkata'

/** Today's calendar date (YYYY-MM-DD) in the app's timezone, used for drive dates. */
export function todayString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}
