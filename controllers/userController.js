const User = require("./../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadResume = upload.single("resumes");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (request, response, next) => {
  const users = await User.find().select("+active");
  response.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

exports.getUserWithCompany = catchAsync(async (request, response, next) => {
  const user = await User.findById(request.params.id).populate("company");
  console.log(user);
  response.status(200).json({
    status: "success",
    data: { user },
  });
});

// exports.getAllJobSeekers = catchAsync(async (request, response, next) => {
//   const queryObj = { ...request.query };
//   const excludedFields = ["page", "sort", "limit", "fields"];
//   excludedFields.forEach((el) => delete queryObj[el]);
//   queryObj.role = "job_seeker";

//   if (queryObj.skills) {
//     const skillsArray = queryObj.skills.split(",");
//     queryObj.skills = {
//       $elemMatch: {
//         $in: skillsArray.map((skill) => new RegExp(skill, "i")), // Partial matching with regex for each skill
//       },
//     };
//   }

//   if (queryObj.education) {
//     queryObj["education"] = {
//       $elemMatch: { degree: { $regex: queryObj.education, $options: "i" } }, // Partial matching with regex
//     };
//   }

//   if (queryObj.experience) {
//     queryObj["workExperience"] = {
//       $elemMatch: {
//         title: { $regex: queryObj.experience, $options: "i" },
//       }, // Partial matching with regex
//     };

//     delete queryObj.experience;
//   }

//   const jobSeekers = await User.find(queryObj).select("-__v");
//   response.status(200).json({
//     status: "success",
//     results: jobSeekers.length,
//     data: { jobSeekers },
//   });
// });

exports.getAllJobSeekers = catchAsync(async (request, response, next) => {
  const { search } = request.query;
  const queryObj = { role: "job_seeker" };

  // If a search term is provided, search across skills, education, and experience
  if (search) {
    const searchRegex = new RegExp(search, "i"); // Case-insensitive search

    queryObj.$or = [
      {
        skills: {
          $elemMatch: {
            $in: [searchRegex], // Search term in skills array
          },
        },
      },
      {
        education: {
          $elemMatch: { degree: { $regex: searchRegex } }, // Search term in education degree
        },
      },
      {
        workExperience: {
          $elemMatch: { title: { $regex: searchRegex } }, // Search term in work experience title
        },
      },
    ];
  }

  const page = parseInt(request.query.page, 10) || 1;
  const limit = parseInt(request.query.limit, 10) || 5;
  const skip = (page - 1) * limit;

  const jobSeekers = await User.find(queryObj)
    .select("-__v")
    .skip(skip)
    .limit(limit);
  
  console.log(jobSeekers,'-----')

  const totalDocuments = await User.countDocuments(queryObj);

  response.status(200).json({
    'datahere':'datahere',
    status: "success",
    results: jobSeekers.length,
    totalDocuments,
    page,
    totalPages: Math.ceil(totalDocuments / limit),
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

  // console.log(request.body);
  // console.log(request.file);
  const filteredBody = filterObj(
    request.body,
    "name",
    "email",
    "skills",
    "workExperience",
    "education",
    "resumes"
  ); // allowed fields;

  if (request.file) {
    
    const resume = {
      name: request.file.originalname, 
      data: request.file.buffer,
      contentType: request.file.mimetype, 
    };

    filteredBody.resumes = resume;
  }
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

exports.createUser = catchAsync(async (request, response) => {
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
    passwordChangedAt: request.body.passwordChangedAt,
    role: request.body.role,
  });
  response.status(201).json({
    status: "success",
    data: {
      newUser,
    },
  });
});

// Update User
exports.updateUser = catchAsync(async (req, res) => {
  // Convert 'active' field from string to boolean
  const activeStatus = req.body.active === "true";

  // Find and update the user
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      role: req.body.role,
      name: req.body.name,
      active: activeStatus, // Ensure 'active' is updated if provided
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "No user found with that ID",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// Delete User
exports.deleteUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "No user found with that ID",
    });
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getUserStats = catchAsync(async (request, response) => {
  const stats = await User.aggregate([
    {
      $facet: {
        totalUsers: [
          {
            $count: "total",
          },
        ],
        roleStats: [
          {
            $group: {
              _id: "$role",
              count: { $sum: 1 },
            },
          },
        ],
        activeUsers: [
          {
            $match: { active: true },
          },
          {
            $count: "activeCount",
          },
        ],
      },
    },
  ]);

  response.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});
