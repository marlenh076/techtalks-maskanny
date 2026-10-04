import { IUpdateRepository } from "@/src/shared/repositories/update.repository";
import { User } from "../models/user.model";
import { IReadRepository } from "@/src/shared/repositories/read.repository";

export interface IUserRepository
  extends IReadRepository<User>, IUpdateRepository<User> {}
