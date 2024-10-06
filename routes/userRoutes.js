const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.route("/jobSeekers").get(userController.getAllJobSeekers);
router.route("/jobSeekers/:id").get(userController.getJobSeeker);

router
  .route("/:id/company")
  .get(authController.protect, userController.getUserWithCompany);

router.get("/me", authController.protect, userController.getMe);

router.get(
  "/user-stats",
  authController.protect,
  authController.restrictTo("admin"),
  userController.getUserStats
);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

router.patch(
  "/updateMe",
  authController.protect,
  userController.uploadResume,
  userController.updateMe
);

router.delete("/deleteMe", authController.protect, userController.deleteMe);

router
  .route("/")
  .get(authController.protect, userController.getAllUsers)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    userController.createUser
  );

router
  .route("/:id")
  .get(userController.getUser)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    userController.updateUser
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    userController.deleteUser
  );

module.exports = router;
