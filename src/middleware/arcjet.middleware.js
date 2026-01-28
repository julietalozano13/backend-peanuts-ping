import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ message: "Rate limit exceeded." });
      }

      return res.status(403).json({
        message: "Access denied by security policy.",
      });
    }

    next();
  } catch (error) {
    console.log("Arcjet Protection Error:", error);
    next();
  }
};
