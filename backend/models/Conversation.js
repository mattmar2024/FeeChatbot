const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  messages: [
    {
      role: {
        type: String,
        enum: ["user", "assistant", "system"],
        required: true,
      },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  uploads: [
    {
      filename: String,
      createdAt: { type: Date, default: Date.now },
      filePath: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  description: { type: String},
});

conversationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  next();
});

module.exports = mongoose.model("Conversation", conversationSchema);
