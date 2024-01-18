import { MoviesService } from "../services/movie.service";
import { IncomingMessage, ServerResponse } from "http";
import { HTTP_METHODS } from "../model/server.model";

export class MovieHandler {
  private request: IncomingMessage;
  private response: ServerResponse;
  private moviesService: MoviesService;

  constructor(request: IncomingMessage, response: ServerResponse) {
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
    } catch (error) {}
  }

  async handlePost() {
    // Implementation for adding a new movie
  }

  async handleGet() {
    // Implementation for getting movies based on conditions
  }
}
