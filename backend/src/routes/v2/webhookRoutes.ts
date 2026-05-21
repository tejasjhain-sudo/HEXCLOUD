import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

const router = Router();

router.post('/:provider', async (req: Request, res: Response) => {
  const provider = req.params.provider;
  await prisma.webhookEvent.create({
    data: {
      provider,
      eventType: (req.headers['x-event-type'] as string) || 'unknown',
      payload: req.body,
    },
  });
  res.json({ received: true });
});

export default router;
