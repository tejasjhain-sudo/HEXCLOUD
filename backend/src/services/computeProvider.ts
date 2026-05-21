export interface VmConfig {
  name: string;
  cpu: number;
  ram: number;
  storage: number;
  osType: string;
}

export interface VmResult {
  id: string;
  name: string;
  status: 'RUNNING' | 'STOPPED' | 'PROVISIONING' | 'ERROR';
  ipAddress: string;
  cpu: number;
  ram: number;
  storage: number;
  osType: string;
}

export interface ComputeProvider {
  createVM(config: VmConfig): Promise<VmResult>;
  startVM(id: string): Promise<boolean>;
  stopVM(id: string): Promise<boolean>;
  deleteVM(id: string): Promise<boolean>;
}

// In-memory simulation of hypervisor state
class MockComputeProvider implements ComputeProvider {
  private vms = new Map<string, VmResult>();

  async createVM(config: VmConfig): Promise<VmResult> {
    const id = `vm-${Math.random().toString(36).substr(2, 9)}`;
    const randomIp = `185.220.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    const vm: VmResult = {
      id,
      name: config.name,
      status: 'PROVISIONING',
      ipAddress: 'Pending...',
      cpu: config.cpu,
      ram: config.ram,
      storage: config.storage,
      osType: config.osType,
    };

    this.vms.set(id, vm);

    // Simulate standard cloud hypervisor provisioning delay (e.g. 5 seconds to get IP and boot)
    setTimeout(() => {
      const activeVm = this.vms.get(id);
      if (activeVm) {
        activeVm.status = 'RUNNING';
        activeVm.ipAddress = randomIp;
        this.vms.set(id, activeVm);
      }
    }, 5000);

    return vm;
  }

  async startVM(id: string): Promise<boolean> {
    // Simulate starting VM
    const vm = this.vms.get(id);
    if (!vm) return false;
    vm.status = 'RUNNING';
    this.vms.set(id, vm);
    return true;
  }

  async stopVM(id: string): Promise<boolean> {
    // Simulate stopping VM
    const vm = this.vms.get(id);
    if (!vm) return false;
    vm.status = 'STOPPED';
    this.vms.set(id, vm);
    return true;
  }

  async deleteVM(id: string): Promise<boolean> {
    // Simulate deleting VM
    return this.vms.delete(id);
  }
}

export const computeProvider: ComputeProvider = new MockComputeProvider();
