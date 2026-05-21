export interface CreateVpsInput {
  userId: string;
  trialId?: string;
  name: string;
  osType: string;
  cpu: number;
  ramMb: number;
  storageGb: number;
  region?: string;
}

export interface VpsProviderResult {
  id: string;
  externalId?: string;
  provider: string;
  name: string;
  osType: string;
  cpu: number;
  ramMb: number;
  storageGb: number;
  ipAddress?: string;
}

export interface VpsProvider {
  name: string;
  createInstance(input: CreateVpsInput): Promise<VpsProviderResult>;
  startInstance(id: string, externalId?: string): Promise<void>;
  stopInstance(id: string, externalId?: string): Promise<void>;
  reinstallInstance(id: string, externalId?: string): Promise<void>;
  deleteInstance(id: string, externalId?: string): Promise<void>;
}
