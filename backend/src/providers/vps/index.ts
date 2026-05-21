import type { VpsProvider } from './types';
import { demoProvider } from './demoProvider';
import { proxmoxProvider } from './proxmox';
import { virtualizorProvider } from './virtualizor';
import { solusvmProvider } from './solusvm';

const providers: Record<string, VpsProvider> = {
  demo: demoProvider,
  proxmox: proxmoxProvider,
  virtualizor: virtualizorProvider,
  solusvm: solusvmProvider,
};

export function getVpsProvider(): VpsProvider {
  const key = (process.env.VPS_PROVIDER || 'demo').toLowerCase();
  return providers[key] ?? demoProvider;
}

export { demoProvider, proxmoxProvider, virtualizorProvider, solusvmProvider };
