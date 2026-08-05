/**
 * Les jobs BullMQ `domain-event` (file `outbox`) sont traités par
 * `apps/api/src/platform/jobs/domain-event.processor.ts`, démarré via
 * `apps/api/src/worker-main.ts`.
 *
 * Handlers invoqués :
 * - RankingEventHandler
 * - NotificationsEventHandler
 * - ProjectPublishedAspirationService
 * - MediaUploadedProcessor (optionnel) ou log pour media.media.uploaded.v1
 */
export const DOMAIN_EVENT_JOB_NAME = 'domain-event';
export const OUTBOX_QUEUE_NAME = 'outbox';
