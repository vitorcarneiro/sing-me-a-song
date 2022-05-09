/* eslint-disable no-undef */
import supertest from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/database.js";
import {
  recommendationBodyFactory,
  recommendationDataFactory,
  recommendationDataNoIdFactory,
} from "../factories/recommendationFactory.js";

beforeEach(truncateTables);
afterAll(disconnect);

describe("Test recommendations router - POST /recommendations", () => {
  it("should return status code 422 when name is missing", async () => {
    const body = {
      ...recommendationBodyFactory(),
      name: "",
    };

    const response = await supertest(app).post("/recommendations").send(body);

    expect(response.status).toBe(422);
  });

  it("should return status code 422 when name is not a string", async () => {
    const body = {
      ...recommendationBodyFactory(),
      name: ["invalid name format"],
    };

    const response = await supertest(app).post("/recommendations").send(body);

    expect(response.status).toBe(422);
  });

  it("should return status code 422 when youtubeLink is missing", async () => {
    const body = {
      ...recommendationBodyFactory(),
      youtubeLink: "",
    };

    const response = await supertest(app).post("/recommendations").send(body);

    expect(response.status).toBe(422);
  });

  it("should return status code 422 when youtubeLink is not a string", async () => {
    const body = {
      ...recommendationBodyFactory(),
      youtubeLink: ["invalid youtube link format"],
    };

    const response = await supertest(app).post("/recommendations").send(body);

    expect(response.status).toBe(422);
  });

  it("should return status code 422 when youtubeLink is not a a valid youtubeLink", async () => {
    const body = {
      ...recommendationBodyFactory(),
      youtubeLink: "https://www.twitch.tv/casimito",
    };

    const response = await supertest(app).post("/recommendations").send(body);

    expect(response.status).toBe(422);
  });

  it("should return 201 and persist given a valid request", async () => {
    const body = recommendationBodyFactory();

    const response = await supertest(app).post("/recommendations").send(body);

    const result = await prisma.recommendation.findUnique({
      where: {
        name: body.name,
      },
    });

    expect(response.status).toBe(201);
    expect(result.youtubeLink).toBe(body.youtubeLink);
  });
});

describe("Test recommendations router - GET /recommendations", () => {
  it("should return 200 and a object with recommendations", async () => {
    const response = await supertest(app).get("/recommendations");
    expect(response.status).toBe(200);
  });
});

describe("Test recommendations router - GET /random", () => {
  it("should return 200 and a object with random recommendations", async () => {
    const data = recommendationBodyFactory();

    await prisma.recommendation.create({
      data,
    });

    const response = await supertest(app).get("/recommendations/random");
    expect(response.status).toBe(200);
  });

  it("should return 404 when has no recommendations", async () => {
    const response = await supertest(app).get("/recommendations/random");
    expect(response.status).toBe(404);
  });
});

describe("Test recommendations router - GET /top/:amount", () => {
  it("should return 200 and a array of objects with top 2 recommendations", async () => {
    await prisma.recommendation.createMany({
      data: [
        recommendationDataNoIdFactory(),
        recommendationDataNoIdFactory(),
        recommendationDataNoIdFactory(),
      ],
    });

    const response = await supertest(app).get(`/recommendations/top/2`);

    expect(response.body.length).toEqual(2);
    expect(response.body[0].score >= response.body[1].score).toEqual(true);
    expect(response.status).toBe(200);
  });

  it("should return 404 when has no recommendations", async () => {
    const response = await supertest(app).get("/recommendations/random");
    expect(response.status).toBe(404);
  });
});

describe("Test recommendations router - GET /:id", () => {
  it("should return 200 and a object with right found recommendation", async () => {
    const recomendation = { id: 1, ...recommendationDataNoIdFactory() };

    await prisma.recommendation.createMany({
      data: [
        recomendation,
        recommendationDataNoIdFactory(),
        recommendationDataNoIdFactory(),
      ],
    });

    const response = await supertest(app).get(
      `/recommendations/${recomendation.id}`
    );

    expect(response.body).not.toBeNull();
    expect(response.body.id).toEqual(recomendation.id);
    expect(response.status).toBe(200);
  });

  it("should return 200 when has no recommendations and an empty object", async () => {
    const response = await supertest(app).get(`/recommendations/999`);
    expect(typeof response.body).toEqual("object");
    expect(response.status).toBe(200);
  });
});

describe("Test recommendations router - POST /recommendations/upvote", () => {
  it("should return 200 and increment the score counter by 1 ", async () => {
    const recommendation = recommendationDataFactory();
    const { score: scoreBefore } = recommendation;

    await prisma.recommendation.create({ data: recommendation });

    const response = await supertest(app).post(
      `/recommendations/${recommendation.id}/upvote`
    );

    const { score: scoreAfter } = await prisma.recommendation.findUnique({
      where: {
        id: recommendation.id,
      },
    });

    expect(response.status).toBe(200);
    expect(scoreAfter - scoreBefore).toBe(1);
  });

  it("should return 404 when recommendation id have not been found ", async () => {
    const response = await supertest(app).post(`/recommendations/1/upvote`);
    expect(response.status).toBe(404);
  });
});

describe("Test recommendations router - POST /recommendations/downvote", () => {
  it("should return 200 and decrement the score counter by 1 ", async () => {
    const recommendation = recommendationDataFactory();
    const { score: scoreBefore } = recommendation;

    await prisma.recommendation.create({ data: recommendation });

    const response = await supertest(app).post(
      `/recommendations/${recommendation.id}/downvote`
    );

    const { score: scoreAfter } = await prisma.recommendation.findUnique({
      where: {
        id: recommendation.id,
      },
    });

    expect(response.status).toBe(200);
    expect(scoreAfter - scoreBefore).toBe(-1);
  });

  it("should return 404 when recommendation id have not been found ", async () => {
    const response = await supertest(app).post(`/recommendations/1/downvote`);
    expect(response.status).toBe(404);
  });

  it("should return 200 and delete recommendation when score is less than -5", async () => {
    const recommendationBefore = { ...recommendationDataFactory(), score: -6 };

    await prisma.recommendation.create({ data: recommendationBefore });

    const response = await supertest(app).post(
      `/recommendations/${recommendationBefore.id}/downvote`
    );

    const recommendationAfter = await prisma.recommendation.findUnique({
      where: {
        id: recommendationBefore.id,
      },
    });

    expect(recommendationAfter).toBeNull();
    expect(response.status).toBe(200);
  });
});

async function disconnect() {
  await prisma.$disconnect();
}

async function truncateTables() {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
}
