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

  async addMovie(movieData: Movie): Promise<Movie> {
    if (this.validateMovie(movieData)) {
      const { movies, genres } = await this.loadDataFromDb();
      const lastMovieId = movies.reduce((acc, movie) => {
        const id = movie.id;
        return id > acc ? id : acc;
      }, 0);

      const newMovie = { ...movieData, id: lastMovieId + 1 };
      const movieGenres = movieData.genres;
      let newGenresToSave: string[] = [];

      if (movieGenres) {
        newGenresToSave = movieGenres.filter(
          (genre) => !genres.includes(genre)
        );
      }

      await this.saveDataToDB(newMovie, newGenresToSave);
      return newMovie;
    } else {
      throw new Error("Invalid movie data");
    }
  }

  private validateMovie(movie: Movie): boolean {
    if (!movie.genres || movie.genres.length === 0) {
      throw new Error("Genres cannot be empty");
    } else if (!movie.title || movie.title.length === 0) {
      throw new Error("Title cannot be empty");
    } else if (movie.title.length > 255) {
      throw new Error("Title cannot be longer than 255 characters");
    } else if (!movie.director || movie.director.length === 0) {
      throw new Error("Director cannot be empty");
    } else if (movie.director.length > 255) {
      throw new Error("Director cannot be longer than 255 characters");
    }
    return true;
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

  private async saveDataToDB(
    movie: Movie,
    newGenres?: string[]
  ): Promise<void> {
    const currentData = await this.loadDataFromDb();
    currentData.movies.push(movie);
    if (newGenres) {
      currentData.genres.push(...newGenres);
    }
    const dbContent = JSON.stringify(currentData, null, 2);
    await fs.writeFile(DB_PATH, dbContent, "utf-8");
  }
}
