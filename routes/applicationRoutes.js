const express = require("express");
const applicationController = require("./../controllers/applicationController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(authController.protect, applicationController.getAllJobsApplications)
  .post(
    authController.protect,
    authController.restrictTo("job_seeker"),
    applicationController.createJobApplication
  );

router
  .route("/:applicationId")
  .patch(authController.protect, applicationController.updateJobApplications);

module.exports = router;
