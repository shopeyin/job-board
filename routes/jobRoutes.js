const express = require("express");
const jobController = require("./../controllers/jobController");

const router = express.Router();


router.route('/last-x-days').get(jobController.lastXdays, jobController.getAllJobs)

router.route("/")
  .get( jobController.getAllJobs)
  .post( jobController.createJob);

router
  .route("/:id")
  .get(jobController.getJob)
  .patch(jobController.updateJob)
  .delete(jobController.deleteJob);

module.exports = router;