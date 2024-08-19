const express = require("express");
const userController = require("./../controllers/userController");

const router = express.Router();

// Middleware to check the 'id' parameter
router.param("id", userController.checkID);

router
  .route("/")
  .get(userController.addRequestTime, userController.getAllUsers)
  .post(userController.checkBody, userController.createUser);

router
  .route("/:id")
  .get(userController.checkID, userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
