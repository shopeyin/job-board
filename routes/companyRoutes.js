const express = require("express");
const companyController = require("./../controllers/companyController");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .get(authController.protect, companyController.getAllCompanies)
  .post(
    authController.protect,
    authController.restrictTo("employer"),
    companyController.createCompany
  );

module.exports = router;
