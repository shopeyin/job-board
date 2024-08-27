const Application = require("../models/applicationModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllJobsApplications = catchAsync(async (request, response, next) => {
  console.log(request.params);
  const applications = await Application.find({ job: request.params.jobId })
    .populate("applicant")
    .exec();
  console.log(applications);

  response.status(200).json({
    status: "success",
    results: applications.length,
    data: {
      applications,
    },
  });
});

exports.createJobApplication = catchAsync(async (request, response, next) => {
  request.body.applicant = request.user._id;
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
    request.params.jobId,
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
