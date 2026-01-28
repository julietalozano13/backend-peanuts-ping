import aj from "../lib/arcjet.js";

export const arcjetProtection = async (req, res, next) => {

  if (req.method === "OPTIONS") {
    return next();
  }

  if (req.path.startsWith("/api/auth")) {
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
    console.error("Arcjet error:", error);
    next();
  }
};
