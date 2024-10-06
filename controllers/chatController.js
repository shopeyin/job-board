const Chat = require("../models/ChatModel");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");

exports.chats = catchAsync(async (req, res, next) => {
  const { recipientId } = req.body;

  // Ensure the recipient exists and is either a job seeker
  const recipient = await User.findById(recipientId);

  if (!recipient || recipient.role !== "job_seeker") {
    return res.status(400).json({ message: "Invalid chat participants" });
  }

  // Ensure only employer can start a chat with a job seeker
  if (req.user.role !== "employer") {
    return res.status(403).json({ message: "Only employers can start a chat" });
  }

  // Check if a chat already exists between the participants
  let chat = await Chat.findOne({
    participants: { $all: [req.user._id, recipient._id] },
  });

  // If no chat exists, create a new one
  if (!chat) {
    chat = new Chat({
      participants: [req.user._id, recipient._id],
    });

    await chat.save();
    return res.status(201).json({ status: "success", data: chat });
  } else {
    return res.status(200).json({ status: "success", data: chat });
  }
});

exports.sendMessage = catchAsync(async (request, response, next) => {
  const chat = await Chat.findById(request.params.chatId).populate(
    "participants"
  );

  if (!chat || !chat.isBetweenJobSeekerAndEmployer()) {
    return response.status(403).json({ message: "Invalid chat participants" });
  }

  // Ensure the current user is a participant
  if (!chat.participants.some((p) => p._id.equals(request.user._id))) {
    return response
      .status(403)
      .json({ message: "You are not a participant of this chat" });
  }

  chat.messages.push({
    sender: request.user._id,
    content: request.body.content,
  });
  chat.lastMessageAt = Date.now();
  await chat.save();

  response.status(200).json(chat);
});

exports.fetchMessages = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId).populate(
      "participants",
      "name email"
    ); // Fetch participants info

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({
      status: "success",
      data: chat,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
