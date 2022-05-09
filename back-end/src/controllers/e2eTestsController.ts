import { Request, Response } from "express";
import { recommendationService } from "../services/recommendationsService.js";

async function truncate(req: Request, res: Response) {
  await recommendationService.truncate();
  res.sendStatus(200);
}

const e2eController = {
  truncate,
};

export default e2eController;
