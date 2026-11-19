import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { connectDB, seedSuperAdmin } from "./app/DB";

async function main() {
  await connectDB();
  await seedSuperAdmin();

  const server: Server = app.listen(config.port, () => {
    console.log(`🚀 Server is running on port ${config.port}`);
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("unhandledRejection", (error) => {
    console.error(error);
    server.close(() => process.exit(1));
  });
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
