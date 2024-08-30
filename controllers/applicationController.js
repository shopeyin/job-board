const Application = require("../models/applicationModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllJobsApplications = catchAsync(async (request, response, next) => {

  let filter;
  if (request.params.jobId) {
    filter = { job: request.params.jobId };
  }
  const applications = await Application.find(filter)
    .populate("applicant")
    .populate("job")
    .exec();

  // const applications = await Application.find({ job: request.params.Id })
  //   .populate("applicant")
  //   .populate("job")
  //   .exec();

  response.status(200).json({
    status: "success",
    results: applications.length,
    data: {
      applications,
    },
  });
});

exports.createJobApplication = catchAsync(async (request, response, next) => {

  if (!request.body.job) {
    request.body.job = request.params.jobId;
  }

  if (!request.body.applicant) {
    request.body.applicant = request.user._id;
  }

  // Check if the job has already been saved by this user
  const existingApplication = await Application.findOne({
    applicant: request.user._id,
    job: request.params.jobId,
  });

  if (existingApplication) {
    return next(new AppError("You have already applied for this job.", 400));
  }

  const newApplication = await Application.create(request.body);

  response.status(201).json({
    status: "success",
    data: {
      application: newApplication,
    },
  });
});

exports.updateJobApplications = catchAsync(async (request, response, next) => {
  const application = await Application.findByIdAndUpdate(
    request.params.applicationId,
    request.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!application) {
    return next(new AppError("No application found with that ID", 404));
  }
  response.status(200).json({
    status: "success",
    data: {
      application,
    },
  });
});
