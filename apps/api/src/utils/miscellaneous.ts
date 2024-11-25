export function getTimestampDaysFromNow(days: number) {
  const currentDate = new Date();
  const futureDate = new Date(
    currentDate.getTime() + days * 24 * 60 * 60 * 1000,
  );

  // returned in seconds rather than milliseconds (for DynamoDB TTL)
  return Math.round(futureDate.getTime() / 1000);
}
