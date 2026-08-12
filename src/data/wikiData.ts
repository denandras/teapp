// ── Wiki data structures ──────────────────────────────────────────────

export interface WikiParamCard {
  icon: string; // lucide icon name
  label: string;
  value: string;
}

export interface WikiEntry {
  slug: string;
  name: string;
  original_name?: string;       // Chinese / Japanese / native script
  romaji?: string;              // romanization (pinyin / romaji)
  description: string;
  params?: WikiParamCard[];     // key-value parameter cards
  sections?: WikiSection[];      // longer-form content sections
  steps?: string[];              // step-by-step instructions
  tips?: string[];              // beginner tips
  best_for?: string[];           // recommended tea types / use cases
  icon: string;                  // lucide icon name for the tab
}

export interface WikiSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface WikiCategory {
  slug: string;
  name: string;
  description: string;
  icon: string;                  // lucide icon name
  entries: WikiEntry[];
}

// ── Brewing Styles (re-imported & enriched from brewingStyles.ts) ────

export const BREWING_CATEGORY: WikiCategory = {
  slug: "brewing",
  name: "Brewing Styles",
  description:
    "Learn different tea brewing methods — from gongfu to cold brew. Find the technique that suits your tea and mood.",
  icon: "Coffee",
  entries: [
    {
      slug: "gongfu",
      name: "Gongfu Cha",
      original_name: "功夫茶",
      romaji: "gōngfu chá",
      description:
        "Gongfu cha (literally 'skill/effort tea') uses a high leaf-to-water ratio with short, repeated infusions in a small vessel. Each infusion reveals a different layer of flavor, making it the preferred method for appreciating fine oolong, pu-erh, and white teas.",
      params: [
        { icon: "Scale", label: "Leaf-to-Water", value: "1g leaf per 15–20ml water (approx. 5–8g for a 100–150ml pot)" },
        { icon: "Thermometer", label: "Water Temp", value: "85–100°C (varies by tea type)" },
        { icon: "Clock", label: "Steep Time", value: "5–30 seconds per infusion, increasing gradually" },
        { icon: "Repeat", label: "Infusions", value: "5–10+ infusions (depends on tea type and quality)" },
        { icon: "CupSoda", label: "Vessel", value: "Gaiwan (蓋碗) or small Yixing clay teapot, 100–150ml" },
      ],
      steps: [
        "Warm the vessel: Pour boiling water into the gaiwan/teapot, swirl, then discard. This preheats the vessel for better extraction.",
        "Add leaves: Place 5–8g of tea into the warmed gaiwan (roughly 1/3 to 1/2 full for rolled oolongs, less for flat leaves).",
        "Rinse (optional): Pour hot water over the leaves and immediately discard. This 'awakens' the leaves and removes dust. Not needed for green or white teas.",
        "First infusion: Fill with water at the appropriate temperature. Steep for 5–10 seconds, then pour completely into a fairness pitcher (gongdao bei) or directly into cups.",
        "Serve: Pour from the fairness pitcher into tasting cups. Smell the aroma, observe the liquor color, then sip slowly.",
        "Subsequent infusions: Increase steep time by 2–5 seconds per round. The first 2–3 infusions are often the most aromatic; later infusions bring out sweetness and depth.",
        "Enjoy: Continue until the leaves are exhausted (flavor drops off significantly). Quality teas can yield 8–10+ rewarding infusions.",
      ],
      tips: [
        "Water temperature matters: use 100°C for pu-erh and dark oolong, 90–95°C for roasted oolong, 85–90°C for green oolong and white tea, 75–80°C for green tea.",
        "Always decant completely — never leave water sitting on the leaves between infusions, or the tea will become bitter.",
        "Use good water: filtered or spring water with low mineral content brings out the best flavor.",
      ],
      best_for: ["Oolong", "Pu-erh", "White tea", "High-quality black tea"],
      icon: "Award",
    },
    {
      slug: "western",
      name: "Western Style",
      original_name: "西式泡法",
      romaji: "xīshì pàofǎ",
      description:
        "The Western method uses a lower leaf-to-water ratio with longer steep times in a larger vessel. It produces a single, larger portion — ideal for casual drinking, tea bags, or serving multiple people.",
      params: [
        { icon: "Scale", label: "Leaf-to-Water", value: "1g leaf per 100ml water (approx. 2–3g or 1 tea bag per 200–300ml cup)" },
        { icon: "Thermometer", label: "Water Temp", value: "75–100°C (varies by tea type)" },
        { icon: "Clock", label: "Steep Time", value: "2–5 minutes (single infusion)" },
        { icon: "Repeat", label: "Infusions", value: "1–2 infusions (second brew is much lighter)" },
        { icon: "CupSoda", label: "Vessel", value: "Large teapot, mug, or tea cup (200–400ml)" },
      ],
      steps: [
        "Heat water to the appropriate temperature for your tea type.",
        "Place 2–3g of loose leaf tea (or one tea bag) into your teapot or mug.",
        "Pour hot water over the leaves and let steep for 2–5 minutes depending on tea type.",
        "Remove the leaves (or tea bag) to stop extraction and prevent bitterness.",
        "Optional: add milk, sugar, lemon, or honey to taste.",
        "If using loose leaf tea, you may get a second, lighter brew by steeping 1–2 minutes longer.",
      ],
      tips: [
        "Green and white teas: 75–85°C, 2–3 minutes. Too hot or too long = bitter.",
        "Black and dark teas: 95–100°C, 3–5 minutes. Can handle milk and sugar.",
        "Use a tea strainer or infuser basket to give leaves room to expand.",
      ],
      best_for: ["Black tea", "Herbal/Tisane", "Everyday drinking", "Tea bags"],
      icon: "Coffee",
    },
    {
      slug: "grandpa",
      name: "Grandpa Style",
      original_name: "爷爷泡法",
      romaji: "yéye pàofǎ",
      description:
        "Grandpa style is the simplest brewing method: leaves go directly in a glass or mug, hot water is added, and you drink as the leaves slowly settle. No strainer, no special equipment — just a glass and leaves.",
      params: [
        { icon: "Scale", label: "Leaf-to-Water", value: "1–2g leaf per 200–300ml water (a small pinch)" },
        { icon: "Thermometer", label: "Water Temp", value: "75–95°C (let boiling water cool slightly for green tea)" },
        { icon: "Clock", label: "Steep Time", value: "Continuous — drink as it steeps" },
        { icon: "Repeat", label: "Refills", value: "Refill with hot water as the mug empties (3–5 refills)" },
        { icon: "CupSoda", label: "Vessel", value: "Glass or mug (250–350ml)" },
      ],
      steps: [
        "Place a small pinch of tea leaves (1–2g) directly into a glass or mug.",
        "Pour hot water over the leaves. For green tea, let the water cool to about 80°C first.",
        "Watch the leaves dance and slowly sink — this is part of the charm.",
        "Drink directly from the glass, letting the leaves settle to the bottom. Sip carefully to avoid swallowing leaves.",
        "When the water runs low (about 1/3 remaining), refill with hot water. The tea will keep going for several refills.",
        "Stop when the flavor is exhausted. Discard the leaves.",
      ],
      tips: [
        "Best with whole-leaf teas — broken leaves and fannings will float and get in your mouth.",
        "Green tea works beautifully: the glass lets you watch the leaves unfurl.",
        "Keep refilling before the glass empties completely to maintain a consistent strength.",
      ],
      best_for: ["Green tea", "White tea", "Casual/everyday drinking", "Office or work"],
      icon: "GlassWater",
    },
    {
      slug: "cold-brew",
      name: "Cold Brew",
      original_name: "冷泡",
      romaji: "lěng pào",
      description:
        "Cold brewing steeps tea leaves in cold or room-temperature water for several hours to overnight. The slow, gentle extraction produces a naturally sweet, smooth, low-astringency tea with almost no bitterness — perfect for summer.",
      params: [
        { icon: "Scale", label: "Leaf-to-Water", value: "1g leaf per 100ml water (approx. 5–10g per liter)" },
        { icon: "Thermometer", label: "Water Temp", value: "Cold or room temperature (4–25°C)" },
        { icon: "Clock", label: "Steep Time", value: "6–12 hours in the fridge, or 2–4 hours at room temperature" },
        { icon: "Repeat", label: "Infusions", value: "1 infusion (spent leaves can be hot-brewed once more after)" },
        { icon: "CupSoda", label: "Vessel", value: "Pitcher, jar, or bottle (500ml–1L), refrigerated" },
      ],
      steps: [
        "Place 5–10g of tea leaves in a clean pitcher or jar.",
        "Add 1 liter of cold, filtered water.",
        "Cover and refrigerate for 8–12 hours (or leave at room temperature for 2–4 hours for a quicker brew).",
        "Strain out the leaves after the steeping period.",
        "Serve over ice. The tea will keep in the fridge for 2–3 days.",
        "Optional: add fruit, mint, or a slice of lemon for a refreshing twist.",
      ],
      tips: [
        "Green tea and white tea cold brew exceptionally well — the low temperature brings out sweetness without bitterness.",
        "Use 1.5–2x the hot-brew ratio — cold extraction is less efficient.",
        "Cold brew is much lower in caffeine and tannins than hot-brewed tea, making it gentler on the stomach.",
      ],
      best_for: ["Green tea", "White tea", "Oolong", "Summer refreshment"],
      icon: "Snowflake",
    },
    {
      slug: "boiled",
      name: "Boiled Tea",
      original_name: "煮茶",
      romaji: "zhǔ chá",
      description:
        "Boiling tea (zhǔ chá) is the oldest brewing method — leaves are simmered in water over heat, producing a rich, full-bodied brew. It's the traditional way to prepare pu-erh and dark teas.",
      params: [
        { icon: "Scale", label: "Leaf-to-Water", value: "1g leaf per 100–150ml water (approx. 5–8g per 500–800ml)" },
        { icon: "Thermometer", label: "Water Temp", value: "100°C (rolling boil)" },
        { icon: "Clock", label: "Boil Time", value: "3–10 minutes at a gentle simmer" },
        { icon: "Repeat", label: "Re-boils", value: "2–3 rounds (add water and re-boil)" },
        { icon: "CupSoda", label: "Vessel", value: "Clay or glass stovetop pot, tetsubin (iron kettle)" },
      ],
      steps: [
        "Bring water to a rolling boil in a stovetop-safe pot.",
        "Add tea leaves (5–8g for a 500–800ml pot). Reduce heat to a gentle simmer.",
        "Simmer for 3–10 minutes depending on tea type and desired strength.",
        "Pour into cups or a thermos. The tea stays hot and can be re-boiled with more water.",
        "For subsequent rounds, add water and simmer again — the tea will keep giving for 2–3 re-boils.",
        "Optional (Tibetan style): add a pinch of salt and a knob of butter for a traditional butter tea (sujia cha / 酥油茶).",
      ],
      tips: [
        "Best for pu-erh (especially ripe/shou), dark tea (heicha), and aged teas — their robust flavors withstand boiling.",
        "Don't boil green or white tea — the delicate leaves will turn bitter and lose their subtlety.",
        "Use a low flame after the initial boil — a rolling boil will reduce the water too quickly.",
      ],
      best_for: ["Pu-erh (shou)", "Dark tea (heicha)", "Aged teas", "Winter warmth"],
      icon: "Flame",
    },
  ],
};

