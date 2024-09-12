const SavedJob = require("../models/savedJobsModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.saveJob = catchAsync(async (request, response, next) => {
  if (!request.body.jobId) {
    request.body.jobId = request.params.jobId;
  }

  if (!request.body.user) {
    request.body.userId = request.user._id;
  }
  // Check if the job has already been saved by this user
  const existingSavedJob = await SavedJob.findOne({
    user: request.body.userId,
    job: request.body.jobId,
  });

  console.log(existingSavedJob, "here");

  if (existingSavedJob) {
    return next(new AppError("You have already saved this job.", 400));
  }

  // Create a new saved job entry for the user
  const savedJob = await SavedJob.create({
    user: request.body.userId,
    job: request.body.jobId,
  });

  response.status(201).json({
    status: "success",
    data: {
      savedJob,
    },
  });
});

exports.checkSavedJob = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const jobId = req.params.jobId;


  console.log(userId, jobId)
  
  const existingSavedJob = await SavedJob.findOne({
    user: userId,
    job: jobId,
  });


  console.log(existingSavedJob, "existing");

  // If a saved job exists, return true
  if (existingSavedJob) {
    return res.status(200).json({
      status: "success",
      data: true, // Job is already saved
    });
  }

  // If no saved job is found, return false
  res.status(200).json({
    status: "success",
    data: false, // Job is not saved
  });
});

exports.getSavedJobs = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const savedJobs = await SavedJob.find({ user: userId }).populate("job");

  res.status(200).json({
    status: "success",
    results: savedJobs.length,
    data: {
      savedJobs,
    },
  });
});

exports.unsaveJob = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { jobId } = req.params;

  const deletedJob = await SavedJob.findOneAndDelete({
    user: userId,
    job: jobId,
  });

  if (!deletedJob) {
    return next(new AppError("No saved job found with that ID.", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
