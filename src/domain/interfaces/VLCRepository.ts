export interface VLCRepository {
  getStatus(): Promise<{
    title: string;
    length: string;
    time: string;
    state: string;
  } | null>;
}