// ── Pouring Techniques ──────────────────────────────────────────────

export const POURING_CATEGORY: WikiCategory = {
  slug: "pouring",
  name: "Pouring Styles",
  description:
    "How you pour water into your gaiwan or teapot is not just aesthetics — height, angle, and force shape the tea's flavor. Each technique highlights different aspects of the leaf.",
  icon: "Droplets",
  entries: [
    {
      slug: "high-fixed",
      name: "High Pouring at a Fixed Point",
      original_name: "高冲定点",
      romaji: "gāo chōng dìngdiǎn",
      description:
        "Pouring from a height (about 1.5× the gaiwan's height) onto a fixed point at the bottom. The increased impact force enhances oxygenation and creates a vortex that stirs the leaves, elevating aroma and freshness.",
      params: [
        { icon: "MoveVertical", label: "Height", value: "≈1.5× the gaiwan height" },
        { icon: "Compass", label: "Position", value: "7:30 o'clock, fixed point at the bottom" },
        { icon: "Zap", label: "Force", value: "Fast yet gentle; can be thick or thin stream" },
      ],
      tips: [
        "Best for high-aroma teas: ball-shaped oolongs (Tieguanyin), bud-shaped black teas.",
        "The vortex action 'wakes up' the leaves and releases aromatic compounds quickly.",
        "Don't pour too aggressively — the stream should be fast but not splashing.",
      ],
      best_for: ["Ball-shaped oolong", "Bud-shaped black tea", "High-aroma teas"],
      icon: "MoveVertical",
    },
    {
      slug: "low-fixed",
      name: "Low Pouring at a Fixed Point",
      original_name: "低斟定点",
      romaji: "dī zhēn dìngdiǎn",
      description:
        "Pouring from just 2–3cm above the gaiwan at a fixed point. The low height and gentle flow create a delicate, smooth, and mellow mouthfeel — ideal for teas whose internal structure has settled with age.",
      params: [
        { icon: "MoveVertical", label: "Height", value: "2–3cm above the gaiwan" },
        { icon: "Compass", label: "Position", value: "7:30 o'clock, fixed point" },
        { icon: "Feather", label: "Force", value: "Light, slow, and gentle" },
      ],
      tips: [
        "Best for aged teas: old oolong, raw (sheng) and ripe (shou) pu-erh.",
        "The gentle pour coaxes out depth and sweetness without harshness.",
        "Patience is key — a slow, steady stream gives the most mellow result.",
      ],
      best_for: ["Aged oolong", "Raw pu-erh (sheng)", "Ripe pu-erh (shou)"],
      icon: "MoveDown",
    },
    {
      slug: "high-circular",
      name: "High Circular Pouring",
      original_name: "高 circular 衝",
      romaji: "gāo huán chōng",
      description:
        "Pouring from a height in a circular motion onto the gaiwan bottom. This quickly merges leaves with water, evenly releasing compounds and enhancing both aroma and flavor.",
      params: [
        { icon: "MoveVertical", label: "Height", value: "≈1.5× the gaiwan height" },
        { icon: "Compass", label: "Position", value: "Circular motion along the bottom" },
        { icon: "Zap", label: "Force", value: "Fast yet gentle" },
      ],
      tips: [
        "Best for high-aroma oolongs: Rock tea (yancha), Phoenix Dancong.",
        "Also excellent for high-aroma black teas.",
        "The circular motion ensures even extraction across all leaves.",
      ],
      best_for: ["Rock tea (yancha)", "Phoenix Dancong", "High-aroma black tea"],
      icon: "RotateCw",
    },
    {
      slug: "low-circular",
      name: "Low Circular Pouring (along the rim)",
      original_name: "低环冲 / 沿边注水",
      romaji: "dī huán chōng",
      description:
        "Pouring gently along the gaiwan's inner rim in a circular motion. The rim cushions the water impact, preventing over-agitation of the leaves. This creates a long, smooth, and gentle taste — the most delicate pouring technique.",
      params: [
        { icon: "MoveVertical", label: "Height", value: "Low, at the rim level" },
        { icon: "Compass", label: "Position", value: "Along the gaiwan wall / rim, circular" },
        { icon: "Feather", label: "Force", value: "Light and gentle" },
      ],
      tips: [
        "Best for tender white and green teas — prevents bruising delicate leaves.",
        "The water slides down the wall and gently surrounds the leaves.",
        "Think of it as 'cradling' the leaves rather than hitting them.",
      ],
      best_for: ["White tea", "Green tea", "Delicate teas"],
      icon: "RotateCcw",
    },
    {
      slug: "45-degree",
      name: "45-Degree Angle Pouring",
      original_name: "45度旋冲",
      romaji: "45 dù xuán chōng",
      description:
        "Pouring at a 45-degree angle to the gaiwan wall from about 2–3cm. The angle creates a whirlpool inside the vessel, enhancing the tea's aroma and lifting the flavor profile — a technique between high and low pouring.",
      params: [
        { icon: "MoveVertical", label: "Height", value: "2–3cm above the gaiwan" },
        { icon: "Compass", label: "Position", value: "7:30 o'clock, spout at 45° to the wall" },
        { icon: "Zap", label: "Force", value: "Fast, creates a whirlpool" },
      ],
      tips: [
        "Best for strip-shaped oolongs (e.g. Dancong, Wuyi yancha).",
        "Also great for high-aroma black teas.",
        "The whirlpool circulates the leaves for even extraction with aromatic lift.",
      ],
      best_for: ["Strip-shaped oolong", "High-aroma black tea"],
      icon: "GitFork",
    },
    {
      slug: "m-shaped",
      name: "M-Shaped Pouring",
      original_name: "M形注水",
      romaji: "M xíng zhùshuǐ",
      description:
        "Pouring in an M-shaped pattern over the leaves. This helps larger, lighter leaves soak and release flavor quickly, making the tea taste fresh — the gentlest direct-to-leaf technique, best for the first brew of delicate teas.",
      params: [
        { icon: "MoveVertical", label: "Height", value: "Moderate, above the leaves" },
        { icon: "Compass", label: "Position", value: "M-shaped pattern across the surface" },
        { icon: "Feather", label: "Force", value: "Light and fast" },
      ],
      tips: [
        "Best for the first brew of white or green tea.",
        "After the first brew, switch to fixed-point pouring — the leaves are already wet.",
        "The M-shape ensures even wetting of large, fluffy leaves that tend to float.",
      ],
      best_for: ["White tea (first brew)", "Green tea (first brew)"],
      icon: "Mountain",
    },
  ],
};

