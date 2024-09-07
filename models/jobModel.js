const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

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
    required: [true, "choose a working arrangement"],
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

  created_at: {
    type: Date,
    default: Date.now(),
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
});


// JobSchema.index({ title: 'text', description: 'text', requirements: 'text' });

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
JobSchema.pre('save', function(next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});


module.exports = mongoose.model("Job", JobSchema);
