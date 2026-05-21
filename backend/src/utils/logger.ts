import { db } from '../services/supabaseData';
import { socketService } from '../services/socketService';

async function writeLog(level: string, message: string, service: string) {
  await db.insertLog(level, message, service);
  socketService.broadcastSystemLog({
    level,
    message,
    service,
    createdAt: new Date().toISOString(),
  });
}

export const logger = {
  info: async (message: string, service: string) => {
    console.log(`[INFO] [${service}] ${message}`);
    try {
      await writeLog('INFO', message, service);
    } catch (e) {
      console.error('Failed to write log to DB:', e);
    }
  },
  warn: async (message: string, service: string) => {
    console.warn(`[WARN] [${service}] ${message}`);
    try {
      await writeLog('WARN', message, service);
    } catch (e) {
      console.error('Failed to write log to DB:', e);
    }
  },
  error: async (message: string, service: string, error?: unknown) => {
    const errMsg =
      error && typeof error === 'object' && error !== null && 'message' in error
        ? `${message} | Error: ${(error as { message: string }).message}`
        : message;
    console.error(`[ERROR] [${service}] ${errMsg}`);
    try {
      await writeLog('ERROR', errMsg, service);
    } catch (e) {
      console.error('Failed to write log to DB:', e);
    }
  },
};
