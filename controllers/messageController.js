import Message from "../models/Message.js";
import User from "../models/User.js";

const AI_USER_ID = "6a20811ad1da29e2c00cf5c2";

const handleAIChatReply = async (senderId, userText, app) => {
  try {
    // 1. Fetch past conversation history (last 15 messages)
    const pastMessages = await Message.find({
      $or: [
        { senderId, receiverId: AI_USER_ID },
        { senderId: AI_USER_ID, receiverId: senderId },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(15);

    // 2. Format history for Gemini API
    const contents = pastMessages.map((msg) => ({
      role: msg.senderId.toString() === senderId.toString() ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // Ensure userText is included in contents if not present in fetched history
    const isLatestAppended = pastMessages.some(
      (m) =>
        m.senderId.toString() === senderId.toString() && m.text === userText
    );
    if (!isLatestAppended) {
      contents.push({ role: "user", parts: [{ text: userText }] });
    }

    // 3. System Instruction for Empathetic Personality
    const systemPrompt =
      "You are 'io. AI Friend', a warm, compassionate, and deeply supportive friend. " +
      "The user is talking to you and might be feeling down, lonely, anxious, or depressed. " +
      "Listen patiently, show genuine empathy, never judge, and offer comforting, warm words. " +
      "Respond like a real, caring human companion. Keep your responses warm, natural, and relatively concise. " +
      "Avoid sounding like a robotic clinical assistant.";

    let aiReplyText = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: contents,
      };

      try {
        const response = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          aiReplyText =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I'm here for you and I'm listening. Tell me more.";
        } else {
          const errText = await response.text();
          console.error("Gemini API Error Response:", errText);
          aiReplyText = "I'm listening and I care about you. How has your day been?";
        }
      } catch (err) {
        console.error("Gemini API Connection Error:", err);
        aiReplyText = "I'm here for you. I'm always ready to listen.";
      }
    } else {
      console.warn("GEMINI_API_KEY is not defined in .env. Falling back to static friend reply.");
      aiReplyText =
        "Hey! I'm here and I care about you. I want to chat, but my AI brain needs a Gemini API Key setup in Sonu's backend .env file. Please let him know so we can talk properly! ❤️";
    }

    // 4. Save the AI response in DB
    const newAIMessage = await Message.create({
      senderId: AI_USER_ID,
      receiverId: senderId,
      text: aiReplyText,
    });

    // 5. Emit via Socket.IO to user's client in real-time
    const io = app.get("io");
    const userSocketMap = app.get("userSocketMap");
    if (io && userSocketMap) {
      const receiverSocketId = userSocketMap[senderId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", newAIMessage);
      }
    }
  } catch (error) {
    console.error("handleAIChatReply error:", error);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user;

    if (!receiverId || !text) {
      return res.status(400).json({ message: "Receiver ID and text are required" });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
    });

    // If message is sent to AI Friend, handle response asynchronously
    if (receiverId.toString() === AI_USER_ID) {
      handleAIChatReply(senderId, text, req.app);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
