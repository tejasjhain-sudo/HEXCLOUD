import type { CreateVpsInput, VpsProvider, VpsProviderResult } from './types';

/**
 * Proxmox VE API — configure PROXMOX_HOST, PROXMOX_TOKEN in .env
 * @see https://pve.proxmox.com/pve-docs/api-viewer/
 */
export const proxmoxProvider: VpsProvider = {
  name: 'proxmox',

  async createInstance(input: CreateVpsInput): Promise<VpsProviderResult> {
    if (!process.env.PROXMOX_HOST) {
      throw new Error('PROXMOX_HOST not configured');
    }
    // TODO: POST /api2/json/nodes/{node}/qemu
    throw new Error('Proxmox provider not fully wired — set credentials and implement API calls');
  },

  async startInstance() {
    throw new Error('Proxmox start not implemented');
  },
  async stopInstance() {
    throw new Error('Proxmox stop not implemented');
  },
  async reinstallInstance() {
    throw new Error('Proxmox reinstall not implemented');
  },
  async deleteInstance() {
    throw new Error('Proxmox delete not implemented');
  },
};
