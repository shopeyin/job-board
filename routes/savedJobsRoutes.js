const express = require("express");
const savedJobsController = require("./../controllers/savedJobsControllers");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("job_seeker"),
    savedJobsController.getSavedJobs
  )
  .post(
    authController.protect,
    authController.restrictTo("job_seeker"),
    savedJobsController.saveJob
  );

router.delete(
  "/:jobId",
  authController.protect,
  savedJobsController.unsaveJob
);

module.exports = router;
