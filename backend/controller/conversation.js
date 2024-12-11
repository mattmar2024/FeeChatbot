const express = require("express");
const Conversation = require("../models/Conversation");
const router = express.Router();
const pdfParse = require("pdf-parse");
const fs = require("fs");
const multer = require("multer");
const OpenAI = require("openai");

const upload = multer({ dest: "uploads/" });
const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;

const OPEN_API_PARAMS = {};
let OPEN_API_MODEL = "gpt-4";

if (OPEN_AI_API_KEY) {
  OPEN_API_PARAMS.apiKey = OPEN_AI_API_KEY;
}

const openai = new OpenAI(OPEN_API_PARAMS);

router.post("/start-conversation", async (req, res) => {
  try {
    const conversation = await Conversation.create({
      // Add context for training the model
      messages: [
        // Add SES context
        {
          role: "system",
          content: fs.readFileSync("data/context.md", "utf-8"),
        },
        // Add fee persona
        {
          role: "system",
          content: `
           ${fs.readFileSync("data/fee-persona.md", "utf-8")}
           
           Internalize the context above for fee persona reviews
          `,
        },
        {
          role: "system",
          content:
            "Please respond in Markdown format for easy rendering on a user interface.",
        },
      ],
      uploads: [],
    });

    res.status(200).json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error initializing conversation" });
  }
});

router.get("/", async (req, res) => {
  try {
    const conversations = await Conversation.find(
      {},
      "id description createdAt updatedAt"
    ).sort({ updatedAt: "desc" });
    res.status(200).json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error fetching conversations" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).send("Conversation not found");
    }

    res.status(200).json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error fetching conversation" });
  }
});

router.post("/:id", async (req, res) => {
  const { message } = req.body;
  const { id } = req.params;

  try {
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).send("Conversation not found");
    }

    // Add the user's message to the conversation
    conversation.messages.push({ role: "user", content: message });

    // Fetch AI response
    const aiResponse = await fetchAIResponse(conversation.messages);
    conversation.messages.push({ role: "assistant", content: aiResponse });

    if (!conversation.description) {
      conversation.description = message
        .trim()
        .split(/\s+/)
        .slice(0, 3)
        .join(" ");
    }
    await conversation.save();

    res.status(200).json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error processing conversation" });
  }
});

router.post("/upload-context/:id", upload.single("file"), async (req, res) => {
  try {
    const { path } = req.file;
    const { id } = req.params;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).send("Conversation not found");
    }

    // Parse PDF content
    const pdfData = await pdfParse(fs.readFileSync(path));
    const content = pdfData.text;

    // Add the file and content as part of the conversation's context
    conversation.uploads.push({
      filename: req.file.originalname,
      filePath: path,
    });

    const prompt = `Provide SESMag review of this document from fee persona point of View .\n\nUploaded Document Content: ${content}`;
    if (!conversation.description) {
      conversation.description = content
        .trim()
        .split(/\s+/)
        .slice(0, 3)
        .join(" ");
    }
    // Fetch AI response
    const aiResponse = await fetchAIResponse([
      ...conversation.messages,
      { role: "user", content: prompt },
    ]);

    conversation.messages.push({ role: "user", content: prompt });
    conversation.messages.push({ role: "assistant", content: aiResponse });

    await conversation.save();

    res.status(200).json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message || "Error uploading context" });
  }
});

async function fetchAIResponse(messages) {
  try {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const completion = await openai.chat.completions.create({
      model: OPEN_API_MODEL,
      messages: formattedMessages,
    });
    return completion.choices[0]?.message?.content || "No response generated.";
  } catch (err) {
    console.error("Error with AI response:", err);
    return "I'm having trouble generating a response right now.";
  }
}

module.exports = { router };
