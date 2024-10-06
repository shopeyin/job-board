const Company = require("../models/companyModel");
const Job = require("../models/jobModel");
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
  request.body.created_by = request.user._id;

  const newCompany = await Company.create(request.body);

  response.status(201).json({
    status: "success",
    data: {
      company: newCompany,
    },
  });
});

exports.getCompany = catchAsync(async (request, response, next) => {

  const company = await Company.findById(request.params.id).populate('created_by');

  if (!company) {
    return next(
      new AppError("No company found with that ID or created_by", 404)
    );
  }

  response.status(200).json({
    status: "success",
    data: {
      company,
    },
  });
});

// exports.getJobsByCompany = catchAsync(async (request, response, next) => {

//   const jobs = await Job.find({
//     company: request.params.id,
//     posted_by: request.user._id,
//   });
//   if (!jobs) {
//     return next(new AppError("No company found with that ID", 404));
//   }
//   response.status(200).json({
//     status: "success",
//     results:jobs.length,
//     data: {

//       jobs,
//     },
//   });
// });

exports.updateCompany = catchAsync(async (request, response, next) => {
  const company = await Company.findByIdAndUpdate(
    request.params.id,
    request.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!company) {
    return next(new AppError("No company found with that ID", 404));
  }
  response.status(200).json({
    status: "success",
    data: {
      company,
    },
  });
});

// exports.updateCompanyByCreatedBy = catchAsync(async (req, res) => {
//   const { created_by } = req.params;
//   const updatedData = req.body;

//   const company = await Company.findOneAndUpdate(
//     { created_by: created_by }, // Find the company by 'created_by'
//     updatedData, // Update with the new data
//     { new: true, runValidators: true } // Return the updated document and run validators
//   );

//   if (!company) {
//     return res.status(404).json({
//       status: "fail",
//       message: "Company not found",
//     });
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       company,
//     },
//   });
// });

exports.deleteCompany = catchAsync(async (request, response, next) => {
  const company = await Company.findByIdAndDelete(request.params.id);

  if (!company) {
    return next(new AppError("No company found with that ID", 404));
  }
  response.status(204).json({
    status: "success",
    data: null,
  });
});
