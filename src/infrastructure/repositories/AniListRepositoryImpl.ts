import { AniListRepository } from "../../domain/interfaces/AniListRepository";

export class AniListRepositoryImpl implements AniListRepository {
  async getAniImage(
    title: string
  ): Promise<{ largeImageKey: string; largeImageText: string }> {
    // Implement the logic to get anime image
    return { largeImageKey: "", largeImageText: "" }; // Placeholder
  }

  async updateAniList(title: string, episode: number): Promise<void> {
    // Implement the logic to update AniList
  }
}
