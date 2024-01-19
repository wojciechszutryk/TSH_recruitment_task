import { Movie } from "../../src/model/movie/movie.model";
import { MoviesService } from "../../src/services/movies.service";
import fs from "fs/promises";

jest.mock("fs/promises");

const someMovie1 = {
  id: 1,
  title: "Beetlejuice",
  year: "1988",
  runtime: "92",
  genres: ["Comedy", "Fantasy"],
  director: "Tim Burton",
  actors: "Alec Baldwin, Geena Davis, Annie McEnroe, Maurice Page",
  plot: 'A couple of recently deceased ghosts contract the services of a "bio-exorcist" in order to remove the obnoxious new owners of their house.',
  posterUrl:
    "https://images-na.ssl-images-amazon.com/images/M/MV5BMTUwODE3MDE0MV5BMl5BanBnXkFtZTgwNTk1MjI4MzE@._V1_SX300.jpg",
};

const someMovie2 = {
  id: 2,
  title: "The Cotton Club",
  year: "1984",
  runtime: "127",
  genres: ["Crime", "Drama", "Music"],
  director: "Francis Ford Coppola",
  actors: "Richard Gere, Gregory Hines, Diane Lane, Lonette McKee",
  plot: "The Cotton Club was a famous night club in Harlem. The story follows the people that visited the club, those that ran it, and is peppered with the Jazz music that made it so famous.",
  posterUrl:
    "https://images-na.ssl-images-amazon.com/images/M/MV5BMTU5ODAyNzA4OV5BMl5BanBnXkFtZTcwNzYwNTIzNA@@._V1_SX300.jpg",
};

