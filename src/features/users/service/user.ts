import { User } from "../models/user.model";
import { UserRepository } from "../repository/user.repository";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getById(id: string): Promise<User | null> {
    return this.userRepository.getById(id);
  }

  async getAll(): Promise<User[]> {
    return this.userRepository.getAll();
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.userRepository.update(id, data);
  }
}
