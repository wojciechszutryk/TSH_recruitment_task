import { IncomingMessage, Server as NodeServer, ServerResponse } from "http";
import { HTTP_CODES } from "../model/server.model";
import express from "express";
import { MovieHandler } from "../handlers/movie.handler";

export class Server {
  private server: NodeServer | undefined;

  public async startServer() {
    const app = express();

    app.use(async (req, res) => {
      await this.handleRequest(req, res);
      res.end();
    });
    this.server = app.listen(3000);
    console.log("server started");
  }

  private async handleRequest(
    request: IncomingMessage,
    response: ServerResponse
  ) {
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

  private getRouteFromUrl(request: IncomingMessage) {
    const fullRoute = request.url;
    if (fullRoute) {
      return fullRoute.split("/")[1];
    }
  }

  public async stopServer() {
    if (this.server) {
      console.log("closing server");
      return new Promise<void>((resolve, reject) => {
        this.server!.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log("server closed");
            resolve();
          }
        });
      });
    }
  }
}
