const express = require("express");
const morgan = require("morgan");
;
const app = express();

const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");

//Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}


app.use((request, response, next) => {
  console.log("Hello  from the global middleware, works on every request/route");
  next();
});

app.use(express.json());

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/jobs", jobRoutes);


module.exports = app;
