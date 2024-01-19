import { HTTP_CODES } from "../model/server.model";
import express, { Request, Response } from "express";
import { MovieHandler } from "../handlers/movies.handler";
import { json } from "body-parser";

export class Server {
  public async startServer() {
    const app = express();

    app.use(json());
    app.use(async (req, res) => {
      await this.handleRequest(req, res);
      res.end();
    });
    app.listen(3000);
    console.log("server started");
  }

  private async handleRequest(request: Request, response: Response) {
    try {
      const route = this.getRouteFromUrl(request);
      switch (route) {
        case "movies":
          await new MovieHandler(request, response).handleRequest();
          break;
        default:
          break;
      }
    } catch (error) {
      response.writeHead(
        HTTP_CODES.INTERNAL_SERVER_ERROR,
        JSON.stringify(`Internal server error: ${error.message}`)
      );
      console.log(error);
    }
  }

  private getRouteFromUrl(request: Request): string | undefined {
    const fullUrl = request.url;
    if (fullUrl) {
      const path = fullUrl.split("?")[0];

      const segments = path.split("/");

      return segments[1];
    }
  }
}
