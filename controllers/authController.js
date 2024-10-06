const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");
const AppError = require("../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, response) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "None",
    secure: process.env.NODE_ENV === "production",
  };

  response.cookie("jwt", token, cookieOptions);

  // Convert user document to plain JavaScript object
  const userObj = user.toObject ? user.toObject() : { ...user };

  // Add the token to the plain user object
  userObj.token = token;

  // Remove password from output
  userObj.password = undefined;

  console.log(userObj); // Verify the structure of the user object

  response.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: userObj, // Send the modified user object
    },
  });
};

// const createSendToken = (user, statusCode, response) => {
//   const token = signToken(user._id);
//   const cookieOptions = {
//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000,
//     sameSite: "None",

//     secure: process.env.NODE_ENV === "production",
//   };

//   response.cookie("jwt", token, cookieOptions);

//   user.token = token;

//   // // Remove password from output
//   user.password = undefined;

//   response.status(statusCode).json({
//     status: "success",
//     token,
//     data: {
//       // token,
//       user,
//     },
//   });
// };

exports.signup = catchAsync(async (request, response, next) => {
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
    passwordChangedAt: request.body.passwordChangedAt,
    role: request.body.role,
  });

  createSendToken(newUser, 201, response);
});

exports.login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password"));
  }

  const user = await User.findOne({ email }).select("+password +active");
  // const user = await User.findOne({ email }).select('+password name _id role email');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (!user.active) {
    return response.status(403).json({
      status: "fail",
      message: "Your account is  deleted",
    });
  }

  createSendToken(user, 200, response);
  // const userData = {
  //   name: user.name,
  //   id: user._id,
  //   role: user.role,
  //   email: user.email,
  // };

  // createSendToken(userData, 200, response);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = catchAsync(async (request, response, next) => {
  console.log(request.cookies, "HERE");
  let token;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer")
  ) {
    token = request.headers.authorization.split(" ")[1];
  } else if (request.cookies.jwt) {
    token = request.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged In, please login to get access", 401)
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exist.", 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  //     if (this.passwordChangedAt) {
  //       const changedTimestamp = parseInt(
  //         this.passwordChangedAt.getTime() / 1000,
  //         10
  //       );

  //       return JWTTimestamp < changedTimestamp;
  //     }

  //     // False means NOT changed
  //     return false;
  //   };

  // GRANT ACCESS TO PROTECTED ROUTE
  request.user = currentUser;

  response.locals.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'employer', 'job_seeker']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (request, response, next) => {
  const user = await User.findOne({ email: request.body.email });
  if (!user) {
    return next(new AppError("No user with this email address", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateModifiedOnly: true });

  // const resetURL = `${request.protocol}://${request.get(
  //   "host"
  // )}/api/v1/users/resetPassword/${resetToken}`;
  const resetURL = `http://localhost:3000/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a request with your new password and confirm to:${resetURL}.\n. If did not forget your password, please ignore this email`;
  // console.log(message, 'MESSAGE');
  // console.log(resetURL, 'reset url');
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message,
    });

    response.status(200).json({
      status: "success",
      message: "Token sent to the email",
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateModifiedOnly: true });

    return next(
      new AppError("There was an error sending the email. Try again later"),
      500
    );
  }
});


exports.resetPassword = async (request, response, next) => {
  // 1. Hash the token from the request
  const hashedToken = crypto
    .createHash("sha256")
    .update(request.params.token)
    .digest("hex");

  // 2. Find the user based on the hashed token and check expiration
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });

  // 3. If no user found, return an error
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // 4. Check if the passwords match
  if (request.body.password !== request.body.passwordConfirm) {
    return next(new AppError("Passwords do not match", 400));
  }

  // 5. Update user password and clear reset token
  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm; // If you have a pre-save hook, you may not need this
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // 6. Save the updated user
  await user.save();

  // 7. Send token back to the user
  createSendToken(user, 200, response);
};

exports.updatePassword = catchAsync(async (request, response, next) => {
  const user = await User.findById(request.user.id).select("+password");

  if (
    !(await user.correctPassword(request.body.passwordCurrent, user.password))
  ) {
    return next(new AppError("Your current password is wrong", 401));
  }

  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;

  await user.save();

  createSendToken(user, 200, response);
});
