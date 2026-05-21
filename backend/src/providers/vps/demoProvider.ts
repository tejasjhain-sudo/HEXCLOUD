import crypto from 'crypto';
import type { CreateVpsInput, VpsProvider, VpsProviderResult } from './types';

export const demoProvider: VpsProvider = {
  name: 'demo',

  async createInstance(input: CreateVpsInput): Promise<VpsProviderResult> {
    const id = crypto.randomUUID();
    return {
      id,
      externalId: `demo-${id.slice(0, 8)}`,
      provider: 'demo',
      name: input.name,
      osType: input.osType,
      cpu: input.cpu,
      ramMb: input.ramMb,
      storageGb: input.storageGb,
      ipAddress: `10.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`,
    };
  },

  async startInstance() {},
  async stopInstance() {},
  async reinstallInstance() {},
  async deleteInstance() {},
};
