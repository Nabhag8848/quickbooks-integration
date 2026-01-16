/**
 * Calculate expiration date from seconds
 * @param secondsInFuture - Number of seconds from now
 * @returns Date object representing the expiration time
 */

export function calculateExpirationDate(secondsInFuture: number): Date {
  return new Date(Date.now() + secondsInFuture * 1000);
}
