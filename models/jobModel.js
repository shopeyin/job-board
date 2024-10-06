const mongoose = require("mongoose");
const slugify = require("slugify");

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Job title is required"],
    minlength: [5, "Job title must be at least 5 characters long"],
    maxlength: [100, "Job title cannot exceed 100 characters"],
    trim: true,
  },
  slug: String,
  description: {
    type: String,
    required: [true, "Job description is required"],
    minlength: [20, "Job description must be at least 20 characters long"],
    trim: true,
  },
  requirements: {
    type: [String],
    validate: {
      validator: function (array) {
        return array.length > 0;
      },
      message: "At least one requirement must be provided",
    },
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: [true, "Company ID is required"],
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
  },
  industry: {
    type: String,
    required: [true, "Industry is required"],
    trim: true,
  },
  salary: {
    min: {
      type: Number,
      required: [true, "Minimum salary is required"],
      min: [0, "Minimum salary cannot be negative"],
    },
    max: {
      type: Number,
      required: [true, "Maximum salary is required"],
      min: [0, "Maximum salary cannot be negative"],
      validate: {
        validator: function (value) {
          return value >= this.salary.min;
        },
        message:
          "Maximum salary must be greater than or equal to the minimum salary",
      },
    },
  },
  work_arrangement: {
    type: String,
    required: [true, "Choose a working arrangement"],
    enum: {
      values: ["remote", "hybrid", "onsite"],
      message: "{VALUE} is not a working arrangement",
    },
  },
  contract_type: {
    type: String,
    enum: {
      values: ["Full-time", "Part-time", "Contract"],
      message: "{VALUE} is not a valid job type",
    },
    required: [true, "Contract type is required"],
  },
  posted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Posted by user ID is required"],
  },
  closing_date: {
    type: Date,
    required: [true, "Closing date is required"],
  },
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
});

// Pre-save middleware to create the slug with the first 4 characters of the ID
JobSchema.pre("save", function (next) {
  if (!this.slug) {
    const idPart = this._id.toString().slice(-5);
    this.slug = slugify(`${this.title}-${idPart}`, { lower: true });
  }

  // Check if the job has expired
  if (this.closing_date && new Date() > this.closing_date) {
    this.status = "closed";
  }

  next();
});

module.exports = mongoose.model("Job", JobSchema);
