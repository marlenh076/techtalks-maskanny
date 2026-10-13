import { User, UserProfileUpdate } from "../models/user.model";
import { IReadRepository } from "@/src/shared/repositories/read.repository";

export interface IUserRepository extends IReadRepository<User> {
  update(id: string, data: UserProfileUpdate): Promise<User>;
}
