/** Scheduler entry points. Invoke their matching secured SQL functions from a cron worker. */
export const NOTIFICATION_JOBS=["process_due_letter_unlock_notifications","process_upcoming_milestone_reminders","process_daily_question_notifications"] as const;
// Recommended runners: Supabase Edge Function cron, Vercel Cron, or a dedicated worker.
