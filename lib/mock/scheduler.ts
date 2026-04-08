export async function scheduleNotification(
  certificationId: number,
  daysBeforeExpiry: number
) {
  console.log('⏰ [MOCK Scheduler] Scheduled for cert:', certificationId)
  console.log('Days before expiry:', daysBeforeExpiry)

  return {
    success: true,
    scheduledFor: new Date(Date.now() + daysBeforeExpiry * 24 * 60 * 60 * 1000),
    jobId: `job_${Date.now()}`,
  }
}
