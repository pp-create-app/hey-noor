// /api/preview.js — Preview voice note scripts without sending
// Visit: https://your-app.vercel.app/api/preview?day=Tuesday&slot=morning

const { prernaBasePlan, mohitBasePlan, generateMorningScript, generateEveningScript } = require("../lib/meals");

module.exports = function handler(req, res) {
  const day = req.query.day || new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Kolkata" });
  const slot = req.query.slot || "morning";

  const prerna = prernaBasePlan[day];
  const mohit = mohitBasePlan[day];

  if (!prerna || !mohit) {
    return res.json({ error: `No plan for ${day}` });
  }

  let script;
  if (slot === "morning") {
    script = generateMorningScript(day, prerna, mohit);
  } else {
    script = generateEveningScript(day, prerna, mohit);
  }

  return res.json({
    day,
    slot,
    script,
    prernaMeals: {
      breakfast: prerna.breakfast?.items,
      lunch: prerna.lunch?.items,
      dinner: prerna.dinner?.items,
    },
    mohitMeals: {
      breakfast: mohit.breakfast?.items,
      lunch: mohit.lunch?.items,
      dinner: mohit.dinner?.items,
    },
  });
};
