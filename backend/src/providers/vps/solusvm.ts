import type { CreateVpsInput, VpsProvider, VpsProviderResult } from './types';

/** SolusVM 2.x API placeholder */
export const solusvmProvider: VpsProvider = {
  name: 'solusvm',

  async createInstance(_input: CreateVpsInput): Promise<VpsProviderResult> {
    throw new Error('SolusVM provider stub — future integration');
  },
  async startInstance() {
    throw new Error('SolusVM start not implemented');
  },
  async stopInstance() {
    throw new Error('SolusVM stop not implemented');
  },
  async reinstallInstance() {
    throw new Error('SolusVM reinstall not implemented');
  },
  async deleteInstance() {
    throw new Error('SolusVM delete not implemented');
  },
};
