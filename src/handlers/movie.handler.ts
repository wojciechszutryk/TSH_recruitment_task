import { MoviesService } from "../services/movie.service";
import { IncomingMessage, ServerResponse } from "http";
import { HTTP_METHODS } from "../model/server.model";
import { Movie } from "../model/movie/movie.model";
import { Request, Response } from "express";

export class MovieHandler {
  private request: Request;
  private response: Response;
  private moviesService: MoviesService;

  constructor(request: Request, response: Response) {
    this.request = request;
    this.response = response;
    this.moviesService = new MoviesService();
  }

  public async handleRequest() {
    try {
      switch (this.request.method) {
        case HTTP_METHODS.POST:
          await this.handlePost();
          break;
        case HTTP_METHODS.GET:
          await this.handleGet();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(error);
      this.response.statusCode = 500;
      this.response.end(JSON.stringify({ error: "Internal Server Error" }));
    }
  }

  async handlePost() {
    try {
      const body: Movie = await this.request.body;
      const movieId = await this.moviesService.addMovie(body);
      this.response.statusCode = 201;
      this.response.end(JSON.stringify({ id: movieId }));
    } catch (error) {
      this.handleError(error);
    }
  }

  async handleGet() {
    try {
      const queryParams = new URLSearchParams(this.request.url?.split("?")[1]);
      const duration = queryParams.get("duration");
      const genres = queryParams.getAll("genres");

      if (duration && genres.length) {
        const movies = await this.moviesService.getMoviesByDurationAndGenres(
          parseInt(duration),
          genres
        );
        this.sendResponse(movies);
      } else if (duration) {
        const movie = await this.moviesService.getMoviesByDuration(
          parseInt(duration)
        );
        this.sendResponse(movie);
      } else if (genres.length) {
        const movies = await this.moviesService.getMoviesByGenres(genres);
        this.sendResponse(movies);
      } else {
        const movie = await this.moviesService.getRandomMovie();
        this.sendResponse(movie);
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  private sendResponse(data: any) {
    this.response.statusCode = 200;
    this.response.setHeader("Content-Type", "application/json");
    this.response.end(JSON.stringify(data));
  }

  private handleError(error: any) {
    this.response.statusCode = 400;
    this.response.end(
      JSON.stringify({ error: error?.message || "Invalid request" })
    );
  }
}
