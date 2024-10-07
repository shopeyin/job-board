const express = require("express");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const helmet = require("helmet");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const companyRoutes = require("./routes/companyRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const savedJobsRoutes = require("./routes/savedJobsRoutes");
const chatRoutes = require("./routes/chatRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

//SECURITY HTTP
app.use(helmet());

//Middleware
if (process.env.NODE_ENV === "development") {
  console.log("DEVELOPMENT");
  app.use(morgan("dev"));
} else {
  console.log("PRODUCTIOn");
}

app.use(cookieParser());
// app.use(
//   cors({
//     origin: "http://localhost:3000", // Your Next.js app's URL
//     credentials: true, // Allow credentials (cookies) to be sent
//   })
// );
const allowedOrigins = [
  "http://localhost:3000",
  "http://63.34.170.16:3000",
  "https://job-b-client.vercel.app/",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);




// app.use(cors(corsOptions));

// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many requests from this IP, please try again in an hour",
// });

// app.use("/api", limiter);

// body parser
app.use(express.json({ limit: "10kb" }));

//Data sanitization against NOSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());
// app.use(
//   hpp({
//     whitelist: [
//       "duration",
//       "ratingsQuantity",
//       "ratingsAverage",
//       "maxGroupSize",
//       "difficulty",
//       "price",
//     ],
//   })
// );

app.get("/", (req, res) => {
  // Set a cookie named 'user' with the value 'JohnDoe'
  res.cookie("user", "JohnDoe");
  res.send("Cookie set successfully");
});

app.use((request, response, next) => {
  // console.log(
  //   "Hello  from the global middleware, works on every request/route",
  //   request.cookies
  // );
  next();
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/savejobs", savedJobsRoutes);
app.use("/api/v1/chats", chatRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
