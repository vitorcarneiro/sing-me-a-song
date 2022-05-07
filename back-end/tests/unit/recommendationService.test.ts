/* eslint-disable no-undef */
import { jest } from "@jest/globals";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import { recommendationService } from "./../../src/services/recommendationsService";
import { recommendationFactory } from "./../factories/recomendationFactory";

describe("Create", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create a recommendation", async () => {
    const recommendationRepositoryCreate = jest
      .spyOn(recommendationRepository, "create")
      .mockResolvedValue(null);

    await recommendationService.insert(recommendationFactory);

    expect(recommendationRepositoryCreate).toBeCalledTimes(1);
    expect(recommendationRepositoryCreate).toBeCalledWith(
      recommendationFactory
    );
  });
});

describe("Update score", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

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
});

function findUpdateScoreSpy() {
  jest.spyOn(recommendationRepository, "find").mockResolvedValue({
    id: 1,
    ...recommendationFactory,
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
