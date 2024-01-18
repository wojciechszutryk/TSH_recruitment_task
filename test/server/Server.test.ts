import { MovieHandler } from "../../src/handlers/movie.handler";
import { HTTP_CODES } from "../../src/model/server.model";
import { Server } from "../../src/server/Server";

jest.mock("../../src/handlers/movie.handler");

const requestMock = {
  url: "",
  headers: {
    "user-agent": "jest-test",
  },
};

var endMock = jest.fn();
var writeHeadMock = jest.fn();
const responseMock = {
  end: endMock,
  writeHead: writeHeadMock,
};

const nextMock = jest.fn();

var listenMock = jest.fn();
var useMock = jest.fn();

jest.mock("express", () => {
  return () => {
    return {
      use: (cb: Function) => {
        cb(requestMock, responseMock, nextMock);
      },
      listen: listenMock,
    };
  };
});

describe("Server test suite", () => {
  let sut: Server;

  beforeEach(() => {
    sut = new Server();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should start server on port 3000", async () => {
    await sut.startServer();

    expect(listenMock).toHaveBeenCalledWith(3000);
  });

  it("should handle movies requests", async () => {
    requestMock.url = "localhost:3000/movies";
    const handleRequestSpy = jest.spyOn(
      MovieHandler.prototype,
      "handleRequest"
    );

    await sut.startServer();

    expect(handleRequestSpy).toHaveBeenCalled();
    expect(handleRequestSpy).toHaveBeenCalledTimes(1);
    expect(MovieHandler).toHaveBeenCalledWith(requestMock, responseMock);
  });

  it("should do nothing if route is not recognized", async () => {
    requestMock.url = "localhost:3000/fsd";
    const movieHandlerSpy = jest.spyOn(MovieHandler.prototype, "handleRequest");

    await sut.startServer();

    expect(movieHandlerSpy).not.toHaveBeenCalled();
  });

  it("should handle errors in routes", async () => {
    requestMock.url = "localhost:3000/movies";
    const handleRequestSpy = jest.spyOn(
      MovieHandler.prototype,
      "handleRequest"
    );

    handleRequestSpy.mockRejectedValueOnce(new Error("test error"));

    await sut.startServer();

    expect(responseMock.writeHead).toHaveBeenCalledWith(
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      JSON.stringify(`Internal server error: test error`)
    );
  });
});
