const express = require("express");
const applicationController = require("./../controllers/applicationController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/my-applications")
  .get(
    authController.protect,
    applicationController.getAllApplicationsByApplicant
  );

router
  .route("/:jobId")
  .get(authController.protect, applicationController.checkAppliedJob);

router
  .route("/")
  .get(authController.protect, applicationController.getAllApplicationsByJob)
  .post(
    authController.protect,
    authController.restrictTo("job_seeker"),
    applicationController.createJobApplication
  );

router
  .route("/:applicationId")
  .patch(authController.protect, applicationController.updateJobApplications);

module.exports = router;
