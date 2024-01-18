import { MovieHandler } from "../../src/handlers/movie.handler";
import { HTTP_CODES, HTTP_METHODS } from "../../src/model/server.model";
import { Request, Response } from "express";
import { MoviesService } from "../../src/services/movie.service";
import { send } from "process";
import { Movie } from "../../src/model/movie/movie.model";
import { error } from "console";

const addMovieMock = jest.fn();
const getMoviesByDurationAndGenresMock = jest.fn();
const getMoviesByDurationMock = jest.fn();
const getRandomMovieMock = jest.fn();
const getMoviesByGenresMock = jest.fn();

jest.mock("../../src/services/movie.service", () => {
  return {
    MoviesService: jest.fn().mockImplementation(() => ({
      addMovie: addMovieMock,
      getMoviesByDurationAndGenres: getMoviesByDurationAndGenresMock,
      getMoviesByDuration: getMoviesByDurationMock,
      getRandomMovie: getRandomMovieMock,
      getMoviesByGenres: getMoviesByGenresMock,
    })),
  };
});

describe("RegisterHandler test suite", () => {
  let sut: MovieHandler;
  const request: {
    method: string;
    url: string;
    body?: any;
  } = {
    url: "",
    method: "",
    body: {},
  };
  const responseMock = {
    statusCode: 0,
    setHeader: jest.fn(),
    end: jest.fn(),
    write: jest.fn(),
  };

  const someValidMovie = {
    genres: ["Action", "Drama"],
    title: "someTitle",
    year: 2020,
    runtime: 120,
    director: "someDirector",
  } as Movie;

  beforeEach(() => {
    sut = new MovieHandler(
      request as any as Request,
      responseMock as any as Response
    );
    expect(MoviesService).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    beforeEach(() => {
      request.method = HTTP_METHODS.GET;
    });

    it("should return random movie when there is no query params", async () => {
      request.url = "localhost:3000/movies";
      getRandomMovieMock.mockResolvedValueOnce(someValidMovie);

      await sut.handleRequest();

      expect(responseMock.statusCode).toBe(HTTP_CODES.OK);
      expect(responseMock.end).toHaveBeenCalledWith(
        JSON.stringify(someValidMovie)
      );
    });

    it("should return movies by duration", async () => {
      request.url = "localhost:3000/movies?duration=120";
      getMoviesByDurationMock.mockReturnValueOnce([someValidMovie]);

      await sut.handleRequest();

      expect(responseMock.statusCode).toBe(HTTP_CODES.OK);
      expect(responseMock.end).toHaveBeenCalledWith(
        JSON.stringify([someValidMovie])
      );
    });

    it("should return movies by genres", async () => {
      request.url = "localhost:3000/movies?genres=Action&genres=Drama";
      getMoviesByGenresMock.mockReturnValueOnce([someValidMovie]);

      await sut.handleRequest();

      expect(responseMock.statusCode).toBe(HTTP_CODES.OK);
      expect(responseMock.end).toHaveBeenCalledWith(
        JSON.stringify([someValidMovie])
      );
    });

    it("should return movies by duration and genres", async () => {
      request.url = "localhost:3000/movies?duration=120&genres=Action";
      getMoviesByDurationAndGenresMock.mockReturnValueOnce([someValidMovie]);

      await sut.handleRequest();

      expect(responseMock.statusCode).toBe(HTTP_CODES.OK);
      expect(responseMock.end).toHaveBeenCalledWith(
        JSON.stringify([someValidMovie])
      );
    });

    it("should catch error and return proper response", async () => {
      request.url = "localhost:3000/movies?genres=Action&genres=Drama";
      getMoviesByGenresMock.mockRejectedValueOnce(new Error("someError"));

      await sut.handleRequest();

      expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
      expect(responseMock.end).toHaveBeenCalledWith(
        JSON.stringify({ error: "someError" })
      );
    });
  });

  describe("POST", () => {
    beforeEach(() => {
      request.method = HTTP_METHODS.POST;
    });

    it("should return 201 when movie is added", async () => {
      request.url = "localhost:3000/movies";
      request.body = someValidMovie;
      addMovieMock.mockResolvedValueOnce(someValidMovie);

      await sut.handleRequest();

      expect(responseMock.statusCode).toBe(HTTP_CODES.CREATED);
      expect(responseMock.end).toHaveBeenCalledWith(
        JSON.stringify(someValidMovie)
      );
    });

    it("should catch error and return proper response", async () => {
      request.url = "localhost:3000/movies";
      request.body = someValidMovie;
      addMovieMock.mockRejectedValueOnce(new Error("someError"));

      await sut.handleRequest();

      expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
      expect(responseMock.end).toHaveBeenCalledWith(
        JSON.stringify({ error: "someError" })
      );
    });
  });

  it("should return 404 when method is not supported", async () => {
    request.method = "SOME_METHOD";

    await sut.handleRequest();

    expect(responseMock.statusCode).toBe(HTTP_CODES.NOT_fOUND);
    expect(responseMock.end).toHaveBeenCalledWith(
      JSON.stringify({ error: "Method not allowed" })
    );
  });
});
