const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cron = require("node-cron");
const Job = require("./models/jobModel");
dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE;

mongoose.connect(DB).then((con) => {
  console.log("DB CONNECTION SUCCESSFUL");
});

//SERVER
const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});



//cron job set up
cron.schedule("0 0 * * *", async () => {
  try {
    const result = await Job.updateMany(
      { closing_date: { $lt: new Date() }, status: "open" },
      { status: "closed" }
    );
    console.log(`${result} jobs have been closed.`);
  } catch (err) {
    console.error("Error updating job status:", err);
  }
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
