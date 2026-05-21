import { processExpiredTrials } from '../modules/trial/trialService';

const INTERVAL_MS = 60 * 1000;

export function startTrialExpiryJob() {
  const tick = async () => {
    try {
      const n = await processExpiredTrials();
      if (n > 0) console.info(`[CRON] Expired ${n} trial(s)`);
    } catch (e) {
      console.error('[CRON] trial expiry failed', e);
    }
  };

  void tick();
  setInterval(tick, INTERVAL_MS);
}