// ── Tea Accessories ──────────────────────────────────────────────────

export const ACCESSORIES_CATEGORY: WikiCategory = {
  slug: "accessories",
  name: "Tea Accessories",
  description:
    "From the gaiwan to the chasen, explore the tools that make tea brewing a craft. Each item has a purpose — and a story rooted in centuries of tea culture.",
  icon: "Package",
  entries: [
    {
      slug: "gaiwan",
      name: "Gaiwan",
      original_name: "蓋碗",
      romaji: "gàiwǎn",
      description:
        "The gaiwan ('lidded bowl') is the most versatile brewing vessel in Chinese tea culture, consisting of a saucer, bowl, and lid representing heaven, earth, and humanity. Porcelain doesn't absorb flavors, so you can brew any tea type in it.",
      params: [
        { icon: "CupSoda", label: "Material", value: "Porcelain (most common), glass, or Yixing clay" },
        { icon: "Scale", label: "Capacity", value: "100–150ml (gongfu size); up to 200ml" },
        { icon: "Sparkles", label: "Neutrality", value: "Doesn't absorb aromas — switch tea types freely" },
      ],
      sections: [
        {
          heading: "How to hold a gaiwan",
          body: "Hold the saucer with your ring and pinky fingers, grip the bowl rim with your thumb and middle finger, and press the lid slightly open with your index finger to pour while holding back the leaves. Tilt and pour into a fairness pitcher or cup.",
        },
        {
          heading: "Choosing a gaiwan",
          body: "For beginners, a 120–150ml porcelain gaiwan with a wide bowl and flared rim is ideal — easy to handle and not too hot. Thinner walls brew more delicately; thicker walls retain heat better for dark teas. White porcelain lets you see the liquor color clearly.",
        },
      ],
      tips: [
        "Pre-warm the gaiwan with hot water before adding leaves — this stabilizes brewing temperature.",
        "The lid captures aroma — smell it after each pour for a full sensory experience.",
        "A gaiwan is the most affordable entry point into gongfu tea — you can start with just this and a cup.",
      ],
      best_for: ["All tea types", "Beginners", "Tasting multiple teas"],
      icon: "CupSoda",
    },
    {
      slug: "yixing-teapot",
      name: "Yixing Clay Teapot",
      original_name: "宜興紫砂壺",
      romaji: "Yíxīng zǐshā hú",
      description:
        "The Yixing teapot is made from zisha (紫砂, 'purple sand clay') mined around Yixing in Jiangsu province. Unglazed and porous, it absorbs tea oils over time and develops a patina that enhances future brews. Dedicate each pot to one tea family — the clay 'remembers' the tea and rounds out astringency, highlighting sweetness.",
      params: [
        { icon: "CupSoda", label: "Material", value: "Unglazed Yixing zisha clay (purple, red zhuni, duanni)" },
        { icon: "Scale", label: "Capacity", value: "80–200ml (gongfu size)" },
        { icon: "Sparkles", label: "Seasoning", value: "Absorbs tea oils — dedicate to one tea family" },
      ],
      sections: [
        {
          heading: "Clay types",
          body: "Zini (紫泥, purple clay) — the most common, versatile, good for oolong and pu-erh. Zhuni (朱泥, red clay) — high iron content, high-fired, excellent heat retention, best for Dancong and red tea. Duanni (段泥, beige clay) — lower density, good for green and lightly oxidized teas.",
        },
        {
          heading: "Seasoning a new pot",
          body: "Before first use, rinse the pot inside and out with boiling water. After each session, rinse with hot water only — never use soap, as it will be absorbed into the clay.",
        },
        {
          heading: "One pot, one tea",
          body: "Because the porous clay absorbs oils, using the same pot for different tea types will mix flavors. Traditionally, one Yixing pot is dedicated to a single tea family — all oolongs together, or all pu-erhs together. For versatility, use a porcelain gaiwan instead.",
        },
      ],
      tips: [
        "Never wash with soap — rinse with hot water only and air-dry with the lid off.",
        "Look for a pot where the lid fits snugly and the pour is smooth and even.",
        "Yixing pots improve with years of use — they're lifetime companions, not just tools.",
      ],
      best_for: ["Oolong", "Pu-erh", "Black/red tea", "Dedicated single-tea brewing"],
      icon: "CookingPot",
    },
    {
      slug: "gongdao-bei",
      name: "Fairness Pitcher",
      original_name: "公道杯",
      romaji: "gōngdào bēi",
      description:
        "The gongdao bei ('fairness cup', also called chahai / 茶海) is a small pitcher that receives the tea from the gaiwan before it's served. The first pour is lighter than the last, so decanting into a fairness pitcher first ensures every guest receives equal-strength tea.",
      params: [
        { icon: "CupSoda", label: "Material", value: "Glass (most common), porcelain, or clay" },
        { icon: "Scale", label: "Capacity", value: "100–200ml (should match your gaiwan/teapot)" },
      ],
      sections: [
        {
          heading: "Why use one?",
          body: "When pouring directly from a gaiwan into multiple cups, the first cup gets the weakest tea and the last cup the strongest. The fairness pitcher mixes the entire infusion before serving, eliminating that inequality — and lets you observe the tea's color and stop extraction at the right moment.",
        },
      ],
      tips: [
        "Glass fairness pitchers let you appreciate the tea's liquor color.",
        "Pour from the gaiwan into the pitcher quickly to stop extraction at the right moment.",
        "If you only buy one accessory beyond a gaiwan, make it this one.",
      ],
      best_for: ["Gongfu brewing", "Serving multiple guests", "Consistent strength"],
      icon: "FlaskConical",
    },
    {
      slug: "tasting-cup",
      name: "Tasting Cup",
      original_name: "品茗杯",
      romaji: "pǐnmíng bēi",
      description:
        "The pinming bei ('tea-tasting cup') is a small cup (30–60ml) designed for sipping tea mindfully. Its small size concentrates the aroma and encourages slow tasting. In Taiwan, a tall 'fragrance cup' (聞香杯) is paired with a wider drinking cup — you smell the aroma from the tall cup, then pour into the wider cup to drink.",
      params: [
        { icon: "CupSoda", label: "Material", value: "Porcelain, glass, or clay" },
        { icon: "Scale", label: "Capacity", value: "30–60ml" },
      ],
      tips: [
        "White porcelain cups let you see the tea's color most clearly.",
        "Thin-walled cups feel more elegant; thick-walled cups retain heat longer.",
        "In formal gongfu, cups are arranged in a row and filled in a back-and-forth pattern to equalize strength.",
      ],
      best_for: ["Gongfu tasting", "Aroma appreciation", "Serving guests"],
      icon: "CupSoda",
    },
    {
      slug: "cha-ze",
      name: "Tea Scoop",
      original_name: "茶則",
      romaji: "chá zé",
      description:
        "The cha ze is a scoop — usually bamboo or wood — used to transfer tea leaves to the brewing vessel. It helps measure the right amount of leaf and keeps your hands' oils off the tea; part of the 'six tea gentlemen' (茶道六君子) in formal gongfu.",
      params: [
        { icon: "CupSoda", label: "Material", value: "Bamboo, wood, metal, or horn" },
      ],
      tips: [
        "Use the scoop to feel the leaf — its shape, weight, and texture tell you about the tea.",
        "Bamboo scoops are the most traditional and don't transfer heat or flavor.",
      ],
      best_for: ["Gongfu tea", "Precise measurement", "Tea ceremony"],
      icon: "Utensils",
    },
    {
      slug: "cha-he",
      name: "Tea Holder",
      original_name: "茶盒",
      romaji: "chá hé",
      description:
        "The cha he ('tea vessel/box') is a shallow dish used to present tea leaves to guests before brewing — pass it around for everyone to see and smell, then transfer the leaves into the gaiwan. It's both a practical tool and a gesture of hospitality.",
      params: [
        { icon: "CupSoda", label: "Material", value: "Bamboo, wood, porcelain, or lacquer" },
      ],
      tips: [
        "Pass the cha he around before brewing — let guests see, smell, and appreciate the dry leaves.",
        "The cha he is also called shang cha ju (賞茶具, 'tea-appreciation vessel').",
      ],
      best_for: ["Tea ceremony", "Guest appreciation", "Dry leaf presentation"],
      icon: "Box",
    },
    {
      slug: "cha-zhen",
      name: "Tea Needle / Pick",
      original_name: "茶針",
      romaji: "chá zhēn",
      description:
        "The cha zhen is a thin needle-like tool used to clear blocked teapot spouts and scrape wet leaves out of a gaiwan or teapot after brewing. It's an essential maintenance tool for Yixing teapots, whose narrow spouts clog easily; part of the 'six tea gentlemen' set.",
      params: [
        { icon: "CupSoda", label: "Material", value: "Bamboo, wood, or metal (brass/stainless)" },
      ],
      tips: [
        "Keep one handy — a blocked spout is the most common gongfu frustration.",
        "Use the flat end to scoop spent leaves; the sharp end to clear the spout.",
      ],
      best_for: ["Yixing teapot maintenance", "Clearing spouts", "Cleaning"],
      icon: "Crosshair",
    },
    {
      slug: "cha-ban",
      name: "Tea Tray",
      original_name: "茶盤",
      romaji: "chá pán",
      description:
        "The cha pan ('tea tray') is the foundation of the gongfu tea table — a flat, usually wooden tray with a grid surface that lets waste water drain through. During brewing, overflow and rinse water are poured onto it, keeping the workspace clean. Larger tea tables (茶台) may have built-in drainage.",
      params: [
        { icon: "CupSoda", label: "Material", value: "Bamboo, wood (zisha stone for premium trays)" },
        { icon: "Scale", label: "Size", value: "Small (30cm) to large (60cm+)" },
      ],
      tips: [
        "A simple bamboo tray is enough for beginners — don't overthink it.",
        "The tray doubles as a disposal area for rinse water and warming water.",
        "Some trays have a removable drip pan underneath for easy cleaning.",
      ],
      best_for: ["Gongfu setup", "Waste water management", "Tea table aesthetics"],
      icon: "RectangleHorizontal",
    },
    {
      slug: "chasen",
      name: "Matcha Whisk",
      original_name: "茶筅",
      romaji: "chasen",
      description:
        "The chasen is a bamboo whisk used in the Japanese tea ceremony (chanoyu) to whisk matcha into a smooth, frothy suspension. Carved from a single piece of bamboo, its dozens of fine tines break up the powder and create a creamy microfoam. Over 100 styles exist, each suited to different schools and tea thicknesses.",
      params: [
        { icon: "CupSoda", label: "Material", value: "Bamboo (hand-carved, single piece)" },
        { icon: "Scale", label: "Tines", value: "16–120+ prongs (more for thin usucha, fewer for thick koicha)" },
      ],
      sections: [
        {
          heading: "Care",
          body: "Rinse with warm water before and after each use — never soap or hot water, which can damage the bamboo tines. Dry on a whisk keeper (kusaboshi) to maintain the tine shape. A well-cared chasen lasts 6–12 months with regular use.",
        },
      ],
      tips: [
        "Whisk in a 'W' or 'M' motion for thin tea (usucha); stir slowly and gently for thick tea (koicha).",
        "Only about 18 chasen masters remain in Japan — each whisk is a handcraft.",
        "A whisk keeper (kusaboshi) extends the chasen's life by maintaining tine shape while drying.",
      ],
      best_for: ["Matcha", "Japanese tea ceremony", "Usucha / koicha"],
      icon: "Waves",
    },
    {
      slug: "chawan",
      name: "Tea Bowl",
      original_name: "茶碗",
      romaji: "chawan",
      description:
        "The chawan is a wide, deep ceramic bowl used for drinking matcha in the Japanese tea ceremony. Unlike Chinese tasting cups (small and narrow), the chawan is large enough to hold the chasen and allow whisking directly inside. Each bowl is a unique piece of ceramic art, and guests traditionally admire the bowl before and after drinking.",
      params: [
        { icon: "CupSoda", label: "Material", value: "Stoneware or porcelain (raku, hagi, karatsu styles)" },
        { icon: "Scale", label: "Size", value: "10–14cm diameter, 7–9cm deep" },
      ],
      tips: [
        "Hold the bowl with both hands — this is both respectful and practical for warmth.",
        "Rotate the bowl 180° before drinking so you don't drink from the front (the 'face' of the bowl).",
        "Different seasons call for different bowls: wide and shallow for summer (cools faster), tall and narrow for winter (retains heat).",
      ],
      best_for: ["Matcha", "Chanoyu", "Japanese tea ceremony"],
      icon: "Circle",
    },
    {
      slug: "kyusu",
      name: "Kyusu Teapot",
      original_name: "急須",
      romaji: "kyūsu",
      description:
        "The kyusu is a traditional Japanese side-handle teapot used for brewing sencha, gyokuro, and other Japanese green teas. Most are made of porcelain or tokoname clay. The side handle provides excellent pour control, and the built-in strainer (sasame / 紗洗) at the spout catches leaves without a separate filter.",
      params: [
        { icon: "CupSoda", label: "Material", value: "Porcelain, tokoname clay, or banko yaki" },
        { icon: "Scale", label: "Capacity", value: "200–400ml" },
      ],
      tips: [
        "Pour all the tea out completely — leaving water on sencha leaves makes subsequent infusions bitter.",
        "The built-in strainer means no separate filter is needed.",
        "Tokoname-yaki kyusu are the most prized — their clay is similar in spirit to Yixing, but for green tea.",
      ],
      best_for: ["Sencha", "Gyokuro", "Japanese green tea"],
      icon: "CookingPot",
    },
    {
      slug: "tea-pet",
      name: "Tea Pet",
      original_name: "茶寵",
      romaji: "chá chǒng",
      description:
        "A tea pet is a small clay figure — usually Yixing zisha — that lives on your tea tray and is 'fed' the first rinse of each brewing session. Over time, the tea liquor nourishes the clay, giving it a warm sheen. A whimsical companion rooted in Chinese tea culture — so you never drink alone.",
      params: [
        { icon: "CupSoda", label: "Material", value: "Unglazed Yixing zisha clay (same as Yixing teapots)" },
        { icon: "PawPrint", label: "Designs", value: "Animals (frog, dragon, elephant), mythical creatures, Buddha figures" },
        { icon: "Sparkles", label: "Symbolism", value: "Frog = wealth, dragon = power, elephant = stability" },
      ],
      sections: [
        {
          heading: "How to raise a tea pet",
          body: "Pour the first rinse or leftover tea over your tea pet during each session. The unglazed clay absorbs the tea oils and gradually develops a glossy patina — the more you 'feed' it, the shinier it gets. Different teas will tint the clay differently; green tea keeps it light, pu-erh darkens it.",
        },
        {
          heading: "The 'seven baths' ritual",
          body: "Some practitioners give their tea pet seven pours in a row when first bringing it home, to 'awaken' the clay. After that, a pour or two per session is enough.",
        },
      ],
      tips: [
        "Never use soap — rinse with tea or hot water only, same as Yixing teapots.",
        "Pick a tea pet that resonates with you — it's a personal companion, not just decoration.",
        "Some tea pets have a small hole that lets them spit water when poured over — a playful tea-table trick.",
      ],
      best_for: ["Gongfu brewing", "Tea tray companion", "Tea ceremony aesthetics"],
      icon: "PawPrint",
    },
  ],
};

