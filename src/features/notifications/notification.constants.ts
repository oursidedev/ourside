import type { NotificationChannel,NotificationType } from "./notification.types";
export const NOTIFICATION_CHANNELS:NotificationChannel[]=["in_app","email","push"];
export const IMPORTANT_EMAIL_TYPES:NotificationType[]=["welcome","partner_invited","partner_joined","memory_added","letter_unlocked","milestone_reminder","anniversary_reminder","password_changed","payment_failed"];
export const NOTIFICATION_CATEGORIES={partner_activity:["partner_invited","invitation_accepted_by_partner","invitation_accepted_by_me","partner_joined"],memory_updates:["memory_added","memory_commented","memory_reacted","media_uploaded"],letters_vault:["letter_created","letter_unlocked"],milestones:["milestone_created","milestone_reminder","anniversary_reminder"],daily_questions:["daily_question_available","daily_question_answered_by_partner","daily_question_both_answered"],product_billing:["subscription_started","subscription_cancelled","payment_failed"]} as const;

