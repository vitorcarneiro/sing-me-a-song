/* eslint-disable no-undef */
import { jest } from "@jest/globals";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import { recommendationService } from "../../src/services/recommendationsService";
import { recommendationBodyFactory } from "../factories/recommendationFactory";

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

describe("Create", () => {
  it("should create a recommendation", async () => {
    const body = recommendationBodyFactory();

    const recommendationRepositoryCreate = jest
      .spyOn(recommendationRepository, "create")
      .mockResolvedValue(null);

    await recommendationService.insert(body);

    expect(recommendationRepositoryCreate).toBeCalledTimes(1);
    expect(recommendationRepositoryCreate).toBeCalledWith(body);
  });
});

describe("Update score", () => {
  it("should upvote a recommendation", async () => {
    const recommendationRepositoryUpdateScore = findUpdateScoreSpy();

    await recommendationService.upvote(1);

    expect(recommendationRepositoryUpdateScore).toBeCalledTimes(1);
    expect(recommendationRepositoryUpdateScore).toBeCalledWith(1, "increment");
  });

  it("should not upvote a not found recommendation", async () => {
    findWithInvalidId();

    expect(
      async () => await recommendationService.upvote(1)
    ).rejects.toHaveProperty("type", "not_found");
  });

  it("should downvote a recommendation", async () => {
    const recommendationRepositoryUpdateScore = findUpdateScoreSpy();

    await recommendationService.downvote(1);

    expect(recommendationRepositoryUpdateScore).toBeCalledTimes(1);
    expect(recommendationRepositoryUpdateScore).toBeCalledWith(1, "decrement");
  });

  it("should not downvote a not found recommendation", async () => {
    findWithInvalidId();

    expect(
      async () => await recommendationService.downvote(1)
    ).rejects.toHaveProperty("type", "not_found");
  });

  it("should remove a recommendation when ", async () => {
    jest.spyOn(recommendationRepository, "find").mockResolvedValue({
      id: 1,
      ...recommendationBodyFactory(),
      score: -6,
    });

    jest.spyOn(recommendationRepository, "updateScore").mockResolvedValue(null);

    const recommendationRepositoryRemove = jest
      .spyOn(recommendationRepository, "remove")
      .mockResolvedValue(null);

    await recommendationService.downvote(1);

    expect(recommendationRepositoryRemove).toHaveBeenCalled();
  });
});

describe("Get by id", () => {
  it("should return found recommendation", async () => {
    jest.spyOn(recommendationRepository, "find").mockResolvedValue({
      id: 1,
      ...recommendationBodyFactory(),
      score: 0,
    });

    const recommendationFindById = await recommendationService.getById(1);

    expect(recommendationFindById).not.toBeNull();
  });
});

describe("Get", () => {
  it("should return 2 recommendations", async () => {
    jest.spyOn(recommendationRepository, "findAll").mockResolvedValue([
      {
        id: 1,
        ...recommendationBodyFactory(),
        score: 0,
      },
      {
        id: 2,
        ...recommendationBodyFactory(),
        name: "Test 2",
        score: 5,
      },
    ]);

    const recommendationGet = await recommendationService.get();

    expect(recommendationGet.length).toEqual(2);
  });
});

describe("Get top", () => {
  it("should return 3 recommendations", async () => {
    const recommendationsOrderByScore = jest
      .spyOn(recommendationRepository, "getAmountByScore")
      .mockResolvedValue([
        {
          id: 1,
          ...recommendationBodyFactory(),
          score: 1000,
        },
        {
          id: 2,
          ...recommendationBodyFactory(),
          name: "Test 2",
          score: 500,
        },
        {
          id: 3,
          ...recommendationBodyFactory(),
          name: "Test 3",
          score: 400,
        },
      ]);

    const recommendationGetTop = await recommendationService.getTop(3);

    expect(recommendationsOrderByScore).toHaveBeenCalled();

    expect(recommendationGetTop.length).toEqual(3);

    expect(
      recommendationGetTop[0].score >= recommendationGetTop[1].score &&
        recommendationGetTop[1].score >= recommendationGetTop[2].score
    ).toEqual(true);
  });
});

describe("Get random", () => {
  it("should return a random recommendation recommendations", async () => {
    jest.spyOn(recommendationService, "getScoreFilter").mockReturnValue("gt");

    const recommendationRepositoryFindAll = jest
      .spyOn(recommendationRepository, "findAll")
      .mockResolvedValue([
        {
          id: 1,
          ...recommendationBodyFactory(),
          score: 1000,
        },
        {
          id: 2,
          ...recommendationBodyFactory(),
          name: "Test 2",
          score: 500,
        },
        {
          id: 3,
          ...recommendationBodyFactory(),
          name: "Test 3",
          score: 400,
        },
      ]);

    jest.spyOn(recommendationService, "getByScore").mockResolvedValue([
      {
        id: 1,
        ...recommendationBodyFactory(),
        score: 1000,
      },
      {
        id: 2,
        ...recommendationBodyFactory(),
        name: "Test 2",
        score: 500,
      },
      {
        id: 3,
        ...recommendationBodyFactory(),
        name: "Test 3",
        score: 400,
      },
    ]);

    const recommendationGetRandom = await recommendationService.getRandom();

    expect(recommendationRepositoryFindAll).toHaveBeenCalled();

    expect(typeof recommendationGetRandom).toEqual("object");
  });

  it("should return not found when has no recommendations", async () => {
    jest.spyOn(recommendationService, "getScoreFilter").mockReturnValue("gt");

    jest.spyOn(recommendationRepository, "findAll").mockResolvedValue([]);

    jest.spyOn(recommendationService, "getByScore").mockResolvedValue([]);

    expect(
      async () => await recommendationService.getRandom()
    ).rejects.toHaveProperty("type", "not_found");
  });
});

function findUpdateScoreSpy() {
  jest.spyOn(recommendationRepository, "find").mockResolvedValue({
    id: 1,
    ...recommendationBodyFactory(),
    score: 0,
  });

  const recommendationRepositoryUpdateScore = jest
    .spyOn(recommendationRepository, "updateScore")
    .mockResolvedValue(null);

  return recommendationRepositoryUpdateScore;
}

function findWithInvalidId() {
  jest.spyOn(recommendationRepository, "find").mockResolvedValue(null);
  return null;
}
