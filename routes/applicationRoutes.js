const express = require("express");
const applicationController = require("./../controllers/applicationController");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .get(authController.protect,  applicationController.getAllJobsApplications)
  .post(
    authController.protect,
    authController.restrictTo("job_seeker"),
    applicationController.createJobApplication
);
  
router
  .route("/:jobId")
  .get(authController.protect,applicationController.getAllJobsApplications)
   .patch(authController.protect,applicationController.updateJobApplications)
//   .delete(
//     authController.protect,
//     authController.restrictTo("admin", "employer"),
//     jobController.deleteJob
//   );

module.exports = router;
