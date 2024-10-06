const mongoose = require("mongoose");

// const chatSchema = new mongoose.Schema({
//   users: [
//     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   ],
//   latestMessage: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Message",
//     required: true,
//     },
//     lastMessageAt: { type: Date, default: Date.now },
    
// });


const chatSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true },
          timestamp: { type: Date, default: Date.now },
          isRead: { type: Boolean, default: false } // Has the recipient read the message?
    }
  ],
  lastMessageAt: { type: Date, default: Date.now }
});

chatSchema.methods.isBetweenJobSeekerAndEmployer = function() {
  return this.participants.length === 2 && this.participants.some(p => p.role === 'job_seeker') && this.participants.some(p => p.role === 'employer');
};

// const Chat = mongoose.model('Chat', chatSchema);
// module.exports = Chat;


// chatSchema.methods.isBetweenJobSeekerAndEmployer = function () {
//   return (
//     this.participants.length === 2 &&
//     this.participants.some((p) => p.role === "job_seeker") &&
//     this.participants.some((p) => p.role === "employer")
//   );
// };

module.exports = mongoose.model("Chat", chatSchema);
