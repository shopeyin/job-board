const mongoose = require("mongoose");

const SavedJobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  job: {
    type: mongoose.Schema.ObjectId,
    ref: "Job",
    required: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});


SavedJobSchema.pre(/^find/, function (next) {
  this.populate({
    path: "job",
    select: "-__v",
  });
  this.select("-__v");
  next();
});

module.exports = mongoose.model("SavedJob", SavedJobSchema);
