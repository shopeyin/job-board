const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const Company = require("./companyModel");

const workExperienceSchema = new mongoose.Schema({
  company: {
    type: String,
    // required: [true, "Please provide the company's name"],
  },
  title: {
    type: String,
    // required: [true, "Please provide your job title"],
  },
  startDate: {
    type: Date,
    // required: [true, "Please provide the start date"],
  },
  endDate: {
    type: Date,
  },
  current: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
  },
});

const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    // required: [true, "Please provide the name of the institution"],
  },
  degree: {
    type: String,
    // required: [true, "Please provide your degree"],
  },
  fieldOfStudy: {
    type: String,
  },
  startDate: {
    type: Date,
    // required: [true, "Please provide the start date"],
  },
  endDate: {
    type: Date,
  },
  current: {
    type: Boolean,
    default: false,
  },
});



const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name!"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    role: {
      type: String,
      enum: ["job_seeker", "employer", "admin"],
      default: "job_seeker",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    active: {
      type: Boolean,
      default: true,
      select: false,
    },

    resume: {
      type: String,
      // validate: {
      //   validator: function (val) {
      //     return val.length <= 5;
      //   },
      //   message: "You can upload a maximum of 5 resumes.",
      // },
    },

    skills: {
      type: [String],
      required: function () {
        return this.role === "job_seeker";
      },
    },
    workExperience: [workExperienceSchema],
    education: [educationSchema],

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("savedJobs", {
  ref: "SavedJob",
  foreignField: "user",
  localField: "_id",
});

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified, if the password is not modified return
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre("save", async function (next) {
  // Only run this function for new employers
  if (this.isNew && this.role === "employer") {
    try {
      const company = await Company.create({
        name: this.name, // Use user's name as the company name
        email: this.email, // Use user's email as the company email
        location: "Default Location", // Set a default location or use another method to provide this
        created_by: this._id, // Link the company to the user
      });

      // Update the user's company field with the created company ID
      this.company = company._id;
    } catch (error) {
      console.error("Error creating company:", error);
      return next(error); // Pass the error to the next middleware
    }
  }
  next();
});

// QUERY MIDDLEWARE
// userSchema.pre(/^find/, function (next) {
//   this.find({ active: true });
//   next();
// });

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
