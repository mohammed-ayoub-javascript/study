export interface VideoData {
  VideoURL: string;
  Title: string;
  Description: string;
  Points: number;
  watched_time: number;
}

export interface BoostMessage {
  time: number;
  content: string;
  color: string;
}

export type PomodoroPhase = 'work' | 'break';
