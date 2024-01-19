export interface Movie {
  id: number;
  genres: string[];
  title: string;
  year: string;
  runtime: string;
  director: string;
  actors?: string;
  plot?: string;
  posterUrl?: string;
}
