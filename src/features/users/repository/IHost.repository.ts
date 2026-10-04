import { Host } from "../models/host.model";

export interface IHostRepository {
  getByUserId(userId: string): Promise<Host | null>;
  create(userId: string): Promise<Host>;
}
