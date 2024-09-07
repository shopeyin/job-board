const express = require("express");
const companyController = require("./../controllers/companyController");
const authController = require("../controllers/authController");
const jobRouter = require("../routes/jobRoutes");
const router = express.Router();

router
  .route("/")
  .get(authController.protect, companyController.getAllCompanies)
  .post(
    authController.protect,
    authController.restrictTo("employer"),
    companyController.createCompany
  );

// router
//   .route("/:id/jobs")
//   .get(authController.protect, companyController.getJobsByCompany);

router.use('/:id/jobs', jobRouter)

router
  .route("/:id")
  .get(companyController.getCompany)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "employer"),
    companyController.updateCompany
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "employer"),
    companyController.deleteCompany
  );
module.exports = router;