// ── The Making of Tea (tea types & processing) ──────────────────────

export const TEA_TYPES_CATEGORY: WikiCategory = {
  slug: "tea-types",
  name: "The Making of Tea",
  description:
    "All true tea comes from one plant — Camellia sinensis. What creates the vast world of tea varieties is how the leaves are processed after picking. Explore the six major tea families and how they're made.",
  icon: "Leaf",
  entries: [
    {
      slug: "green-tea",
      name: "Green Tea",
      original_name: "綠茶",
      romaji: "lǜchá (Mandarin) / ryokucha (Japanese)",
      description:
        "Green tea is the least processed of all tea types. Freshly picked leaves are quickly 'fixed' (shaqing) by pan-firing or steaming to halt oxidation, then dried — preserving green color, fresh flavor, and high antioxidants. Chinese green teas are pan-fired (toasted, nutty); Japanese green teas are steamed (vegetal, grassy).",
      params: [
        { icon: "Thermometer", label: "Oxidation", value: "0% (unoxidized)" },
        { icon: "Zap", label: "Fixing", value: "Pan-firing (China) or steaming (Japan)" },
        { icon: "Clock", label: "Brewing", value: "75–80°C, 1–3 minutes" },
      ],
      sections: [
        {
          heading: "Processing steps",
          body: "Plucking → Withering (brief) → Fixing (shaqing / 杀青: pan-fire at ~250°C or steam at ~100°C) → Rolling → Drying",
        },
        {
          heading: "Famous varieties",
          body: "",
          bullets: [
            "Longjing 龍井 (Dragon Well) — flat, pan-fired leaves from Hangzhou; toasty, sweet chestnut notes",
            "Biluochun 碧螺春 — tightly rolled, intensely fragrant spring buds from Jiangsu",
            "Huangshan Maofeng 黃山毛峰 — downy buds from Anhui, gentle and floral",
            "Sencha 煎茶 — Japan's most common tea, steamed, vegetal and refreshing",
            "Gyokuro 玉露 — shade-grown Japanese green tea, deep umami and sweetness",
            "Matcha 抹茶 — stone-ground green tea powder, used in chanoyu",
          ],
        },
      ],
      tips: [
        "Never use boiling water — 75–80°C is ideal. Too hot = bitter, astringent.",
        "Steep briefly: 1–2 minutes for the first infusion. Green tea over-steeps quickly.",
        "Japanese green teas (steamed) are more vegetal; Chinese green teas (pan-fired) are more nutty/toasted.",
      ],
      best_for: ["Morning", "Antioxidants", "Refreshing", "Summer"],
      icon: "Leaf",
    },
    {
      slug: "white-tea",
      name: "White Tea",
      original_name: "白茶",
      romaji: "báichá",
      description:
        "White tea is the most minimally processed of all tea types. After plucking, the leaves are simply withered (air-dried) and dried — no fixing, no rolling. This preserves delicate, natural flavors and the fine white down (baihao / 白毫) on the buds, producing a soft, sweet, honeyed profile that gains complexity with age.",
      params: [
        { icon: "Thermometer", label: "Oxidation", value: "5–10% (minimal, natural)" },
        { icon: "Feather", label: "Processing", value: "Withering + drying only — no fixing or rolling" },
        { icon: "Clock", label: "Brewing", value: "80–85°C, 2–5 minutes (gongfu: 85–90°C, 5–15s)" },
      ],
      sections: [
        {
          heading: "Processing steps",
          body: "Plucking → Withering (long, slow: 1–3 days, sun or shade) → Drying. That's it — no shaqing, no rolling.",
        },
        {
          heading: "Famous varieties",
          body: "",
          bullets: [
            "Baihao Yinzhen 白毫銀針 (Silver Needle) — pure buds covered in white down; the pinnacle of white tea",
            "Bai Mudan 白牡丹 (White Peony) — one bud + two leaves, fuller flavor than Silver Needle",
            "Shoumei 壽眉 (Longevity Brow) — larger leaves, more robust, ages beautifully",
            "Gongmei 貢眉 (Tribute Eyebrow) — traditionally from small-leaf varietals",
          ],
        },
        {
          heading: "Aging white tea",
          body: "Unlike most teas, white tea improves with age — aged white tea (lao bai cha) develops deeper, richer, more medicinal notes over 3–20 years. The saying goes: 'One year tea, three years medicine, seven years treasure' (一年茶，三年藥，七年寶).",
        },
      ],
      tips: [
        "White tea is forgiving — it's hard to over-steep. Longer steeps bring out more sweetness.",
        "Use slightly hotter water than green tea: 80–90°C works well.",
        "Aged white tea (5+ years) can be boiled for a rich, honeyed brew.",
      ],
      best_for: ["Gentle mornings", "Aging", "Evening (low caffeine)", "Sensitive palates"],
      icon: "Feather",
    },
    {
      slug: "yellow-tea",
      name: "Yellow Tea",
      original_name: "黃茶",
      romaji: "huángchá",
      description:
        "Yellow tea is one of the rarest tea categories. It follows green tea processing but adds a 'sealing yellow' step (menhuang / 焙黃) where the leaves are wrapped in damp cloth and gently yellow for several hours to days. This mellowing removes green tea's grassy sharpness, producing a smoother, sweeter cup with a characteristic yellow hue.",
      params: [
        { icon: "Thermometer", label: "Oxidation", value: "10% (light, non-enzymatic)" },
        { icon: "Clock", label: "Menhuang", value: "Wrapped and rested 2–7 days" },
        { icon: "Clock", label: "Brewing", value: "80–85°C, 2–3 minutes" },
      ],
      sections: [
        {
          heading: "Processing steps",
          body: "Plucking → Withering → Fixing (shaqing) → Menhuang (sealing yellow: wrap in damp paper/cloth, rest) → Rolling → Drying",
        },
        {
          heading: "Famous varieties",
          body: "",
          bullets: [
            "Junshan Yinzhen 君山銀針 — from Hunan; the most famous yellow tea, once a tribute tea for emperors",
            "Huoshan Huangya 霍山黃芽 — from Anhui; light, sweet, chestnut notes",
            "Mengding Huangya 蒙頂黃芽 — from Sichuan; one of the oldest cultivated teas",
          ],
        },
        {
          heading: "Why it's rare",
          body: "Yellow tea requires skilled labor and time — the menhuang step is tricky and the market is small, so many producers skip it and sell their tea as green tea instead. True yellow tea is increasingly hard to find.",
        },
      ],
      tips: [
        "Brew like green tea but expect a softer, sweeter, less grassy cup.",
        "If you find authentic yellow tea, treasure it — it's one of the rarest tea categories.",
        "The menhuang step makes the leaves slightly fermented, giving a unique 'cooked sweetness' note.",
      ],
      best_for: ["Connoisseurs", "Gentle drinking", "Exploring rare teas"],
      icon: "Sun",
    },
    {
      slug: "oolong-tea",
      name: "Oolong Tea",
      original_name: "烏龍茶 / 青茶",
      romaji: "wūlóngchá / qīngchá",
      description:
        "Oolong ('black dragon') is the most diverse tea category, spanning semi-oxidized teas from 15% to 85%. The defining step is zuoqing (做青, 'doing the green') — leaves are bruised at the edges to trigger controlled oxidation, then rested, repeatedly, over many hours. This creates the complex, layered aromatics oolongs are famous for, from light floral Dancong to dark roasted Da Hong Pao.",
      params: [
        { icon: "Thermometer", label: "Oxidation", value: "15–85% (the widest range of any tea type)" },
        { icon: "Zap", label: "Key step", value: "Zuoqing (做青): bruising + resting in cycles" },
        { icon: "Clock", label: "Brewing", value: "85–95°C, gongfu: 5–30s per infusion" },
      ],
      sections: [
        {
          heading: "Processing steps",
          body: "Plucking → Withering (sun + shade) → Zuoqing (bruise leaves by shaking/tossing, rest, repeat 5–10+ times over several hours) → Fixing (shaqing) → Rolling → Roasting/Drying",
        },
        {
          heading: "Famous varieties",
          body: "",
          bullets: [
            "Da Hong Pao 大紅袍 (Big Red Robe) — Wuyi rock tea (yancha), dark roasted, mineral 'rock rhyme' (yan yun)",
            "Tieguanyin 鐵觀音 (Iron Goddess of Mercy) — Anxi; rolled into tight balls, floral and sweet",
            "Phoenix Dancong 鳳凰單叢 (Fenghuang Dancong) — Guangdong; single-bush, intensely aromatic, strip-shaped",
            "Dong Ding 凍頂 — Taiwan; ball-rolled, balanced roast, classic Taiwanese oolong",
            "Alishan 阿里山 — Taiwan; high mountain, lightly oxidized, creamy and floral",
            "Oriental Beauty 東方美人 (Dongfang Meiren) — Taiwan; bug-bitten, honey-sweet, high oxidation",
          ],
        },
        {
          heading: "The spectrum",
          body: "Light oolongs (15–30%): Alishan, green Tieguanyin — floral, fresh, creamy. Medium (30–50%): Traditional Tieguanyin, Dancong — aromatic, layered. Dark (50–85%): Da Hong Pao, roasted Dancong — roasted, mineral, deep. This range is why oolong is the favorite of gongfu practitioners.",
        },
      ],
      tips: [
        "Oolong is the best tea type for gongfu brewing — the layered flavors unfold differently in each infusion.",
        "Rolled oolongs (Tieguanyin, Alishan) expand dramatically — fill the gaiwan 1/3 full.",
        "Roasted oolongs can be brewed hotter (95–100°C); green oolongs prefer 85–90°C.",
      ],
      best_for: ["Gongfu brewing", "Aroma lovers", "Multiple infusions", "All-day drinking"],
      icon: "Flame",
    },
    {
      slug: "black-tea",
      name: "Black Tea (Red Tea)",
      original_name: "紅茶",
      romaji: "hóngchá (Mandarin) / kōcha (Japanese)",
      description:
        "What the West calls 'black tea' is known in China as 'red tea' (hongcha) for its reddish liquor. It's fully oxidized: leaves are rolled to break cell walls, then left to oxidize completely before drying, creating the rich, malty, full-bodied character that makes it the most widely consumed tea in the world.",
      params: [
        { icon: "Thermometer", label: "Oxidation", value: "80–100% (fully oxidized)" },
        { icon: "Zap", label: "Key step", value: "Rolling + full oxidation (2–4 hours)" },
        { icon: "Clock", label: "Brewing", value: "95–100°C, 3–5 minutes (gongfu: 90–95°C, 10–20s)" },
      ],
      sections: [
        {
          heading: "Processing steps",
          body: "Plucking → Withering (long, 12–18 hours) → Rolling (breaks cell walls, releases juices) → Oxidation (2–4 hours in humid air, leaves turn copper-red) → Drying (halts oxidation)",
        },
        {
          heading: "Famous varieties",
          body: "",
          bullets: [
            "Keemun 祁門 (Qimen) — Anhui; wine-like, smoky, the classic Chinese black tea",
            "Lapsang Souchong 正山小種 (Zhengshan Xiaozhong) — Fujian; smoked over pine, smoky and sweet",
            "Jin Jun Mei 金駿眉 — Fujian; pure golden buds, sweet, honeyed, premium",
            "Dianhong 滇紅 — Yunnan; malty, rich, often with golden tips",
            "Darjeeling — India; light, muscatel, 'champagne of teas'",
            "Assam — India; strong, malty, the backbone of breakfast tea",
            "Ceylon — Sri Lanka; bright, citrusy, versatile",
          ],
        },
        {
          heading: "Orthodox vs. CTC",
          body: "Orthodox processing (whole leaf) preserves the leaf's character and complexity. CTC (Crush, Tear, Curl) chops leaves into small pellets for fast extraction — used in tea bags and strong breakfast blends. Orthodox teas reward slow brewing; CTC teas are for quick, strong cups.",
        },
      ],
      tips: [
        "Black tea can handle the hottest water — 95–100°C is ideal.",
        "It's the most forgiving tea type — hard to ruin if you steep a minute too long.",
        "Many black teas take milk and sugar well (especially Assam, Ceylon, CTC blends).",
      ],
      best_for: ["Morning", "Milk tea", "Everyday drinking", "Western brewing"],
      icon: "Coffee",
    },
    {
      slug: "dark-tea",
      name: "Dark Tea (Heicha) & Pu-erh",
      original_name: "黑茶 / 普洱茶",
      romaji: "hēichá / pǔ'ěr chá",
      description:
        "Dark tea (heicha / 黑茶, 'black tea' in Chinese — confusingly different from Western 'black tea') is a category of post-fermented teas. After normal processing, they undergo microbial fermentation (pile fermentation for shou pu-erh, or natural aging for sheng pu-erh), creating deep, earthy, complex flavors that improve with age — like fine wine. Pu-erh from Yunnan is the most famous.",
      params: [
        { icon: "Thermometer", label: "Oxidation", value: "Varies — post-fermentation is microbial, not enzymatic" },
        { icon: "Clock", label: "Aging", value: "Sheng: years to decades. Shou: ready to drink, still improves." },
        { icon: "Clock", label: "Brewing", value: "95–100°C, gongfu: 10–30s; or boil 3–10 min" },
      ],
      sections: [
        {
          heading: "Two types of pu-erh",
          body: "",
          bullets: [
            "Sheng pu-erh 生茶 (raw): Sun-dried green tea, naturally aged over years. Starts green and astringent, develops into smooth, complex, sweet tea over decades. Like aging a fine wine.",
            "Shou pu-erh 熟茶 (ripe): Developed in the 1970s to speed up aging. Undergoes 'wo dui' (渥堆, wet piling) — leaves are piled, moistened, and covered for 45–60 days. Microbial fermentation creates the dark, earthy, sweet character immediately, without needing decades of aging.",
          ],
        },
        {
          heading: "Processing steps (sheng)",
          body: "Plucking → Withering → Fixing (shaqing) → Rolling → Sun-drying → Pressing (cakes, bricks, tuocha) → Aging",
        },
        {
          heading: "Processing steps (shou)",
          body: "Same as sheng through sun-drying → Wo dui (wet piling, 45–60 days) → Drying → Pressing → Optional aging",
        },
        {
          heading: "Famous varieties & shapes",
          body: "",
          bullets: [
            "Sheng pu-erh — sharp, vibrant, aging potential; green-gold liquor",
            "Shou pu-erh — earthy, smooth, sweet, dark red-brown liquor",
            "Bingcha 餅茶 — disc-shaped cake (commonly 357g)",
            "Tuocha 沱茶 — bowl-shaped nugget",
            "Brick 磚茶 — rectangular brick (historically for transport)",
            "Liu Bao 六堡茶 — Guangxi heicha with a distinctive betel-nut aroma",
          ],
        },
      ],
      tips: [
        "Always rinse pu-erh (pour hot water, discard immediately) — this 'wakes up' the compressed leaves and removes dust from aging.",
        "Shou pu-erh is the most approachable — earthy, smooth, no astringency. Great entry point.",
        "Sheng pu-erh can be challenging when young (astringent, bitter) but transforms with age.",
      ],
      best_for: ["After meals", "Digestion", "Aging/collecting", "Cold weather"],
      icon: "Box",
    },
  ],
};

// ── Master category list ─────────────────────────────────────────────

export const WIKI_CATEGORIES: WikiCategory[] = [
  BREWING_CATEGORY,
  POURING_CATEGORY,
  ACCESSORIES_CATEGORY,
  TEA_TYPES_CATEGORY,
];