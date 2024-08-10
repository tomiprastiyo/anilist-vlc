export interface AniListRepository {
  getAniImage(
    title: string
  ): Promise<{ largeImageKey: string; largeImageText: string }>;
  updateAniList(title: string, episode: number): Promise<void>;
}
