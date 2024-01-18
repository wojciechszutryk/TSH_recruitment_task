import { Movie } from "../movie/movie.model";

export interface DB {
  genres: string[];
  movies: Movie[];
}
