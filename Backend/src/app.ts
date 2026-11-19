import cors from "cors";
import path from "path";
import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import httpStatus from "http-status";
import config from "./config";
import router from "./app/routes";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: config.cors_origins.length > 0 ? config.cors_origins : false,
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.get("/health", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({ success: true, message: "API is running" });
});

app.use("/api/v1", router);

// Minimal plain frontend (public/index.html, app.js, style.css)
app.use(express.static(path.join(__dirname, "..", "public")));

app.use(GlobalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    errorMessages: [{ path: req.originalUrl, message: "Your requested path is not found" }],
  });
});

export default app;
