import { Movie } from "../model/movie/movie.model";

export class MovieDataAccess {
  async addMovie(movie: Movie): Promise<string> {
    // Implementation for adding a new movie
    return "";
  }

  async getMoviesByDuration(duration: number): Promise<Movie[]> {
    // Implementation for getting movies by duration
    return [];
  }

  async getMoviesByGenres(genres: string[]): Promise<Movie[]> {
    // Implementation for getting movies by genres
    return [];
  }

  async getMoviesByDurationAndGenres(
    duration: number,
    genres: string[]
  ): Promise<Movie[]> {
    // Implementation for getting movies by duration and genres
    return [];
  }
}
