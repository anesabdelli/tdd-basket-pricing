import cors from "cors";
import express, { Request, Response } from "express";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/baskets", (request: Request, response: Response) => {});

export default app;
