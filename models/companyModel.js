const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Company name is required"],
    minlength: [2, "Company name must be at least 2 characters long"],
    maxlength: [100, "Company name cannot exceed 100 characters"],
    unique: true,
  },
  location: {
    type: String,
    required: [true, "Location is required"],
  },
  logo: {
    type: String,
    default: "default.jpg",
  },
  website: {
    type: String,
    match: [/^https?:\/\/[^\s$.?#].[^\s]*$/, "Please enter a valid URL"],
    unique: true,
  },
  description: {
    type: String,
    minlength: [10, "Description must be at least 10 characters long"],
    maxlength: [500, "Description cannot exceed 500 characters"],
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Company must be associated with a user"],
    unique: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});
CompanySchema.index({ created_by: 1 }, { unique: true });

module.exports = mongoose.model("Company", CompanySchema);
