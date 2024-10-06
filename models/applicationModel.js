const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: [true, "Job ID is required"],
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Applicant ID is required"],
  },

  resume: {
    type: String,
    required: [true, "Resume is required"],
    trim: true,
  },
  cover_letter: {
    type: String,
    required: [true, "Cover letter is required"],
    minlength: [50, "Cover letter must be at least 50 characters long"],
    maxlength: [2000, "Cover letter cannot exceed 2000 characters"],
  },
  status: {
    type: String,
    enum: ["applied", "under_review", "rejected", "accepted"],
    default: "applied",
  },
  applied_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model("Application", ApplicationSchema);
