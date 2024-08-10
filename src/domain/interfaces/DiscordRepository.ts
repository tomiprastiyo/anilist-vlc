export interface DiscordRepository {
  setActivity(activity: any): Promise<void>;
  clearActivity(): Promise<void>;
}
