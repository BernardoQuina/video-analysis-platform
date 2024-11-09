export function getTimestampDaysFromNow(days: number) {
  const currentDate = new Date();
  const futureDate = new Date(
    currentDate.getTime() + days * 24 * 60 * 60 * 1000,
  );
  return futureDate.getTime();
}
