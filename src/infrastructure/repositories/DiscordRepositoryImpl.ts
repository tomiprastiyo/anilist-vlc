import { DiscordRepository } from "../../domain/interfaces/DiscordRepository";

export class DiscordRepositoryImpl implements DiscordRepository {
  async setActivity(activity: any): Promise<void> {
    // Implement the logic to set Discord activity
  }

  async clearActivity(): Promise<void> {
    // Implement the logic to clear Discord activity
  }
}
