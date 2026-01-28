import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
import { ENV } from "./env.js";

const aj = arcjet({
  key: ENV.ARCJET_KEY,

  rules: [
    shield({
      mode: "LIVE",
    }),

    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:KNOWN_BROWSER", 
      ],
    }),

    slidingWindow({
      mode: "LIVE",
      max: 200,     
      interval: 60,
    }),
  ],
});

export default aj;
