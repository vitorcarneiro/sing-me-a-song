import { Router } from "express";
import e2eController from "../controllers/e2eTestsController.js";

const e2eRouter = Router();

e2eRouter.post("/e2e/truncate", e2eController.truncate);

export default e2eRouter;
