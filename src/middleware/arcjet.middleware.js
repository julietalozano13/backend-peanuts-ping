import arcjet, { shield, detectBot } from "@arcjet/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({
      allow: [
        "https://frontend-peanuts-ping.vercel.app"
      ],
    }),
    detectBot({
      mode: "LIVE",
    }),
  ],
});

export default aj;
