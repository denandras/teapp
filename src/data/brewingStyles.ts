export interface BrewingStyle {
  slug: string;
  name: string;
  original_name: string;
  description: string;
  parameters: {
    leaf_to_water: string;
    water_temp_c: string;
    steep_time: string;
    num_brews: string;
    vessel: string;
  };
  steps: string[];
  tips: string[];
  best_for: string[];
  icon: string; // lucide icon name
}

export const BREWING_STYLES: BrewingStyle[] = [
  {
    slug: "gongfu",
    name: "Gongfu Cha",
    original_name: "功夫茶",
    description:
      "Gongfu cha (literally 'skill/effort tea') is a traditional Chinese brewing method that uses a high leaf-to-water ratio with short, repeated infusions in a small vessel. Each infusion reveals a different layer of the tea's flavor profile, making it the preferred method for appreciating fine teas — especially oolong, pu-erh, and white tea.",
    parameters: {
      leaf_to_water: "1g leaf per 15-20ml water (approx. 5-8g for a 100-150ml pot)",
      water_temp_c: "85-100°C (varies by tea type — see tips below)",
      steep_time: "5-30 seconds per infusion, increasing gradually",
      num_brews: "5-10+ infusions (depends on tea type and quality)",
      vessel: "Gaiwan (lidded bowl) or small Yixing clay teapot, 100-150ml",
    },
    steps: [
      "Warm the vessel: Pour boiling water into the gaiwan/teapot, swirl, then discard. This preheats the vessel for better extraction.",
      "Add leaves: Place 5-8g of tea into the warmed gaiwan (roughly 1/3 to 1/2 full for rolled oolongs, less for flat leaves).",
      "Rinse (optional): Pour hot water over the leaves and immediately discard. This 'awakens' the leaves and removes dust. Not needed for green or white teas.",
      "First infusion: Fill with water at the appropriate temperature. Steep for 5-10 seconds, then pour completely into a fairness pitcher (gongdao bei) or directly into cups.",
      "Serve: Pour from the fairness pitcher into tasting cups. Smell the aroma, observe the liquor color, then sip slowly.",
      "Subsequent infusions: Increase steep time by 2-5 seconds per round. The first 2-3 infusions are often the most aromatic; later infusions bring out sweetness and depth.",
      "Enjoy: Continue until the leaves are exhausted (flavor drops off significantly). Quality teas can yield 8-10+ rewarding infusions.",
    ],
    tips: [
      "Water temperature matters: use 100°C for pu-erh and dark oolong, 90-95°C for roasted oolong, 85-90°C for green oolong and white tea, 75-80°C for green tea.",
      "Always decant completely — never leave water sitting on the leaves between infusions, or the tea will become bitter and subsequent brews will be flat.",
      "Use good water: filtered or spring water with low mineral content brings out the best flavor. Hard water dulls the tea.",
      "The 'fairness pitcher' (gongdao bei) ensures every cup gets the same strength — the last pour is stronger than the first.",
      "Smell the lid after pouring — the gaiwan lid captures the aroma and is an important part of the sensory experience.",
      "Start with rolled oolongs (e.g. Tieguanyin, Da Hong Pao) — they expand dramatically and are forgiving for beginners.",
    ],
    best_for: ["Oolong", "Pu-erh", "White tea", "High-quality black tea"],
    icon: "Award",
  },
  {
    slug: "western",
    name: "Western Style",
    original_name: "西式泡法",
    description:
      "The Western brewing method uses a lower leaf-to-water ratio with longer steep times in a larger vessel. It produces a single, larger portion of tea — ideal for casual drinking, tea bags, or when serving multiple people. This is the most common method in Europe and North America.",
    parameters: {
      leaf_to_water: "1g leaf per 100ml water (approx. 2-3g or 1 tea bag per 200-300ml cup)",
      water_temp_c: "75-100°C (varies by tea type)",
      steep_time: "2-5 minutes (single infusion)",
      num_brews: "1-2 infusions (second brew is much lighter)",
      vessel: "Large teapot, mug, or tea cup (200-400ml)",
    },
    steps: [
      "Heat water to the appropriate temperature for your tea type.",
      "Place 2-3g of loose leaf tea (or one tea bag) into your teapot or mug.",
      "Pour hot water over the leaves and let steep for 2-5 minutes depending on tea type.",
      "Remove the leaves (or tea bag) to stop extraction and prevent bitterness.",
      "Optional: add milk, sugar, lemon, or honey to taste.",
      "If using loose leaf tea, you may get a second, lighter brew by steeping 1-2 minutes longer.",
    ],
    tips: [
      "Green and white teas: 75-85°C, 2-3 minutes. Too hot or too long = bitter.",
      "Black and dark teas: 95-100°C, 3-5 minutes. Can handle milk and sugar.",
      "Oolong: 85-95°C, 3-4 minutes. Can often be re-steeped once more.",
      "Use a tea strainer or infuser basket to give leaves room to expand — tight tea balls restrict flavor.",
      "Pre-warm your teapot with a splash of hot water for better temperature stability.",
    ],
    best_for: ["Black tea", "Herbal/Tisane", "Everyday drinking", "Tea bags"],
    icon: "Coffee",
  },
  {
    slug: "grandpa",
    name: "Grandpa Style",
    original_name: "爷爷泡法",
    description:
      "Grandpa style is the simplest of all brewing methods: leaves are placed directly in a glass or mug, hot water is added, and you drink as the leaves slowly settle. It's how many people in China casually drink tea at home or at work. No strainer, no special equipment — just a glass and leaves.",
    parameters: {
      leaf_to_water: "1-2g leaf per 200-300ml water (a small pinch)",
      water_temp_c: "75-95°C (let boiling water cool slightly for green tea)",
      steep_time: "Continuous — drink as it steeps",
      num_brews: "Refill with hot water as the mug empties (3-5 refills)",
      vessel: "Glass or mug (250-350ml)",
    },
    steps: [
      "Place a small pinch of tea leaves (1-2g) directly into a glass or mug.",
      "Pour hot water over the leaves. For green tea, let the water cool to about 80°C first.",
      "Watch the leaves dance and slowly sink — this is part of the charm.",
      "Drink directly from the glass, letting the leaves settle to the bottom. Sip carefully to avoid swallowing leaves.",
      "When the water runs low (about 1/3 remaining), refill with hot water. The tea will keep going for several refills.",
      "Stop when the flavor is exhausted. Discard the leaves.",
    ],
    tips: [
      "Use a tall glass so leaves have room to sink below your sipping line.",
      "Best with whole-leaf teas — broken leaves and fannings will float and get in your mouth.",
      "Green tea works beautifully: the glass lets you watch the leaves unfurl.",
      "Don't use water that's too hot for green/white tea — it'll make the first sips bitter.",
      "Keep refilling before the glass empties completely to maintain a consistent strength.",
    ],
    best_for: ["Green tea", "White tea", "Casual/everyday drinking", "Office or work"],
    icon: "GlassWater",
  },
  {
    slug: "cold-brew",
    name: "Cold Brew",
    original_name: "冷泡",
    description:
      "Cold brewing steeps tea leaves in cold or room-temperature water for an extended period (several hours to overnight). The slow, gentle extraction produces a naturally sweet, smooth, and low-astringency tea with almost no bitterness. Perfect for summer and for teas that are easily over-steeped in hot water.",
    parameters: {
      leaf_to_water: "1g leaf per 100ml water (approx. 5-10g per liter)",
      water_temp_c: "Cold or room temperature (4-25°C)",
      steep_time: "6-12 hours in the fridge, or 2-4 hours at room temperature",
      num_brews: "1 infusion (the spent leaves can be hot-brewed once more after)",
      vessel: "Pitcher, jar, or bottle (500ml-1L), refrigerated",
    },
    steps: [
      "Place 5-10g of tea leaves in a clean pitcher or jar.",
      "Add 1 liter of cold, filtered water.",
      "Cover and refrigerate for 8-12 hours (or leave at room temperature for 2-4 hours for a quicker brew).",
      "Strain out the leaves after the steeping period.",
      "Serve over ice. The tea will keep in the fridge for 2-3 days.",
      "Optional: add fruit, mint, or a slice of lemon for a refreshing twist.",
    ],
    tips: [
      "Green tea and white tea cold brew exceptionally well — the low temperature brings out sweetness without any bitterness.",
      "Use more leaf than you would for hot brewing — cold extraction is less efficient, so 1.5-2x the hot-brew ratio helps.",
      "Cold brew is much lower in caffeine and tannins than hot-brewed tea, making it gentler on the stomach.",
      "Oolong cold brew (especially Tieguanyin or Dancong) is a summer revelation — floral and crisp.",
      "Don't over-steep beyond 12-15 hours — the tea can develop a flat, woody taste.",
    ],
    best_for: ["Green tea", "White tea", "Oolong", "Summer refreshment"],
    icon: "Snowflake",
  },
];