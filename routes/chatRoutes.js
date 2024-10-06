const express = require("express");
const authController = require("../controllers/authController");
const chatController = require("../controllers/chatController");
const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("employer"),
    chatController.chats
  );

router.route("/:chatId").get(chatController.fetchMessages);

router
  .route("/:chatId/message")
  .post(
    authController.protect,
    authController.restrictTo("job_seeker", "employer"),
    chatController.sendMessage
  );

module.exports = router;
