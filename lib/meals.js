// ─── Meal Plans ─────────────────────────────────────────────────────────────
const prernaBasePlan = {
  Monday: {
    breakfast: { items: "2 eggs half fried (1tsp oil), 1 multigrain bread, 1 scoop whey + creatine shake" },
    lunch: { items: "50g moong dal tadka (1tsp ghee), 30g palak rice (dry rice cooked with spinach)" },
    dinner: { items: "150g chicken thighs curry (2tsp oil, onion-tomato gravy), 30g rice (dry), 100g airfried veggies (broccoli, zucchini, bell pepper)" },
  },
  Tuesday: {
    breakfast: { items: "2 eggs omelette with onion-capsicum (1tsp oil), 1 multigrain bread, 1 scoop whey + creatine shake" },
    lunch: { items: "80g chicken tikka (dry), 40g boiled chhole, thoda masala, pan mein saute (1tsp oil), 30g rice (dry)" },
    dinner: { items: "150g fish (rohu/basa) curry (2tsp oil, light gravy), 30g rice (dry), 100g airfried veggies (broccoli, mushroom, beans)" },
  },
  Wednesday: {
    breakfast: { items: "2 eggs bhurji (1tsp oil, onion, green chilli), 1 multigrain bread, 1 scoop whey + creatine shake" },
    lunch: { items: "50g rajma curry (2tsp oil, onion-tomato), 30g rice (dry), 50g raita" },
    dinner: { items: "150g prawns curry (2tsp oil, light coconut gravy), 30g rice (dry), 100g airfried veggies (capsicum, zucchini, carrot)" },
  },
  Thursday: {
    breakfast: { items: "2 eggs half fried (1tsp oil), 1 multigrain bread, 1 scoop whey + creatine shake" },
    lunch: { items: "50g boiled chhole, thoda masala saute karke (2tsp oil), 30g palak rice (dry rice cooked with spinach)" },
    dinner: { items: "150g paneer tikka (airfried, light oil), 1 palak roti, 100g airfried veggies (broccoli, mushroom, bell pepper)" },
  },
  Friday: {
    breakfast: { items: "2 eggs half fried (1tsp oil), 1 multigrain bread, 1 scoop whey + creatine shake" },
    lunch: { items: "100g grilled chicken strips, lettuce, arugula, cucumber, cherry tomato, 1tbsp olive oil dressing" },
    dinner: null, // eat out
  },
};

const mohitBasePlan = {
  Monday: {
    breakfast: { items: "2 eggs half fried (1tsp oil), 1 multigrain bread, 2 scoops whey + thoda milk + 1 banana" },
    lunch: { items: "50g moong dal tadka (1tsp ghee), 2 palak roti" },
    dinner: { items: "150g chicken thighs curry (2tsp oil, onion-tomato gravy), 2 roti, 100g airfried veggies (broccoli, zucchini, bell pepper)" },
  },
  Tuesday: {
    breakfast: { items: "2 eggs omelette with onion-capsicum (1tsp oil), 1 multigrain bread, 2 scoops whey + thoda milk + 1 banana" },
    lunch: { items: "80g chicken tikka (dry), 40g boiled chhole, thoda masala, pan mein saute (1tsp oil), 2 roti" },
    dinner: { items: "150g fish (rohu/basa) curry (2tsp oil, light gravy), 2 roti, 100g airfried veggies (broccoli, mushroom, beans)" },
  },
  Wednesday: {
    breakfast: { items: "2 eggs bhurji (1tsp oil, onion, green chilli), 1 multigrain bread, 2 scoops whey + thoda milk + 1 banana" },
    lunch: { items: "50g rajma curry (2tsp oil), 2 paratha (plain, 1tsp oil each), 50g raita" },
    dinner: { items: "150g prawns curry (2tsp oil, light coconut gravy), 2 roti, 100g airfried veggies (capsicum, zucchini, carrot)" },
  },
  Thursday: {
    breakfast: { items: "2 eggs half fried (1tsp oil), 1 multigrain bread, 2 scoops whey + thoda milk + 1 banana" },
    lunch: { items: "50g boiled chhole, thoda masala saute karke (2tsp oil), 2 palak paratha" },
    dinner: { items: "150g paneer tikka (airfried), 2 palak roti, 100g airfried veggies (broccoli, mushroom, bell pepper)" },
  },
  Friday: {
    breakfast: { items: "2 eggs half fried (1tsp oil), 1 multigrain bread, 2 scoops whey + thoda milk + 1 banana" },
    lunch: { items: "100g grilled chicken, lettuce, arugula, cucumber, tomato, 1tbsp olive oil dressing, 1 roti" },
    dinner: null, // eat out
  },
};

