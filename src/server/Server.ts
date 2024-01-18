import { IncomingMessage, Server as NodeServer, ServerResponse } from "http";
import { HTTP_CODES } from "../model/server.model";
import express, {Request, Response} from "express";
import { MovieHandler } from "../handlers/movie.handler";

export class Server {
  private server: NodeServer | undefined;

  public async startServer() {
    const app = express();

    app.use(express.json());
    app.use(async (req, res) => {
      await this.handleRequest(req, res);
      res.end();
    });
    this.server = app.listen(3000);
    console.log("server started");
  }

  private async handleRequest(
    request: Request,
    response: Response
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

  private getRouteFromUrl(request: IncomingMessage): string | undefined {
    const fullUrl = request.url;
    if (fullUrl) {
      const parsedUrl = new URL(fullUrl, `http://${request.headers.host}`);
      const pathname = parsedUrl.pathname;
      const segments = pathname.split("/").filter(Boolean);
      return segments[0];
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
