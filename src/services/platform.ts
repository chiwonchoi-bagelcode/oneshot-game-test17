// Release integration points. Each is a placeholder with the final interface,
// so a real implementation can be dropped in later:
//  - AuthService: platform sign-in (Google Play Games / Game Center). Today: local guest.
//  - CloudSave: remote save slots. Today: no-op, local save is the source of truth.
// Neither shows UI or blocks play; failures are silent and retried later.
import type { SaveData } from '../meta/save';

export interface PlayerIdentity { id: string; displayName: string; provider: 'guest' | 'google' | 'apple' }

export interface AuthService {
  current(): PlayerIdentity | null;
  signInSilently(): Promise<PlayerIdentity | null>; // called at boot, never shows UI
  signIn(): Promise<PlayerIdentity | null>; // called from a future settings button
  signOut(): Promise<void>;
}

export interface CloudSave {
  pull(id: PlayerIdentity): Promise<{ data: SaveData; savedAt: number } | null>;
  push(id: PlayerIdentity, data: SaveData): Promise<boolean>;
}

class GuestAuth implements AuthService {
  private me: PlayerIdentity | null = null;
  current() { return this.me; }
  async signInSilently() { this.me = this.me ?? { id: 'guest', displayName: 'Guest', provider: 'guest' }; return this.me; }
  async signIn() { return this.signInSilently(); }
  async signOut() { this.me = null; }
}

class LocalOnlyCloudSave implements CloudSave {
  async pull() { return null; }
  async push() { return true; }
}

export const auth: AuthService = new GuestAuth();
export const cloud: CloudSave = new LocalOnlyCloudSave();

// Conflict rule for the future cloud slot: keep whichever has more total coins
// earned (progress never goes backwards), ties broken by newest.
export function pickNewer(local: SaveData, remote: SaveData | null): SaveData {
  if (!remote) return local;
  if (remote.coinsEarned !== local.coinsEarned) return remote.coinsEarned > local.coinsEarned ? remote : local;
  return (remote.stats.lastSession || 0) > (local.stats.lastSession || 0) ? remote : local;
}
