import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const getAllContacts = async (req, res) => {
  console.log("➡️ [GET ALL CONTACTS] Request received");

  try {
    const loggedInUserId = req.user._id;
    console.log("👤 [GET ALL CONTACTS] Logged user:", loggedInUserId.toString());

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    console.log("✅ [GET ALL CONTACTS] Users found:", filteredUsers.length);
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("❌ [GET ALL CONTACTS] Error");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    res.status(500).json({
      message: "Internal server error",
      debug: error.message,
    });
  }
};

export const getMessagesByUserId = async (req, res) => {
  console.log("➡️ [GET MESSAGES] Request received");

  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    console.log("👤 [GET MESSAGES] My ID:", myId.toString());
    console.log("👥 [GET MESSAGES] Chat with:", userToChatId);

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    console.log("✅ [GET MESSAGES] Messages count:", messages.length);
    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ [GET MESSAGES] Error");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    res.status(500).json({
      message: "Internal server error",
      debug: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  console.log("➡️ [SEND MESSAGE] Request received");

  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    console.log("📦 [SEND MESSAGE] Payload:", {
      hasText: !!text,
      hasImage: !!image,
      senderId: senderId.toString(),
      receiverId,
    });

    if (!text && !image) {
      console.warn("⚠️ [SEND MESSAGE] Missing text and image");
      return res.status(400).json({ message: "Text or image is required." });
    }

    if (senderId.equals(receiverId)) {
      console.warn("⚠️ [SEND MESSAGE] Sender equals receiver");
      return res
        .status(400)
        .json({ message: "Cannot send messages to yourself." });
    }

    console.log("🔍 [SEND MESSAGE] Checking receiver existence");
    const receiverExists = await User.exists({ _id: receiverId });

    if (!receiverExists) {
      console.warn("⚠️ [SEND MESSAGE] Receiver not found");
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      console.log("☁️ [SEND MESSAGE] Uploading image to Cloudinary");
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
      console.log("✅ [SEND MESSAGE] Image uploaded");
    }

    console.log("💾 [SEND MESSAGE] Saving message");
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();
    console.log("✅ [SEND MESSAGE] Message saved:", newMessage._id.toString());

    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log(
      "🔌 [SEND MESSAGE] Receiver socket:",
      receiverSocketId || "offline"
    );

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      console.log("📡 [SEND MESSAGE] Message emitted via socket");
    }

    res.status(201).json(newMessage);
    console.log("📤 [SEND MESSAGE] Response sent");
  } catch (error) {
    console.error("❌ [SEND MESSAGE] Error");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    res.status(500).json({
      message: "Internal server error",
      debug: error.message,
    });
  }
};

export const getChatPartners = async (req, res) => {
  console.log("➡️ [GET CHAT PARTNERS] Request received");

  try {
    const loggedInUserId = req.user._id;
    console.log(
      "👤 [GET CHAT PARTNERS] Logged user:",
      loggedInUserId.toString()
    );

    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId },
        { receiverId: loggedInUserId },
      ],
    });

    console.log(
      "📨 [GET CHAT PARTNERS] Messages scanned:",
      messages.length
    );

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    console.log(
      "👥 [GET CHAT PARTNERS] Unique partners:",
      chatPartnerIds.length
    );

    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select("-password");

    console.log(
      "✅ [GET CHAT PARTNERS] Users found:",
      chatPartners.length
    );

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("❌ [GET CHAT PARTNERS] Error");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    res.status(500).json({
      message: "Internal server error",
      debug: error.message,
    });
  }
};
