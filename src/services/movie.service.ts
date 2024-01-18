import fs from "fs/promises";
import path from "path";
import { Movie } from "../model/movie/movie.model";
import { DB } from "../model/db/db.model";

const DB_PATH = path.resolve(__dirname, "../../data/db.json");

export class MoviesService {
  async getRandomMovie(): Promise<Movie> {
    const movies = await this.loadMoviesFromDB();
    const randomIndex = Math.floor(Math.random() * movies.length);
    return movies[randomIndex];
  }

  async getMoviesByDuration(duration: number): Promise<Movie[]> {
    const movies = await this.loadMoviesFromDB();
    return movies.filter(
      (movie) =>
        movie.runtime >= duration - 10 && movie.runtime <= duration + 10
    );
  }

  async getMoviesByGenres(genres: string[]): Promise<Movie[]> {
    const movies = await this.loadMoviesFromDB();
    return movies.filter((movie) =>
      movie.genres.some((genre) => genres.includes(genre))
    );
  }

  async getMoviesByDurationAndGenres(
    duration: number,
    genres: string[]
  ): Promise<Movie[]> {
    const movies = await this.loadMoviesFromDB();
    return movies.filter(
      (movie) =>
        movie.runtime >= duration - 10 &&
        movie.runtime <= duration + 10 &&
        movie.genres.some((genre) => genres.includes(genre))
    );
  }

  async addMovie(movie: Movie): Promise<number> {
    if (this.validateMovie(movie)) {
      const id = (await this.findLastMovieId()) + 1;
      await this.saveMovieToDB({ ...movie, id });
      return id;
    } else {
      throw new Error("Invalid movie data");
    }
  }

  private validateMovie(movie: Movie): boolean {
    return (
      movie.genres.length > 0 &&
      movie.title.length > 0 &&
      movie.title.length <= 255 &&
      Number.isInteger(movie.year) &&
      Number.isInteger(movie.runtime) &&
      movie.director.length > 0 &&
      movie.director.length <= 255
    );
  }

  private async loadDataFromDb(): Promise<DB> {
    const dbContent = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(dbContent);
  }

  private async loadMoviesFromDB(): Promise<Movie[]> {
    try {
      const { movies } = await this.loadDataFromDb();
      return movies;
    } catch (error) {
      return [];
    }
  }

  private async saveMovieToDB(movie: Movie): Promise<void> {
    const currentData = await this.loadDataFromDb();
    currentData.movies.push(movie);
    const dbContent = { ...currentData };
    await fs.writeFile(DB_PATH, JSON.stringify(dbContent, null, 2), "utf-8");
  }

  private async findLastMovieId(): Promise<number> {
    const movies = await this.loadMoviesFromDB();
    const lastId = movies.reduce((acc, movie) => {
      const id = movie.id;
      return id > acc ? id : acc;
    }, 0);

    return lastId;
  }
}