// ─── Hindi Helpers ──────────────────────────────────────────────────────────
function numToHindi(n) {
  const map = {
    0:"zero",1:"ek",2:"do",3:"teen",4:"chaar",5:"paanch",6:"chheh",7:"saat",8:"aath",
    9:"nau",10:"das",11:"gyarah",12:"baarah",15:"pandrah",20:"bees",25:"pacchees",
    30:"tees",40:"chaalis",50:"pachaas",60:"saath",70:"sattar",80:"assi",90:"nabbe",
    100:"sau",150:"dedh sau",200:"do sau",250:"dhaai sau",300:"teen sau",400:"chaar sau",500:"paanch sau",
  };
  if (map[n]) return map[n];
  if (n > 100 && n < 200) return "ek sau " + (map[n - 100] || (n - 100));
  if (n > 200 && n < 300) return "do sau " + (map[n - 200] || (n - 200));
  if (n > 300 && n < 400) return "teen sau " + (map[n - 300] || (n - 300));
  return String(n);
}

function extractGrams(text, keyword) {
  const re = new RegExp("(\\d+)g\\s+" + keyword, "i");
  const m = text.match(re);
  return m ? parseInt(m[1]) : 0;
}

function countItem(text, keyword) {
  const re = new RegExp("(\\d+)\\s+" + keyword, "i");
  const m = text.match(re);
  return m ? parseInt(m[1]) : 0;
}

// ─── Script Generators ──────────────────────────────────────────────────────
function generateMorningScript(day, prerna, mohit) {
  const lines = ["Noor, aaj subah aur dopahar ka khana:"];

  // BREAKFAST
  const pB = prerna.breakfast.items;
  const mB = mohit.breakfast.items;
  const pEggs = countItem(pB, "egg");
  const mEggs = countItem(mB, "egg");
  const totalEggs = pEggs + mEggs;
  const style = pB.includes("omelette") ? "omelette style" : pB.includes("bhurji") ? "bhurji style" : "half fried";

  lines.push("Nashta:");
  if (totalEggs > 0) {
    lines.push(`Total ${numToHindi(totalEggs)} ande banana hai, ${style}.`);
    lines.push(`${numToHindi(pEggs)} mere liye pack karna, ${numToHindi(mEggs)} bhaiya ke liye ghar pe rakhna.`);
  }
  if (pB.includes("bread")) lines.push("Dono ke liye ek ek bread bhi dena.");

  // LUNCH
  lines.push("");
  lines.push("Dopahar ka khana:");
  const pL = prerna.lunch.items;
  const mL = mohit.lunch.items;

  // Combine chicken
  const totalChick = extractGrams(pL, "chicken") + extractGrams(mL, "chicken");
  if (totalChick > 0) {
    const chickStyle = pL.includes("tikka") ? "tikka banana hai" : "banana hai, kam tel mein";
    lines.push(`${numToHindi(totalChick)} gram chicken ${chickStyle}.`);
  }

  // Combine chhole
  const totalChhole = extractGrams(pL, "chhole") + extractGrams(mL, "chhole") +
                      extractGrams(pL, "boiled chhole") + extractGrams(mL, "boiled chhole");
  if (totalChhole > 0) {
    lines.push(`${numToHindi(totalChhole)} gram chhole boil karke, thoda masala daal ke pan mein saute karna hai.`);
  }

  // Combine dal
  const totalDal = extractGrams(pL, "dal") + extractGrams(mL, "dal") +
                   extractGrams(pL, "moong dal") + extractGrams(mL, "moong dal");
  if (totalDal > 0) lines.push(`${numToHindi(totalDal)} gram dal ka tadka banana hai.`);

  // Combine rajma
  const totalRajma = extractGrams(pL, "rajma") + extractGrams(mL, "rajma");
  if (totalRajma > 0) lines.push(`${numToHindi(totalRajma)} gram rajma ki curry banana hai.`);

  // Carbs
  const pRice = extractGrams(pL, "rice") || extractGrams(pL, "palak rice");
  const mRice = extractGrams(mL, "rice") || extractGrams(mL, "palak rice");
  const pRoti = countItem(pL, "roti") || countItem(pL, "paratha");
  const mRoti = countItem(mL, "roti") || countItem(mL, "paratha");
  const pRiceType = pL.includes("palak rice") ? "palak chawal" : "chawal";
  const mRotiType = mL.includes("palak paratha") ? "palak paratha" : mL.includes("paratha") ? "paratha" : mL.includes("palak roti") ? "palak roti" : "roti";

  if (pRice > 0) lines.push(`${numToHindi(pRice)} gram ${pRiceType} mere liye.`);
  if (mRoti > 0) lines.push(`${numToHindi(mRoti)} ${mRotiType} bhaiya ke liye.`);
  if (mRice > 0 && mRoti === 0) lines.push(`${numToHindi(mRice)} gram chawal bhaiya ke liye.`);
  if (pRoti > 0 && pRice === 0) lines.push(`${numToHindi(pRoti)} roti mere liye.`);

  // Raita
  if (pL.includes("raita") || mL.includes("raita")) lines.push("Thoda raita bhi banana.");

  // Salad
  if (pL.includes("salad") || pL.includes("lettuce")) lines.push("Salad bhi ready rakhna mere liye.");

  lines.push("");
  lines.push("Mera lunch pack karna. Bhaiya ka ghar pe rakhna.");

  return lines.join("\n");
}