describe("MoviesService test suite", () => {
  let sut: MoviesService;

  beforeEach(() => {
    (fs.readFile as jest.MockedFunction<typeof fs.readFile>).mockResolvedValue(
      JSON.stringify({ movies: [], genres: [] })
    );
    (
      fs.writeFile as jest.MockedFunction<typeof fs.writeFile>
    ).mockResolvedValue();
    sut = new MoviesService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return a random movie", async () => {
    const loadDataFromDbSpy = jest.spyOn(sut as any, "loadDataFromDb");
    loadDataFromDbSpy.mockResolvedValueOnce({
      movies: [someMovie1, someMovie2],
      genres: [...someMovie1.genres, ...someMovie2.genres],
    });

    const result = await sut.getRandomMovie();
    expect(result).toBeDefined();
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("title");
  });

  it("should get movies by duration", async () => {
    const loadMoviesFromDBSpy = jest.spyOn(sut as any, "loadMoviesFromDB");
    loadMoviesFromDBSpy.mockResolvedValueOnce([someMovie1, someMovie2]);

    const result = await sut.getMoviesByDuration(83);
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
  });

  it("should return no movie when duration criteria is not met", async () => {
    const loadMoviesFromDBSpy = jest.spyOn(sut as any, "loadMoviesFromDB");
    loadMoviesFromDBSpy.mockResolvedValueOnce([someMovie1, someMovie2]);

    const result = await sut.getMoviesByDuration(49);
    expect(result).toBeDefined();
    expect(result).toHaveLength(0);
  });

  it("should get movie by genre", async () => {
    const loadMoviesFromDBSpy = jest.spyOn(sut as any, "loadMoviesFromDB");
    loadMoviesFromDBSpy.mockResolvedValueOnce([someMovie1, someMovie2]);

    const result = await sut.getMoviesByGenres(["Music"]);
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
  });

  it("should return no movie when genre criteria is not met", async () => {
    const loadMoviesFromDBSpy = jest.spyOn(sut as any, "loadMoviesFromDB");
    loadMoviesFromDBSpy.mockResolvedValueOnce([someMovie1, someMovie2]);

    const result = await sut.getMoviesByGenres(["Horror"]);
    expect(result).toBeDefined();
    expect(result).toHaveLength(0);
  });

  it("should get movie by duration and genre", async () => {
    const loadMoviesFromDBSpy = jest.spyOn(sut as any, "loadMoviesFromDB");
    loadMoviesFromDBSpy.mockResolvedValueOnce([someMovie1, someMovie2]);

    const result = await sut.getMoviesByDurationAndGenres(127, ["Music"]);
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
  });

  it("should add valid movie", async () => {
    const saveDataToDBSpy = jest.spyOn(sut as any, "saveDataToDB");

    const result = await sut.addMovie(someMovie1);
    expect(result).toBeDefined();
    expect(saveDataToDBSpy).toHaveBeenCalled();
  });

  it("should add movie and genre", async () => {
    const saveDataToDBSpy = jest.spyOn(sut as any, "saveDataToDB");
    const validateMovieSpy = jest.spyOn(sut as any, "validateMovie");
    const loadDataFromDbSpy = jest.spyOn(sut as any, "loadDataFromDb");
    validateMovieSpy.mockReturnValueOnce(true);
    loadDataFromDbSpy.mockResolvedValueOnce({
      movies: [someMovie1, someMovie2],
      genres: [...someMovie1.genres, ...someMovie2.genres],
    });

    const result = await sut.addMovie({
      ...someMovie1,
      genres: [...someMovie1.genres, "Horror"],
    });
    expect(result).toBeDefined();
    expect(saveDataToDBSpy).toHaveBeenCalledWith(
      { ...someMovie1, genres: [...someMovie1.genres, "Horror"], id: 3 },
      ["Horror"]
    );
  });

  it("should not add movie when it is invalid", async () => {
    const saveDataToDBSpy = jest.spyOn(sut as any, "saveDataToDB");
    const validateMovieSpy = jest.spyOn(sut as any, "validateMovie");
    validateMovieSpy.mockReturnValueOnce(false);

    await expect(sut.addMovie(someMovie1)).rejects.toThrow(
      "Invalid movie data"
    );
    expect(saveDataToDBSpy).not.toHaveBeenCalled();
  });

  it("should throw error when adding movie with no genre (undefined)", async () => {
    await expect(
      sut.addMovie({ ...someMovie1, genres: undefined } as unknown as Movie)
    ).rejects.toThrow("Genres cannot be empty");
  });

  it("should throw error when adding movie with no genre (empty array)", async () => {
    await expect(
      sut.addMovie({ ...someMovie1, genres: undefined } as unknown as Movie)
    ).rejects.toThrow("Genres cannot be empty");
  });

  it("should throw error when adding movie with no title (undefined)", async () => {
    await expect(
      sut.addMovie({ ...someMovie1, title: undefined } as unknown as Movie)
    ).rejects.toThrow("Title cannot be empty");
  });

  it("should throw error when adding movie with no title (empty string)", async () => {
    await expect(
      sut.addMovie({ ...someMovie1, title: "" } as unknown as Movie)
    ).rejects.toThrow("Title cannot be empty");
  });

  it("should throw error when adding movie with too long title", async () => {
    await expect(
      sut.addMovie({
        ...someMovie1,
        title: "a".repeat(256),
      } as unknown as Movie)
    ).rejects.toThrow("Title cannot be longer than 255 characters");
  });

  it("should throw error when adding movie with no director (undefined)", async () => {
    await expect(
      sut.addMovie({ ...someMovie1, director: undefined } as unknown as Movie)
    ).rejects.toThrow("Director cannot be empty");
  });

  it("should throw error when adding movie with no director (empty string)", async () => {
    await expect(
      sut.addMovie({ ...someMovie1, director: "" } as unknown as Movie)
    ).rejects.toThrow("Director cannot be empty");
  });

  it("should throw error when adding movie with too long director", async () => {
    await expect(
      sut.addMovie({
        ...someMovie1,
        director: "a".repeat(256),
      } as unknown as Movie)
    ).rejects.toThrow("Director cannot be longer than 255 characters");
  });

  it("should throw error when reading data from file was unsuccessful", async () => {
    const loadDataFromDbSpy = jest.spyOn(sut as any, "loadDataFromDb");
    loadDataFromDbSpy.mockRejectedValueOnce(
      new Error("Could not load movies from DB")
    );

    await expect(sut.getRandomMovie()).rejects.toThrow(
      "Could not load movies from DB"
    );
  });
});
