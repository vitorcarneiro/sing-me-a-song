/* eslint-disable no-undef */
import supertest from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/database.js";
import recommendationBodyFactory from "../factories/recommendationBodyFactory.js";

describe("Test recommendations router - POST /recommendations", () => {
  beforeEach(truncateTables);
  afterAll(disconnect);

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
      name: [1],
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
      youtubeLink: [1],
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

async function disconnect() {
  await prisma.$disconnect();
}

async function truncateTables() {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
}
