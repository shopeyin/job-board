const Job = require("../models/jobModel");
const Company = require("../models/companyModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.lastXdays = async (request, response, next) => {
  if (request.query.lastDays) {
    // Handle filtering by last X days
    const lastDays = parseInt(request.query.lastDays, 10); // Default to 7 days if not provided
    if (!isNaN(lastDays) && lastDays > 0) {
      const dateThreshold = new Date(
        new Date().setDate(new Date().getDate() - lastDays)
      );
      request.query.created_at = { $gte: dateThreshold };
    }
  }

  next();
};

exports.getAllJobs = catchAsync(async (request, response, next) => {
  console.log(request.query);

  // Copy request.query into queryObj
  const queryObj = { ...request.query };

  // List of fields to exclude from the query object
  const excludedFields = ["page", "sort", "limit", "fields", "lastDays"];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Handle minSalary: replace with salary.min and add $gte condition
  if (queryObj.minSalary) {
    queryObj["salary.min"] = { $gte: queryObj.minSalary };
    delete queryObj.minSalary;
  }

  // Handle maxSalary: replace with salary.max and add $lte condition
  if (queryObj.maxSalary) {
    queryObj["salary.max"] = { $lte: queryObj.maxSalary };
    delete queryObj.maxSalary;
  }

  // Handle title: use regex to allow partial matching
  if (queryObj.title) {
    queryObj.title = { $regex: queryObj.title, $options: "i" }; // 'i' for case-insensitive
  }

  // Build the query
  let query = Job.find(queryObj);

  // Handle sorting by salary
  if (request.query.sort === "salary") {
    query = query.sort("salary.min");
  } else if (request.query.sort === "-salary") {
    query = query.sort("-salary.min");
  } else {
    // Handle other sorts or default sorting
    query = query.sort("-created_at"); // Default sort by created_at in descending order
  }

  // Handle field limiting
  if (request.query.fields) {
    const fields = request.query.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  // Handle pagination
  const page = parseInt(request.query.page, 10) || 1; // Default to page 1 if not provided
  const limit = parseInt(request.query.limit, 10) || 10; // Default to 10 results per page if not provided
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  // Execute the query
  const jobs = await query;

  // Get the total count of documents for pagination info
  const totalJobs = await Job.countDocuments(queryObj);

  // Respond with the results
  response.status(200).json({
    status: "success",
    results: jobs.length,
    total: totalJobs,
    page,
    totalPages: Math.ceil(totalJobs / limit),
    data: {
      jobs,
    },
  });
});

exports.getJob = catchAsync(async (request, response, next) => {
  const job = await Job.findById(request.params.id);
  if (!job) {
    return next(new AppError("No job found with that ID", 404));
  }
  response.status(200).json({
    status: "success",
    data: {
      job,
    },
  });
});
exports.createJob = catchAsync(async (request, response, next) => {
  const companyId = await Company.findOne({ created_by: request.user._id });
  request.body.posted_by = request.user._id;
  request.body.company = companyId._id;

  const newJob = await Job.create(request.body);

  response.status(201).json({
    status: "success",
    data: {
      job: newJob,
    },
  });
});
exports.updateJob = catchAsync(async (request, response, next) => {
  const job = await Job.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true,
  });
  if (!job) {
    return next(new AppError("No job found with that ID", 404));
  }
  response.status(200).json({
    status: "success",
    data: {
      job,
    },
  });
});
exports.deleteJob = catchAsync(async (request, response, next) => {
  const job = await Job.findByIdAndDelete(request.params.id);

  if (!job) {
    return next(new AppError("No job found with that ID", 404));
  }
  response.status(204).json({
    status: "success",
    data: null,
  });
});
