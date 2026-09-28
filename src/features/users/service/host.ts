import { Host } from "../models/host.model";
import { IHostRepository } from "../repository/IHost.repository";

export class HostService {
  constructor(private hostRepository: IHostRepository) {}

  async getByUserId(userId: string): Promise<Host | null> {
    return this.hostRepository.getByUserId(userId);
  }

  async create(userId: string): Promise<Host> {
    return this.hostRepository.create(userId);
  }
}