function generateEveningScript(day, prerna, mohit) {
  if (day === "Friday" || !prerna.dinner || !mohit.dinner) {
    return "Noor, aaj dinner bahar se hoga. Kuch banana nahi hai.";
  }

  const lines = ["Noor, aaj ka dinner:"];
  const pD = prerna.dinner.items;
  const mD = mohit.dinner.items;

  // Proteins
  const totalChick = extractGrams(pD, "chicken") + extractGrams(mD, "chicken");
  if (totalChick > 0) lines.push(`${numToHindi(totalChick)} gram chicken ki curry banani hai, kam tel mein.`);

  const totalFish = extractGrams(pD, "fish") + extractGrams(mD, "fish");
  if (totalFish > 0) lines.push(`${numToHindi(totalFish)} gram machhi ki curry banani hai, kam tel mein.`);

  const totalPrawn = extractGrams(pD, "prawn") + extractGrams(mD, "prawn") +
                     extractGrams(pD, "prawns") + extractGrams(mD, "prawns");
  if (totalPrawn > 0) lines.push(`${numToHindi(totalPrawn)} gram jhinga ki curry banani hai, halki gravy mein.`);

  const totalPaneer = extractGrams(pD, "paneer") + extractGrams(mD, "paneer");
  if (totalPaneer > 0) lines.push(`${numToHindi(totalPaneer)} gram paneer tikka air fry karna hai.`);

  // Veggies
  const totalVeg = extractGrams(pD, "veggies") + extractGrams(mD, "veggies") +
                   extractGrams(pD, "airfried veggies") + extractGrams(mD, "airfried veggies");
  if (totalVeg > 0) lines.push(`${numToHindi(totalVeg)} gram sabzi air fry karna hai.`);

  // Bharta
  if (pD.includes("bharta") || mD.includes("bharta")) lines.push("Baingan bharta bhi banana hai.");

  // Carbs — separate
  const pRice = extractGrams(pD, "rice");
  const mRice = extractGrams(mD, "rice");
  const pRoti = countItem(pD, "roti") || countItem(pD, "paratha");
  const mRoti = countItem(mD, "roti") || countItem(mD, "paratha");
  const pType = pD.includes("palak roti") ? "palak roti" : pD.includes("paratha") ? "paratha" : pD.includes("stuffed roti") ? "stuffed roti" : "roti";
  const mType = mD.includes("palak roti") ? "palak roti" : mD.includes("paratha") ? "paratha" : "roti";

  const carbParts = [];
  if (pRice > 0) carbParts.push(`${numToHindi(pRice)} gram chawal mere liye`);
  if (pRoti > 0 && pRice === 0) carbParts.push(`${numToHindi(pRoti)} ${pType} mere liye`);
  if (mRoti > 0) carbParts.push(`${numToHindi(mRoti)} ${mType} bhaiya ke liye`);
  if (mRice > 0 && mRoti === 0) carbParts.push(`${numToHindi(mRice)} gram chawal bhaiya ke liye`);
  if (carbParts.length > 0) lines.push(carbParts.join(", ") + ".");

  return lines.join("\n");
}

function getDayName() {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
}

module.exports = {
  prernaBasePlan,
  mohitBasePlan,
  generateMorningScript,
  generateEveningScript,
  getDayName,
};
