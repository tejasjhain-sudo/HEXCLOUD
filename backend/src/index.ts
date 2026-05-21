import http from 'http';
import app from './app';
import { socketService } from './services/socketService';
import { logger } from './utils/logger';
import { ensureDemoComputeNode } from './services/trialCredits';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

socketService.init(server);

void ensureDemoComputeNode().then((id) => {
  if (id) logger.info('Demo compute node ready for VPS testing', 'SYSTEM');
});

server.listen(PORT, () => {
  logger.info(`HEXCloud server successfully started on port ${PORT}`, 'SYSTEM');
});
