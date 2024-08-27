const Company = require("../models/companyModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllCompanies = catchAsync(async (request, response, next) => {
  const companies = await Company.find({});

  response.status(200).json({
    status: "success",
    data: {
      companies,
    },
  });
});

exports.createCompany = catchAsync(async (request, response, next) => {
  // Check if the user already has a company
  const existingCompany = await Company.findOne({
    created_by: request.user._id,
  });

  if (existingCompany) {
    return response
      .status(400)
      .json({ error: "You have already created a company." });
  }
  request.body.created_by = request.user._id;

  const newCompany = await Company.create(request.body);

  response.status(201).json({
    status: "success",
    data: {
      company: newCompany,
    },
  });
});
