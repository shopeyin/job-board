const User = require("./../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (request, response, next) => {
  const users = await User.find();
  response.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

exports.getAllJobSeekers = catchAsync(async (request, response, next) => {
  const queryObj = { ...request.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);
  queryObj.role = "job_seeker";

  // if (queryObj.skills) {
  //   queryObj.skills = { $all: queryObj.skills.split(",") };
  // }

  if (queryObj.skills) {
    const skillsArray = queryObj.skills.split(",");
    queryObj.skills = {
      $elemMatch: {
        $in: skillsArray.map((skill) => new RegExp(skill, "i")), // Partial matching with regex for each skill
      },
    };
  }

  if (queryObj.education) {
    queryObj["education"] = {
      $elemMatch: { degree: { $regex: queryObj.education, $options: "i" } }, // Partial matching with regex
    };
  }

  if (queryObj.experience) {
    queryObj["workExperience"] = {
      $elemMatch: {
        title: { $regex: queryObj.experience, $options: "i" },
      }, // Partial matching with regex
    };

    delete queryObj.experience;
  }

  const jobSeekers = await User.find(queryObj).select("-__v");
  response.status(200).json({
    status: "success",
    results: jobSeekers.length,
    data: { jobSeekers },
  });
});
exports.getJobSeeker = catchAsync(async (request, response, next) => {
  const jobSeeker = await User.findOne({
    _id: request.params.id,
    role: "job_seeker",
  }).select("-__v");
  response.status(200).json({
    status: "success",

    data: { jobSeeker },
  });
});

exports.updateUser = (request, response) => {
  response.status(500).json({
    status: "error",
    message: "This route is not yet defined",
  });
};

exports.updateMe = catchAsync(async (request, response, next) => {
  // 1) Create error if user POSTs password data
  if (request.body.password || request.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  const filteredBody = filterObj(
    request.body,
    "name",
    "email",
    "skills",
    "workExperience",
    "education"
  ); // allowed fields;
  // if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document

 

  const updatedUser = await User.findByIdAndUpdate(
    request.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  ).select("-__v");

  response.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.getMe = catchAsync(async (request, response, next) => {
  let user = await User.findById(request.user.id);

  response.status(200).json({
    status: "success",
    data: user,
  });
});

exports.deleteMe = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });

  response.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getUser = catchAsync(async (request, response) => {
  const user = await User.findById(request.params.id).populate("savedJobs");
  if (!user) {
    return next(new AppError("No job found with that ID", 404));
  }
  response.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.createUser = (request, response) => {
  response.status(500).json({
    status: "error",

    message: "This route is not yet defined",
  });
};

exports.updateUser = (request, response) => {
  response.status(500).json({
    status: "error",
    message: "This route is not yet defined",
  });
};

exports.deleteUser = (request, response) => {
  response.status(500).json({
    status: "error",

    message: "This route is not yet defined",
  });
};
