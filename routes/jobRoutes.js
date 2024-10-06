const express = require("express");
const jobController = require("./../controllers/jobController");
const authController = require("../controllers/authController");
const applicationRouter = require("../routes/applicationRoutes");

const router = express.Router({ mergeParams: true });

router.use("/:jobId/applications", applicationRouter);

router
  .route("/last-x-days")
  .get(jobController.lastXdays, jobController.getAllJobs);

router
  .route("/job-stats")
  .get(authController.protect, authController.restrictTo("admin"), jobController.getJobStatistics);
  
router
  .route("/active-job-stats")
  .get(authController.protect,authController.restrictTo("employer"), jobController.getActiveJobsByUser);

router
  .route("/")
  .get(jobController.getAllJobs)
  .post(
    authController.protect,
    authController.restrictTo("admin", "employer"),
    jobController.createJob
  );

router
  .route("/:id")
  .get(jobController.getJob)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "employer"),
    jobController.updateJob
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "employer"),
    jobController.deleteJob
  );

module.exports = router;
