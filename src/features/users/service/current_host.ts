import { Host } from "../models/host.model";
import { HostRepository } from "../repository/host.repository";
import { getAccessToken, getCurrentUser } from "@/src/lib/supabase/auth";

export async function getCurrentHost(request: Request): Promise<Host | null> {
  const token = getAccessToken(request);

  if (!token) {
    return null;
  }

  const user = await getCurrentUser(request);

  if (!user) {
    return null;
  }

  const hostRepository = new HostRepository(token);

  return hostRepository.getByUserId(user.id);
}
