import type { CreateVpsInput, VpsProvider, VpsProviderResult } from './types';

/** Virtualizor Admin API — VIRTUALIZOR_HOST, VIRTUALIZOR_KEY */
export const virtualizorProvider: VpsProvider = {
  name: 'virtualizor',

  async createInstance(_input: CreateVpsInput): Promise<VpsProviderResult> {
    throw new Error('Virtualizor provider stub — implement act=addvs');
  },
  async startInstance() {
    throw new Error('Virtualizor start not implemented');
  },
  async stopInstance() {
    throw new Error('Virtualizor stop not implemented');
  },
  async reinstallInstance() {
    throw new Error('Virtualizor reinstall not implemented');
  },
  async deleteInstance() {
    throw new Error('Virtualizor delete not implemented');
  },
};
