-- Rivers and Lakes Tea catalog import (riversandlakestea.net) — Sep 2026
-- 37 products -> 30 default teas inserted, 7 skipped (6 name-variant dupes of existing
-- generic DB rows + 2 box/series pages). source_type='default', source='Teapp' (Sing/AN SHIM rule).
-- Naming: native names (pinyin romanized name / hanzi original_name); vintage years stripped.
-- tea_type histogram: white 7, oolong 7, sheng_puerh 4, black 4, yellow 3, green 1, shou_puerh 1, dark 1
INSERT INTO teas (name, slug, phonetic_name, original_name, description, origin, tea_type, category, caffeine_level, brewing_temp_c, brewing_time_min, brewing_num_brews, brewing_instructions, characteristics, health_benefits, color_hex, oxidation_level, roast_level, flavor_x, flavor_y, source_type, source, owner_id, is_public) VALUES
  ('Bada Manmai Shou', 'bada-manmai-shou', 'Bādá Mànmài Shú', '曼迈熟茶', 'Now back in stock.

An instant crowd favorite, we zeroed in on this ripe tea immediately due to its friendliness to both the palate as well as the wallet. Even though it''s affordable, it''s no slouch when it comes to quality — this material comes from natural 生态 shēngtài gardens planted in the 1980s managed by Dá É’s friend Nán Hé in the Bada Mountain village 曼迈 Mànmài near the Myanmar border. Manmai hosts just over 100 Bulang ethnicity families.

A long session of rich, creamy, cocoa puff + vanilla flavors suspended by a backbone of cooling stone + iron mineral textures awaits.

Nán Hé

Nán Hé harvesting in her family''s older growth gardens

Manmai village in Bada Mountain in western Menghai County, Xishuangbanna

Original teacake wrapper artwork by Rosy Kirby of Lost Mountain Prints', 'Manmai Village, Bada Mountain, Menghai, Xishuangbanna, Yunnan, China', 'shou_puerh', 'true_tea', 'high', 100, 1, 8, 'Use 5g per 150ml at 100°C. Rinse once; steep 20–30 seconds; re-steep 8+ times.', ARRAY['Creamy', 'Cocoa', 'Vanilla', 'Mineral']::text[], ARRAY[]::text[], '#6B4226', NULL, NULL, 80, 70, 'default', 'Teapp', NULL, TRUE),
  ('Zhenghe Lao Bai Mudan', 'zhenghe-lao-bai-mudan', 'Zhènghé Lǎo Bái Mǔdān', '政和老白牡丹', 'Dutifully complex, layered, and soupier than its fresh counterparts, this 2019 mu dan delivers what you''d want in an old white the whole way through. Sometimes the more elder stuff laying around a tea facility isn''t the best quality; with this more aged pressing fret not.

Oatmeal textured, apple-tinged, with a brick iron clay minerality providing a solid structure, this one entertains over a long session. Consider a nice boil or at least a long 20 minute steep at the session''s tail end.

Jinping, a timeless gem

Jinping Village is a small high elevation ancient silver-mining village, and is located in the greater Zhenghe tea producing region just south of the provincial Fujian-Zhejiang border in the Xianxia Mountains at 900 meters elevation. Headwaters coming down from the mountains around Jinping form the crystalline Jinxi River that flows through this village, flowing into the Chongyang, and eventually to the Min river system. Amazingly, Jinping Village and its surrounding wilderness has held onto over 4000 亩 (~650 acres) of ancient seed-propagated heirloom 小菜茶 Xiao Cai Cha tea gardens with most specimens over 100 years old in addition to over 1000 亩 (~160 acres) of naturally managed Zhenghe Da Bai cultivar tea gardens. Tea garden areas range from 900 meters up to over 1300 meters in elevation.

Jinping can trace its tea history back to the early Song Dynasty, some thousand years ago, flourishing in the mid Qing Dynasty, and contributing to the distinction of the greater Zhenghe area as its own tea production zone. During the Qing, Jinping village notably served as a starting as well as relay point on a trade route used to take tea and silver to Fu’an, onto Fuzhou, and then by boat to be traded as Bohea Tea in Canton, modern day Hong Kong, to merchants who would then sail back to Britain, Europe, and the Americas. Usage of this trade route ramped up as the port of Fuzhou was opened up for foreign trade in the mid 1800s. The same porters that relayed tea on their backs and loaded it onto the docks would return to Jinping with exchanged-for salt, giving this trade corridor the name the 茶盐古道 cha yan gu dao “ancient tea salt road”.

红茶 Red Tea Roots

The type of tea traded for and produced in Jinping at the time was primarily 红茶 hong cha or red tea, more commonly known to the global traders it would eventually reach as black tea — likely more specifically Bohea black tea — as the more oxidized teas from the greater northern Fujian / Wuyi Mountain orogeny was broadly known.

Jinping is a core origin for the advent of a regionally specific namesake for red tea from this part of Fujian: Zhenghe Gong Fu Hong Cha. The Gong Fu red tea class of northern Fujian — a triad consisting of Zhenghe Gong Fu, Bailin Gong Fu (in Fuding) Tanyang Gong Fu (in Fu’an) — are now a nearly forgotten about class of reds with a history beginning in the mid-late 1800s that not only predates but greatly inspired Qimen reds in the late 1800s. During these early years, other Zhenghe producers hadn’t yet adapted to making this red tea style being produced in Jinping, and Jinping’s new red tea was called 遂应仙岩工夫 Suiying Xianyang Gong Fu (遂应场 Suiying Chang was Jinping''s former name). Shortly after, non-local merchants standardized the origin identification to the more broad “Zhenghe Gong Fu” and around the same time other producers around Zhenghe county began making red tea. Tea historians not only see Suiying Xianyang Gong Fu as the progenitor to the entire Zhenghe Gong Fu genre, but also a specified high elevation regional sub-classification under the Zhenghe Gong Fu name, as expressed in its original use of the characters 仙岩 xianyan (literally “mountain immortal”) referring to the pristine, misty, fairy-like, high elevation mountainous terrain of the area around modern day Jinping.

Ancient Heirloom

Like all historic tea production areas that predate the wave of 20th-century advancements in cultivar development propagated through asexual cuttings, Jinping’s tea gardens were comprised of locally adapted heirloom tea bushes grown from seed, with each plant slightly genetically different from its neighboring organisms. This is evident in the complex fragrance and flavor of these teas as well as the unshowy and non-uniform look of the buds on the tippier grades of tea. Cultivars developed for their uniformity and appearance like Da Bai and Da Hao will have a more uniform and distinctively plump bud, a giveaway when visually assessing whether or not a tea has heirloom genetics versus is from a more newly developed cultivar.

Today the majority of Jinping’s ancient tea gardens still consist of descendant tea trees from this heirloom germplasm adapted to this specific environment, left to grow old amongst the natural landscape and continually reseed itself, hosting thousands of century-old tea bushes, with some specimens considered to be over 200 years old. Walking through these tea gardens, one can see many old tea trees growing in rocky terrain, interspersed with generations of naturally propagated offspring. The tea gardens are mostly distributed on the edges of forests dominated by bamboo groves, that rise up steep mountain slopes, with clear streams running through the entire landscape.

Tea leaves from old growth tea trees grown in ecologically diverse, high elevation forested environments like this will have much more amino acids and secondary metabolites, expressing in a more nutritive, complex, smooth, and compelling way than tea grown in full-sun monoculture gardens at lower elevations.

No man’s land

Outside of Southern Yunnan and select pockets of the Phoenix Mountains in Guangdong, pristine old growth tea gardens of this caliber are exceptionally special and rare. How did this small village on the Fujian-Zhejiang come to have so many untouched ancient tea trees?

During the cultural turmoil of the twentieth century when old ways were being uprooted, remote Jinping’s fecund tea gardens survived simply by being forgotten about, and continued to grow old while tea culture and other antiquities were dismantled or made taboo. This neglect is due to the fact that at the time this micro village wasn’t incorporated into a larger township or city—considered a 三不管地帶 “No man’s land”—and therefore mandates to reform industry and livelihoods of that time simply didn’t reach Jinping.

What’s equally as remarkable: during the resurgence of the domestic tea market in the decades around the turn of the century during China’s economic growth period, Jinping’s ancient tea gardens weren’t removed and replaced by newly developed predictably performing cultivars that now dominate that modern tea industry.

These tea trees managed to hang on through these bottlenecks until a time they were valued as what they are: heirloom ancient tea gardens in an exceptionally clean and high elevation mountain area. Jinping’s ancient tea gardens offer a rare look at how precious and timeless heirloom tea environments could have been in eastern China without the cultural upheaval and market demands of the seven or eight decades.

Inheritance

Among the twenty core families producing tea back in the tea-salt road days, the Xu family was the first to incorporate their business. Today the Xu family—either through outright ownership or by heading up a cooperative that shares plots—has access to the majority of the ancient tea gardens of Jinping. Having Jinping’s clean ecology and the related health benefits of drinking tea from this ancient and pristine of an environment at the forefront of their marketing, the Xu family does not use any pesticides on their tea gardens. Not only that, they also don’t use germination-inducing fertilizers either. Even though the tea grows slow and can’t be harvested many times, annually they’re able to take a competitive quantity of tea to market simply because of the sheer amount of tea garden acreage they have access to.

Xu Wu Quan is a seventh generation tea maker and is a county level intangible cultural inheritor of Zhenghe white tea and his brother, Wu Song, is a prefecture level inheritor of the Zhenghe Gong Fu red tea style, both producing tea in Jinping.', 'Jinping Village, Zhenghe, Fujian, China', 'white', 'true_tea', 'medium', 85, 4, 5, 'Use 4g per 150ml at 85–90°C. Steep 3–5 minutes; re-steep several times.', ARRAY['Smooth', 'Oatmeal', 'Mineral', 'Honeyed']::text[], ARRAY[]::text[], '#C8C4B0', 15, 5, 18, 12, 'default', 'Teapp', NULL, TRUE),
  ('Zhenghe Lao Cong Shou Mei', 'zhenghe-lao-cong-shou-mei', 'Zhènghé Lǎo Cōng Shòuméi', '政和老枞寿眉', '(TLDR: mislabeled as peony tea is actually a shou mei) Due to a misunderstanding, instead of 2023''s peony grade arriving, this leafier shou mei from the same garden was sent to the press. The cake artwork and all the packaging for the birds of a feather box was already completed, so this tea as well as the 2023 version is mislabeled.

A rich and sustaining shou mei exemplifying the quality environment from which it was grown, already noticeably mellowing after a head start of a few years of age. A quality, approaching mid-aged shou mei to drink now or age while still affordable.

Jinping, a timeless gem

Jinping Village is a small high elevation ancient silver-mining village, and is located in the greater Zhenghe tea producing region just south of the provincial Fujian-Zhejiang border in the Xianxia Mountains at 900 meters elevation. Headwaters coming down from the mountains around Jinping form the crystalline Jinxi River that flows through this village, flowing into the Chongyang, and eventually to the Min river system. Amazingly, Jinping Village and its surrounding wilderness has held onto over 4000 亩 (~650 acres) of ancient seed-propagated heirloom 小菜茶 Xiao Cai Cha tea gardens with most specimens over 100 years old in addition to over 1000 亩 (~160 acres) of naturally managed Zhenghe Da Bai cultivar tea gardens. Tea garden areas range from 900 meters up to over 1300 meters in elevation.

Jinping can trace its tea history back to the early Song Dynasty, some thousand years ago, flourishing in the mid Qing Dynasty, and contributing to the distinction of the greater Zhenghe area as its own tea production zone. During the Qing, Jinping village notably served as a starting as well as relay point on a trade route used to take tea and silver to Fu’an, onto Fuzhou, and then by boat to be traded as Bohea Tea in Canton, modern day Hong Kong, to merchants who would then sail back to Britain, Europe, and the Americas. Usage of this trade route ramped up as the port of Fuzhou was opened up for foreign trade in the mid 1800s. The same porters that relayed tea on their backs and loaded it onto the docks would return to Jinping with exchanged-for salt, giving this trade corridor the name the 茶盐古道 cha yan gu dao “ancient tea salt road”.

红茶 Red Tea Roots

The type of tea traded for and produced in Jinping at the time was primarily 红茶 hong cha or red tea, more commonly known to the global traders it would eventually reach as black tea — likely more specifically Bohea black tea — as the more oxidized teas from the greater northern Fujian / Wuyi Mountain orogeny was broadly known.

Jinping is a core origin for the advent of a regionally specific namesake for red tea from this part of Fujian: Zhenghe Gong Fu Hong Cha. The Gong Fu red tea class of northern Fujian — a triad consisting of Zhenghe Gong Fu, Bailin Gong Fu (in Fuding) Tanyang Gong Fu (in Fu’an) — are now a nearly forgotten about class of reds with a history beginning in the mid-late 1800s that not only predates but greatly inspired Qimen reds in the late 1800s. During these early years, other Zhenghe producers hadn’t yet adapted to making this red tea style being produced in Jinping, and Jinping’s new red tea was called 遂应仙岩工夫 Suiying Xianyang Gong Fu (遂应场 Suiying Chang was Jinping''s former name). Shortly after, non-local merchants standardized the origin identification to the more broad “Zhenghe Gong Fu” and around the same time other producers around Zhenghe county began making red tea. Tea historians not only see Suiying Xianyang Gong Fu as the progenitor to the entire Zhenghe Gong Fu genre, but also a specified high elevation regional sub-classification under the Zhenghe Gong Fu name, as expressed in its original use of the characters 仙岩 xianyan (literally “mountain immortal”) referring to the pristine, misty, fairy-like, high elevation mountainous terrain of the area around modern day Jinping.

Ancient Heirloom

Like all historic tea production areas that predate the wave of 20th-century advancements in cultivar development propagated through asexual cuttings, Jinping’s tea gardens were comprised of locally adapted heirloom tea bushes grown from seed, with each plant slightly genetically different from its neighboring organisms. This is evident in the complex fragrance and flavor of these teas as well as the unshowy and non-uniform look of the buds on the tippier grades of tea. Cultivars developed for their uniformity and appearance like Da Bai and Da Hao will have a more uniform and distinctively plump bud, a giveaway when visually assessing whether or not a tea has heirloom genetics versus is from a more newly developed cultivar.

Today the majority of Jinping’s ancient tea gardens still consist of descendant tea trees from this heirloom germplasm adapted to this specific environment, left to grow old amongst the natural landscape and continually reseed itself, hosting thousands of century-old tea bushes, with some specimens considered to be over 200 years old. Walking through these tea gardens, one can see many old tea trees growing in rocky terrain, interspersed with generations of naturally propagated offspring. The tea gardens are mostly distributed on the edges of forests dominated by bamboo groves, that rise up steep mountain slopes, with clear streams running through the entire landscape.

Tea leaves from old growth tea trees grown in ecologically diverse, high elevation forested environments like this will have much more amino acids and secondary metabolites, expressing in a more nutritive, complex, smooth, and compelling way than tea grown in full-sun monoculture gardens at lower elevations.

No man’s land

Outside of Southern Yunnan and select pockets of the Phoenix Mountains in Guangdong, pristine old growth tea gardens of this caliber are exceptionally special and rare. How did this small village on the Fujian-Zhejiang come to have so many untouched ancient tea trees?

During the cultural turmoil of the twentieth century when old ways were being uprooted, remote Jinping’s fecund tea gardens survived simply by being forgotten about, and continued to grow old while tea culture and other antiquities were dismantled or made taboo. This neglect is due to the fact that at the time this micro village wasn’t incorporated into a larger township or city—considered a 三不管地帶 “No man’s land”—and therefore mandates to reform industry and livelihoods of that time simply didn’t reach Jinping.

What’s equally as remarkable: during the resurgence of the domestic tea market in the decades around the turn of the century during China’s economic growth period, Jinping’s ancient tea gardens weren’t removed and replaced by newly developed predictably performing cultivars that now dominate that modern tea industry.

These tea trees managed to hang on through these bottlenecks until a time they were valued as what they are: heirloom ancient tea gardens in an exceptionally clean and high elevation mountain area. Jinping’s ancient tea gardens offer a rare look at how precious and timeless heirloom tea environments could have been in eastern China without the cultural upheaval and market demands of the seven or eight decades.

Inheritance

Among the twenty core families producing tea back in the tea-salt road days, the Xu family was the first to incorporate their business. Today the Xu family—either through outright ownership or by heading up a cooperative that shares plots—has access to the majority of the ancient tea gardens of Jinping. Having Jinping’s clean ecology and the related health benefits of drinking tea from this ancient and pristine of an environment at the forefront of their marketing, the Xu family does not use any pesticides on their tea gardens. Not only that, they also don’t use germination-inducing fertilizers either. Even though the tea grows slow and can’t be harvested many times, annually they’re able to take a competitive quantity of tea to market simply because of the sheer amount of tea garden acreage they have access to.

Xu Wu Quan is a seventh generation tea maker and is a county level intangible cultural inheritor of Zhenghe white tea and his brother, Wu Song, is a prefecture level inheritor of the Zhenghe Gong Fu red tea style, both producing tea in Jinping.', 'Jinping Village, Zhenghe, Fujian, China', 'white', 'true_tea', 'medium', 85, 4, 5, 'Use 4g per 150ml at 85–90°C. Steep 3–5 minutes; re-steep several times.', ARRAY['Mellow', 'Resinous', 'Mineral', 'Sweet']::text[], ARRAY[]::text[], '#C8C4B0', 20, 5, 20, 13, 'default', 'Teapp', NULL, TRUE),
  ('Zhenghe Bai Mudan', 'zhenghe-bai-mudan', 'Zhènghé Bái Mǔdān', '政和白牡丹', 'A classy mu dan grade for pleasant sipping that highlights all the best parts of tea from pristine Jinping village wild heirloom gardens.

With a refined and crisp character, this tea is notable in its simplicity, resiliency over many steeps, and by just being super clean, without any unpleasant characteristics. Around the mid-session the tea packs some heft with a full and rich mouthfeel and intriguing aromatics on the gaiwan lid and empty cup. The late steeps can mine deep into a nutritive rich mineral character. Its charm is in its well-balanced understated perfection.

Jinping, a timeless gem

Jinping Village is a small high elevation ancient silver-mining village, and is located in the greater Zhenghe tea producing region just south of the provincial Fujian-Zhejiang border in the Xianxia Mountains at 900 meters elevation. Headwaters coming down from the mountains around Jinping form the crystalline Jinxi River that flows through this village, flowing into the Chongyang, and eventually to the Min river system. Amazingly, Jinping Village and its surrounding wilderness has held onto over 4000 亩 (~650 acres) of ancient seed-propagated heirloom 小菜茶 Xiao Cai Cha tea gardens with most specimens over 100 years old in addition to over 1000 亩 (~160 acres) of naturally managed Zhenghe Da Bai cultivar tea gardens. Tea garden areas range from 900 meters up to over 1300 meters in elevation.

Jinping can trace its tea history back to the early Song Dynasty, some thousand years ago, flourishing in the mid Qing Dynasty, and contributing to the distinction of the greater Zhenghe area as its own tea production zone. During the Qing, Jinping village notably served as a starting as well as relay point on a trade route used to take tea and silver to Fu’an, onto Fuzhou, and then by boat to be traded as Bohea Tea in Canton, modern day Hong Kong, to merchants who would then sail back to Britain, Europe, and the Americas. Usage of this trade route ramped up as the port of Fuzhou was opened up for foreign trade in the mid 1800s. The same porters that relayed tea on their backs and loaded it onto the docks would return to Jinping with exchanged-for salt, giving this trade corridor the name the 茶盐古道 cha yan gu dao “ancient tea salt road”.

红茶 Red Tea Roots

The type of tea traded for and produced in Jinping at the time was primarily 红茶 hong cha or red tea, more commonly known to the global traders it would eventually reach as black tea — likely more specifically Bohea black tea — as the more oxidized teas from the greater northern Fujian / Wuyi Mountain orogeny was broadly known.

Jinping is a core origin for the advent of a regionally specific namesake for red tea from this part of Fujian: Zhenghe Gong Fu Hong Cha. The Gong Fu red tea class of northern Fujian — a triad consisting of Zhenghe Gong Fu, Bailin Gong Fu (in Fuding) Tanyang Gong Fu (in Fu’an) — are now a nearly forgotten about class of reds with a history beginning in the mid-late 1800s that not only predates but greatly inspired Qimen reds in the late 1800s. During these early years, other Zhenghe producers hadn’t yet adapted to making this red tea style being produced in Jinping, and Jinping’s new red tea was called 遂应仙岩工夫 Suiying Xianyang Gong Fu (遂应场 Suiying Chang was Jinping''s former name). Shortly after, non-local merchants standardized the origin identification to the more broad “Zhenghe Gong Fu” and around the same time other producers around Zhenghe county began making red tea. Tea historians not only see Suiying Xianyang Gong Fu as the progenitor to the entire Zhenghe Gong Fu genre, but also a specified high elevation regional sub-classification under the Zhenghe Gong Fu name, as expressed in its original use of the characters 仙岩 xianyan (literally “mountain immortal”) referring to the pristine, misty, fairy-like, high elevation mountainous terrain of the area around modern day Jinping.

Ancient Heirloom

Like all historic tea production areas that predate the wave of 20th-century advancements in cultivar development propagated through asexual cuttings, Jinping’s tea gardens were comprised of locally adapted heirloom tea bushes grown from seed, with each plant slightly genetically different from its neighboring organisms. This is evident in the complex fragrance and flavor of these teas as well as the unshowy and non-uniform look of the buds on the tippier grades of tea. Cultivars developed for their uniformity and appearance like Da Bai and Da Hao will have a more uniform and distinctively plump bud, a giveaway when visually assessing whether or not a tea has heirloom genetics versus is from a more newly developed cultivar.

Today the majority of Jinping’s ancient tea gardens still consist of descendant tea trees from this heirloom germplasm adapted to this specific environment, left to grow old amongst the natural landscape and continually reseed itself, hosting thousands of century-old tea bushes, with some specimens considered to be over 200 years old. Walking through these tea gardens, one can see many old tea trees growing in rocky terrain, interspersed with generations of naturally propagated offspring. The tea gardens are mostly distributed on the edges of forests dominated by bamboo groves, that rise up steep mountain slopes, with clear streams running through the entire landscape.

Tea leaves from old growth tea trees grown in ecologically diverse, high elevation forested environments like this will have much more amino acids and secondary metabolites, expressing in a more nutritive, complex, smooth, and compelling way than tea grown in full-sun monoculture gardens at lower elevations.

No man’s land

Outside of Southern Yunnan and select pockets of the Phoenix Mountains in Guangdong, pristine old growth tea gardens of this caliber are exceptionally special and rare. How did this small village on the Fujian-Zhejiang come to have so many untouched ancient tea trees?

During the cultural turmoil of the twentieth century when old ways were being uprooted, remote Jinping’s fecund tea gardens survived simply by being forgotten about, and continued to grow old while tea culture and other antiquities were dismantled or made taboo. This neglect is due to the fact that at the time this micro village wasn’t incorporated into a larger township or city—considered a 三不管地帶 “No man’s land”—and therefore mandates to reform industry and livelihoods of that time simply didn’t reach Jinping.

What’s equally as remarkable: during the resurgence of the domestic tea market in the decades around the turn of the century during China’s economic growth period, Jinping’s ancient tea gardens weren’t removed and replaced by newly developed predictably performing cultivars that now dominate that modern tea industry.

These tea trees managed to hang on through these bottlenecks until a time they were valued as what they are: heirloom ancient tea gardens in an exceptionally clean and high elevation mountain area. Jinping’s ancient tea gardens offer a rare look at how precious and timeless heirloom tea environments could have been in eastern China without the cultural upheaval and market demands of the seven or eight decades.

Inheritance

Among the twenty core families producing tea back in the tea-salt road days, the Xu family was the first to incorporate their business. Today the Xu family—either through outright ownership or by heading up a cooperative that shares plots—has access to the majority of the ancient tea gardens of Jinping. Having Jinping’s clean ecology and the related health benefits of drinking tea from this ancient and pristine of an environment at the forefront of their marketing, the Xu family does not use any pesticides on their tea gardens. Not only that, they also don’t use germination-inducing fertilizers either. Even though the tea grows slow and can’t be harvested many times, annually they’re able to take a competitive quantity of tea to market simply because of the sheer amount of tea garden acreage they have access to.

Xu Wu Quan is a seventh generation tea maker and is a county level intangible cultural inheritor of Zhenghe white tea and his brother, Wu Song, is a prefecture level inheritor of the Zhenghe Gong Fu red tea style, both producing tea in Jinping.', 'Jinping Village, Zhenghe, Fujian, China', 'white', 'true_tea', 'medium', 85, 4, 5, 'Use 4g per 150ml at 85–90°C. Steep 3–5 minutes; re-steep several times.', ARRAY['Clean', 'Crisp', 'Mineral', 'Balanced']::text[], ARRAY[]::text[], '#C8C4B0', 12, 5, 12, 10, 'default', 'Teapp', NULL, TRUE),
  ('Zhenghe Huangye Bai Mudan', 'zhenghe-huangye-bai-mudan', 'Zhènghé Huāngyě Bái Mǔdān', '政和荒野白牡丹', 'A second pressing of this crowd-pleaser.

Graded as a wild 荒野 huang ye tea, harvested just below the mountain''s summit at 900 meters from an abandoned tea garden recently recovered, processed in traditional fashion, this White Peony 白牡丹 Bai Mu Dan is a no frills example of high-end heirloom white tea.

Jostling the dry leaf around the warmed up gaiwan before the first steep, the nose isn’t so floral. At the time of these notes, the typical peony meadow bouquet has already dropped a bit lower and deeper into aromas of chocolate, cherry, and almond cookie dough. The first couple of steeps yield balanced, clean, mineral-rich forest spring water flavor with a pleasant return sweetness on the sip’s exhale.

Steeping in more, hints of sweet herbs and fresh ironed linens comes off the gaiwan lid as the tea soup’s texture takes on a slightly slippery olive oil thickness. A sweetness starts to stick to the palate and gums in the later steeps, and true to what we love about Zhenghe — what this tea lacks in a fireworks start — it earns back with longevity as more mellowing charm is uncovered as the session progresses.

The Ye family believes these estimated 40-50 year old 政和大白 Zhenghe Da Bai and 福安大白 Fu''an Da Bai cultivar gardens were abandoned by Fuban villagefolk around the turn of the century out of preference for lower, more accessible gardens, and now contain multiple generations of tea plants that naturally seed-propagated, putting that offspring into the category of 小菜茶 xiao cai cha "little veggie tea", a non-cultivar.

The Ye family does not graduate their finishing bake to from low temperature to high. Whereas it''s common in Fuding for tea factories to bake their white teas up to 120°
C (250°
F), depending on the tea, the Ye family keeps their finishing exposure down below 80°
C (175°
F). This lower temperature allows for more leaf enzymes to remain active, ensuring a more rich and expedient transformation as it ages.

Just like in the world of pu’er where buyers go to great lengths to obtain the best material while it’s still available at an affordable rate when it’s young (never a bad call regardless of fresh or aged preference), this tea represents that type of investment acquisition. This one is great sipping now, and if aging is your thing this one is set to transform into something even more magical. When not outright sold out, older vintages of this production from this family sell at a premium. We recommend grabbing at least a couple of cakes just for aging before they’re gone.

reclamation of this abandoned tea garden began in 2018

The tea cake inkwork for this release was penned by our friend Green, a tea friend we met in 2019 during our travels in northern Yunnan', 'Fuban Village, Zhenghe, Fujian, China', 'white', 'true_tea', 'medium', 85, 4, 5, 'Use 4g per 150ml at 85–90°C. Steep 3–5 minutes; re-steep several times.', ARRAY['Mineral', 'Fruity', 'Herbal', 'Sweet']::text[], ARRAY[]::text[], '#C8C4B0', 15, 5, 14, 11, 'default', 'Teapp', NULL, TRUE),
  ('Zhenghe Huangye Shou Mei', 'zhenghe-huangye-shou-mei', 'Zhènghé Huāngyě Shòuméi', '政和荒野寿眉', 'A sublimely clean and elegantly simple white born from abandoned Zhenghe Da Bai and Fu''an Da Bai plants left to grow on the mountainside above rural 富板村 Fuban Village, this leafy Shou Mei white tea harvest was picked April 10th just below the mountain''s summit at 950 meters. Naturally-seeded next generation tea plants now grow "feral" among these tea gardens, considered 小菜茶 xiao cai cha "little veggie tea", a non-cultivar.

Notes reminiscent of steam coming off mineral hot springs, dried and unripe fruits: cherry, green apricot, dried canefruit, figs, herbal liqueur, and almond cookies can be released just by jostling the dry leaf around the warmed gaiwan. As the first steep is poured off the initial fruit and nut tones now drip with a pheromonal herbaceous musk that accompany the smell of freshly ironed linens.

The steeps in the mid session introduces a sweetness that begins to cling to the palate and jowls, while boldening the texture to a juicy mineral-rich soup. Exalted exhales follow thirst-quenching sips with notes of mochi, dew, sweet corn, green apple. This one is like rolling around in a summer meadow sipping on a sun tea of foraged herbs and wildflowers.

The Ye family believes these estimated 40-50 year old gardens were abandoned by the villagers around the turn of the century out of preference for lower, more accessible gardens, and now contain multiple generations of tea plants including some larger specimens indicating tea propagation even prior to the primary remaining ecology.

In a vertical cupping this tea tends to outpace more conventional and lower elevation Shou Meis. Upfront, this tea admittedly isn''t very flashy in its expression like its fertilized plantation counterparts (adding nitrogen inputs before harvest boosts fragrance), rather its strength lies in its elegant simplicity, its deeply nutritive expression, and its durability for a lengthy session.

Just like in the world of pu’er where buyers go to great lengths to obtain the best material while it’s still available at an affordable rate when it’s young (never a bad call regardless of fresh or aged preference), this tea represents that type of investment acquisition. This one is great sipping now, and if aging is your thing this one is set to transform into something even more magical.

reclamation of this abandoned tea garden began in 2018

The tea cake inkwork for this release was penned by our friend Green, a tea friend we met in 2019 during our travels in northern Yunnan.', 'Fuban Village, Zhenghe, Fujian, China', 'white', 'true_tea', 'medium', 85, 4, 5, 'Use 4g per 150ml at 85–90°C. Steep 3–5 minutes; re-steep several times.', ARRAY['Fruity', 'Herbal', 'Mineral', 'Sweet']::text[], ARRAY[]::text[], '#C8C4B0', 18, 5, 16, 12, 'default', 'Teapp', NULL, TRUE),
  ('Zhenghe Yuanya Bai Mudan', 'zhenghe-yuanya-bai-mudan', 'Zhènghé Yuǎnyá Bái Mǔdān', '政和远芽白牡丹', 'An exquisite, tippier heirloom old growth white from one of the higher elevation gardens in an already pristine high altitude remote area. At the onset this tea remains coy in terms of overt flowery aromas, instead staying rich in silky yet crisp textures, sweet vegetation and sun-baked grains, verging on unripe fruit with a gratifying tinge of musk at times.

This tea hails from highest elevation habitat in Jinping, 原始森林, an area simply translating to "primeval forest". Delicate, tippier pickings from old heirloom bushes were brought down from 1300 meters into Jinping to be processed in the traditional style. The Xu family calls this mostly 1 bud - 1 leaf grade from these parts 远芽 yuan ya, or "distant/remote bud"

uneven - even unsightly - buds are an unusual source of encouragement for those seeking heirloom "non-cultivar" teas. Plump, uniform buds in tippier grades signify that the tea comes from a cultivar developed for its appearance.

Jinping, a timeless gem

Jinping Village is a small high elevation ancient silver-mining village, and is located in the greater Zhenghe tea producing region just south of the provincial Fujian-Zhejiang border in the Xianxia Mountains at 900 meters elevation. Headwaters coming down from the mountains around Jinping form the crystalline Jinxi River that flows through this village, flowing into the Chongyang, and eventually to the Min river system. Amazingly, Jinping Village and its surrounding wilderness has held onto over 4000 亩 (~650 acres) of ancient seed-propagated heirloom 小菜茶 Xiao Cai Cha tea gardens with most specimens over 100 years old in addition to over 1000 亩 (~160 acres) of naturally managed Zhenghe Da Bai cultivar tea gardens. Tea garden areas range from 900 meters up to over 1300 meters in elevation.

Jinping can trace its tea history back to the early Song Dynasty, some thousand years ago, flourishing in the mid Qing Dynasty, and contributing to the distinction of the greater Zhenghe area as its own tea production zone. During the Qing, Jinping village notably served as a starting as well as relay point on a trade route used to take tea and silver to Fu’an, onto Fuzhou, and then by boat to be traded as Bohea Tea in Canton, modern day Hong Kong, to merchants who would then sail back to Britain, Europe, and the Americas. Usage of this trade route ramped up as the port of Fuzhou was opened up for foreign trade in the mid 1800s. The same porters that relayed tea on their backs and loaded it onto the docks would return to Jinping with exchanged-for salt, giving this trade corridor the name the 茶盐古道 cha yan gu dao “ancient tea salt road”.

红茶 Red Tea Roots

The type of tea traded for and produced in Jinping at the time was primarily 红茶 hong cha or red tea, more commonly known to the global traders it would eventually reach as black tea — likely more specifically Bohea black tea — as the more oxidized teas from the greater northern Fujian / Wuyi Mountain orogeny was broadly known.

Jinping is a core origin for the advent of a regionally specific namesake for red tea from this part of Fujian: Zhenghe Gong Fu Hong Cha. The Gong Fu red tea class of northern Fujian — a triad consisting of Zhenghe Gong Fu, Bailin Gong Fu (in Fuding) Tanyang Gong Fu (in Fu’an) — are now a nearly forgotten about class of reds with a history beginning in the mid-late 1800s that not only predates but greatly inspired Qimen reds in the late 1800s. During these early years, other Zhenghe producers hadn’t yet adapted to making this red tea style being produced in Jinping, and Jinping’s new red tea was called 遂应仙岩工夫 Suiying Xianyang Gong Fu (遂应场 Suiying Chang was Jinping''s former name). Shortly after, non-local merchants standardized the origin identification to the more broad “Zhenghe Gong Fu” and around the same time other producers around Zhenghe county began making red tea. Tea historians not only see Suiying Xianyang Gong Fu as the progenitor to the entire Zhenghe Gong Fu genre, but also a specified high elevation regional sub-classification under the Zhenghe Gong Fu name, as expressed in its original use of the characters 仙岩 xianyan (literally “mountain immortal”) referring to the pristine, misty, fairy-like, high elevation mountainous terrain of the area around modern day Jinping.

Ancient Heirloom

Like all historic tea production areas that predate the wave of 20th-century advancements in cultivar development propagated through asexual cuttings, Jinping’s tea gardens were comprised of locally adapted heirloom tea bushes grown from seed, with each plant slightly genetically different from its neighboring organisms. This is evident in the complex fragrance and flavor of these teas as well as the unshowy and non-uniform look of the buds on the tippier grades of tea. Cultivars developed for their uniformity and appearance like Da Bai and Da Hao will have a more uniform and distinctively plump bud, a giveaway when visually assessing whether or not a tea has heirloom genetics versus is from a more newly developed cultivar.

Today the majority of Jinping’s ancient tea gardens still consist of descendant tea trees from this heirloom germplasm adapted to this specific environment, left to grow old amongst the natural landscape and continually reseed itself, hosting thousands of century-old tea bushes, with some specimens considered to be over 200 years old. Walking through these tea gardens, one can see many old tea trees growing in rocky terrain, interspersed with generations of naturally propagated offspring. The tea gardens are mostly distributed on the edges of forests dominated by bamboo groves, that rise up steep mountain slopes, with clear streams running through the entire landscape.

Tea leaves from old growth tea trees grown in ecologically diverse, high elevation forested environments like this will have much more amino acids and secondary metabolites, expressing in a more nutritive, complex, smooth, and compelling way than tea grown in full-sun monoculture gardens at lower elevations.

No man’s land

Outside of Southern Yunnan and select pockets of the Phoenix Mountains in Guangdong, pristine old growth tea gardens of this caliber are exceptionally special and rare. How did this small village on the Fujian-Zhejiang come to have so many untouched ancient tea trees?

During the cultural turmoil of the twentieth century when old ways were being uprooted, remote Jinping’s fecund tea gardens survived simply by being forgotten about, and continued to grow old while tea culture and other antiquities were dismantled or made taboo. This neglect is due to the fact that at the time this micro village wasn’t incorporated into a larger township or city—considered a 三不管地帶 “No man’s land”—and therefore mandates to reform industry and livelihoods of that time simply didn’t reach Jinping.

What’s equally as remarkable: during the resurgence of the domestic tea market in the decades around the turn of the century during China’s economic growth period, Jinping’s ancient tea gardens weren’t removed and replaced by newly developed predictably performing cultivars that now dominate that modern tea industry.

These tea trees managed to hang on through these bottlenecks until a time they were valued as what they are: heirloom ancient tea gardens in an exceptionally clean and high elevation mountain area. Jinping’s ancient tea gardens offer a rare look at how precious and timeless heirloom tea environments could have been in eastern China without the cultural upheaval and market demands of the seven or eight decades.

Inheritance

Among the twenty core families producing tea back in the tea-salt road days, the Xu family was the first to incorporate their business. Today the Xu family—either through outright ownership or by heading up a cooperative that shares plots—has access to the majority of the ancient tea gardens of Jinping. Having Jinping’s clean ecology and the related health benefits of drinking tea from this ancient and pristine of an environment at the forefront of their marketing, the Xu family does not use any pesticides on their tea gardens. Not only that, they also don’t use germination-inducing fertilizers either. Even though the tea grows slow and can’t be harvested many times, annually they’re able to take a competitive quantity of tea to market simply because of the sheer amount of tea garden acreage they have access to.

Xu Wu Quan is a seventh generation tea maker and is a county level intangible cultural inheritor of Zhenghe white tea and his brother, Wu Song, is a prefecture level inheritor of the Zhenghe Gong Fu red tea style, both producing tea in Jinping.', 'Jinping Village, Zhenghe, Fujian, China', 'white', 'true_tea', 'medium', 85, 4, 5, 'Use 4g per 150ml at 85–90°C. Steep 3–5 minutes; re-steep several times.', ARRAY['Silky', 'Crisp', 'Grainy', 'Musk']::text[], ARRAY[]::text[], '#C8C4B0', 10, 5, 10, 9, 'default', 'Teapp', NULL, TRUE),
  ('Fuding Lao Cong Bai Mudan', 'fuding-lao-cong-bai-mudan', 'Fúdǐng Lǎo Cōng Bái Mǔdān', '福鼎老枞白牡丹', 'The annual return of a peony grade white tea from impressive, old bushes in the Guanyang area of Fuding. Guanyang is a bit more inland and higher elevation, on the outskirts of the core production area of Fuding.

Less overt in its outer expression, Chen’s teas all contain a thick textured and layered sweetness that lies ‘underneath’ the eq that most teas express at. In a scene that favors immediate top notes, this underneath fullness sets his teas apart of the typical Fuding processing. IMO, this deeper fullness gives Chen’s teas a leg up in terms of ageability, and doesn''t disappoint in its fresher, less-aged years either.

Comparing to other year-of whites often presenting as quite green, it’s clear that Chen allows for a bit more oxidation to set in before drying.

Chen, who comes from a family with an astounding 30 generations of tea farming, is the main subject of the later half of this docu-series episode:

The tea cake inkwork for this release was penned by our friend Green, a tea friend we met in 2019 during our travels in northern Yunnan', 'Guanyang, Fuding, Fujian, China', 'white', 'true_tea', 'medium', 85, 4, 5, 'Use 4g per 150ml at 85–90°C. Steep 3–5 minutes; re-steep several times.', ARRAY['Thick', 'Layered', 'Sweet', 'Fruity']::text[], ARRAY[]::text[], '#C8C4B0', 15, 5, 18, 12, 'default', 'Teapp', NULL, TRUE),
  ('Lao Man''e Guoyoulin Sheng', 'lao-man-e-guoyoulin-sheng', 'Lǎomàn''è Guóyǒulín Shēng', '老曼峨国有林生茶', 'A more elegant side of Lao Man’e

Due to several factors, this Lao Man’e tea presents a more diplomatic and elegant expression of a region usually prized by slightly masochistic pu’er heads for its punchy bitterness. Coming together to produce a sweeter, gentler take on the famed “Laphroaig of Pu’er” are the following:

•
Elevation and ecosystem. Village leader Wen Kan has access to the state-owned 国有林 Guoyoulin forest, resting some 500 meters above the village. This higher altitude yields a naturally sweeter soup, richer in amino acids.

•
Tree genetics. While the village below averages a 50/50 split between sweet and bitter varieties, this tract leans more heavily sweet, closer to an 70/30 ratio.

•
Tea processing. Wen Kan fires the woks at a lower heat—260°C—producing a mellower, sweeter tea. Higher temperature shaqing create greener teas, trading aging potential for immediate aromatics and huigan. With its refined, counterbalancing profile, this tea stands apart from the typical Lao Man’e character: special now, and even more so as enzymes transform with age.

Wen Kan discussing how to identify the sweet vs bitter variety tea trees

exploring the Guoyoulin state owned forest area

the ku cha is palate slayingly bitter. Video coming soon that will outline the differences between it and tian cha.

Lao Man’e: Bitter and Sweet

老曼峨 Lao Man’e, the oldest village in the Bulang Mountains with a history of roughly 1400 years, remains a bastion of Theravada Buddhism. It hosts some of the largest and oldest ancient arbor landscapes in the region, with over 500 acres (3200 亩) of gushu trees ranging from 100–500 years old. Its elevation is about 1300 meters—modest for a renowned tea village.

Lao Man’e tea is defined its two endemic varieties: 苦茶 ku cha “bitter tea” and 甜茶 tian cha “sweet tea”. Both can be found across the Banzhang villages. If you’ve had tea from Lao Banzhang or Bakanan, which contain a predominance the sweet variety, you’ve tasted tian cha. Admittedly, this “sweet” type isn’t exceptionally sweet, and can itself become bitter when brewed strong; its name seems more a functional contrast to ku cha than a literal description.

While other villages show traces of ku cha, Lao Man’e is its stronghold—many teas there are intensely bitter. This bitterness was highly valued by the state-owned factories of the 20th century, who blended it for its ability to age into a potent, slightly sweeter, medicinal broth.

contender for this year''s hairiest, prettiest cake

typo alert: the producer is not Da E + family. It should say Wen Kan!', 'Lao Man''e Village, Bulang Mountain, Menghai, Xishuangbanna, Yunnan, China', 'sheng_puerh', 'true_tea', 'medium', 95, 1, 8, 'Use 5g per 150ml at 95–100°C. Rinse once; steep 20–30 seconds; re-steep 8+ times.', ARRAY['Sweet', 'Elegant', 'Mineral', 'Floral']::text[], ARRAY[]::text[], '#DBBC70', 20, NULL, 25, 65, 'default', 'Teapp', NULL, TRUE),
  ('Wangong Gu Shu Sheng', 'wangong-gu-shu-sheng', 'Wāngōng Gǔshù Shēng', '弯弓古树生茶', 'Good teas often contain a paradox, great teas entice with several.

In the big league ranks of the connoisseur micro terroirs of eastern Mengla county, Wangong represents wild jungle charm, only attainable on the other side of a long hero’s journey into the wilderness and back. The outposts that comprise what is now considered the larger Wangong area are situated centrally in the zone that has been described as having the best wild flower flavor/fragrance of greater area Yiwu teas. Not to mention a superb chaqi experience on the body and mood.

an oft proliferated yet controversial map

At the session’s start, Wangong yields an impossibly soft, gentle soup on top of a solid mouthfeel structure with succinct, vivid floral notes. These tones contain a sweet bouquet profile of wild magnolia, mallow, with vanilla on the exhale. The flavor and aroma are well layered in the soup and reward slowing down to roll it around to unlock them before taking a gulp down.

Mid session shows a bready, green fruit character whose liquid stays as thick and smooth as olive oil. With most teas getting this level of thickness typically means announcing it alongside a cacophony of other elements, Wangong quietly delivers heavy tingles at ASMR levels. This is precisely what keeps big six tea mountains of Mengla county heads loyal, often unable to even acknowledge hinterland tea mountains, considering them brash by comparison.

Whispering yet uncompromising, Wangong finds refined elegance in a vast and rugged wilderness.

The Hé family are descendants of Han tea traders that came to Yiwu in the 1700s, and are eight generations deep into making in-roads into the local minority groups and geographies, not only developing tea production techniques but playing a role in shaping the pu''er tea industry as a whole. The Hé family is highly respected in Yiwu and their patriarch, Hé Tianneng, is centrally featured in Zhang Jinghong''s book on pu''er tea, Ancient Caravans and Urban Chic.

Hé family connections in these mountains are always reliable, and in this Wangong''s case, they''re especially clutch. Hé Xinping''s father-in-law happens to reside in 杨家寨 Yangjiazhai within Wangong, and has access to fresh leaves around the wilderness tea gardens of the 弯弓大庙 Wangong da miao Temple area. These old ruins were once the Temple Guandi, built by the Han in the Qing Dynasty. It was said to be the largest in the original six great tea mountains at 6,000 square meters—covering nearly an acre and a half—only to have since been almost entirely swallowed up by the jungle.

While fresh raw leaves from neighboring micro terroirs within Wangong from Yao minorities are often traded at rates exceeding what even dried arbor mao cha is from other famous mountains and villages, thankfully the old father-in-law connect provide a more stable rate not as susceptible to the crypto-esque hype fluctuations we''ve witnessed in the market over the last decade. Please enjoy this tea.', 'Wangong, Yiwu, Mengla, Xishuangbanna, Yunnan, China', 'sheng_puerh', 'true_tea', 'medium', 95, 1, 8, 'Use 5g per 150ml at 95–100°C. Rinse once; steep 20–30 seconds; re-steep 8+ times.', ARRAY['Floral', 'Thick', 'Smooth', 'Vanilla']::text[], ARRAY[]::text[], '#DBBC70', 20, NULL, 22, 70, 'default', 'Teapp', NULL, TRUE),
  ('Ban Pen Mao Cha', 'ban-pen-mao-cha', 'Bān Pén Máochá', '毛茶', 'Of all the Banzhang Villages that get to benefit from the legendary name and proximity, none is closer to Lao Banzhang than the one that actually isn''t considered in the main five — Ban Pen. For some reason Ban Pen is classified under Hekai administratively.

Ban Pen is only about a mile and a half as the crow flies from Lao Banzhang and essentially shares the same backyard (some tea gardens). Surely over the years much of what the market has been duped into thinking was Lao Banzhang has actually been Ban Pen all along. For all these reasons, Ban Pen has been dubbed "poor man''s Lao Banzhang" as their character is nearly identical as they share the same terroir.

Mr. Yang''s sister has some old growth tracts there that produce some nice tea. Old R&L heads might remember cakes of autumn 2021 and spring 2022 making a showing in the shop a number of years ago now.

This one''s processing is quite "green" — the greenest of the Yunnan Field Trip lot, carrying a bright + fragrant profile, produced by trendy high heat wok treatment that thoroughly denatures enzymes that would typically remain active to then later oxidize and mellow. Just like you get to decide if the hype is worth it by trying out LBZ, you might also want to see if all the bad press on greener pu is warranted.

The recent youtube documentary episode on the Banzhang Villages discusses green pu''er processing. What do you think?', 'Ban Pen, Hekai, Menghai, Xishuangbanna, Yunnan, China', 'sheng_puerh', 'true_tea', 'medium', 95, 1, 8, 'Use 5g per 150ml at 95–100°C. Rinse once; steep 20–30 seconds; re-steep 8+ times.', ARRAY['Bright', 'Fragrant', 'Green', 'Sweet']::text[], ARRAY[]::text[], '#DBBC70', 12, NULL, 18, 60, 'default', 'Teapp', NULL, TRUE),
  ('Dinghu Alishan Oolong', 'dinghu-alishan-oolong', 'Dǐnghú Ālǐshān Wūlóng', '頂湖烏龍茶', 'Succulent, sweet, and without a doubt the most fruity of this year''s lot, the charming and approachable character of Ali Shan is well-aspected through the unique combination of variables Mr. Zhan’s tea presents: some of the highest elevations in the greater Ali Shan area, exceptionally clean and diverse ecological conditions, as well as special processing designed with the tea’s natural characteristics in mind.

Lush forested surroundings of the 頂湖 Dinghu area in Ali Shan give way to just a handful of tidy Qing Xin cultivar hectares at a cool, mossy, misty 1660 meters in elevation. A chance connection forged originally by receiving insider recommendations from folks in the organic fertilizer industry, you can read more about the fated encounter with the Zhan family of Dinghu during our spring 2023 Taiwan trip here.

the high elevation forests of Dinghu, surrounding the Zhan tea gardens

Though Mr. Zhan has excellent resources and skills, he doesn''t put his high mountain oolongs in competitions. He maintains a classic processing style that has slowly evolved over the years to better accentuate the specific materials he works with. This approach gives to us an Ali Shan style dialed into its assignment, yet refreshingly distinct from the modern competition iterations. Most of Mr. Zhan’s clients are old school tea drinkers that have been loyal to the family for decades, since his father''s time. We feel very privileged to access his teas and continue working with this family in the future.', 'Dinghu, Alishan, Chiayi County, Taiwan', 'oolong', 'true_tea', 'medium', 95, 1, 6, 'Use 5g per 150ml at 95–100°C. Quick rinse; steep 20–40 seconds; re-steep 5–7 times.', ARRAY['Fruity', 'Sweet', 'Floral', 'Buttery']::text[], ARRAY[]::text[], '#D4852A', 25, 8, 18, 28, 'default', 'Teapp', NULL, TRUE),
  ('Fushou Shan Oolong', 'fushou-shan-oolong', 'Fúshòushān Wūlóng', '福壽山烏龍茶', 'Hailing from one of the most respected high elevation heritage tea gardens in Taiwan and in short supply, tea from Fushou Shan is the gemmiest of gems. Expect a forward, bright, buttery nectar of melon and sugar snap pea on the palate complementing its aromatic intensity. Exquisite structure, mouthfeel, and lingering exhale effects in the throat and mouth.

Just under 5,000 kilos is harvested in the spring at Fu Shou Shan from just 30 acres of 45 year old Qing Xin cultivar bushes between 2200-2500 meters in elevation, making this the second highest gardens next to the remaining Da Yu Ling gardens that weren’t removed between 2011-2016 due to not following land-use regulations. Fushou Shan is considered 自然農法 “natural farming” or uncertified organic, as these higher elevations don’t necessitate extensive pest control; all-natural insect preventatives are applied twice per year, and no chemical fertilizer is used.

Since our first meeting them, the Chen family has gained in their influence in Li Shan and has been partnering with Fushou Shan Farms these last few years to harvest leaves at 2300 meters and process them in their award-winning style. After sampling the tea for a number of seasons to consistently good results, it seems like the time to offer this year''s limited batch to the tea community.

Fushou Shan Farms was founded in 1957 in the greater Li Shan area by the Veterans Affairs Council of Taiwan for retired military folk that choose to work in agriculture, mainly growing fruit and tea. Its reputation as a high elevation destination for nature-proximal living, high quality natural farm products, and goodwill towards veteran elders precedes itself.

Enjoy this top shelf tea while it''s here. Bundle it with the rest of the Taiwan Series for bit of a discount and taste tour through the mountains and varied styles of Taiwan''s oolong culture.', 'Fushou Shan, Li Shan, Taichung, Taiwan', 'oolong', 'true_tea', 'medium', 95, 1, 6, 'Use 5g per 150ml at 95–100°C. Quick rinse; steep 20–40 seconds; re-steep 5–7 times.', ARRAY['Buttery', 'Melon', 'Floral', 'Bright']::text[], ARRAY[]::text[], '#D4852A', 22, 5, 16, 30, 'default', 'Teapp', NULL, TRUE),
  ('Huoshan Wild Huangya', 'huoshan-wild-huangya', 'Huòshān Huāngyě Huángyá', '霍山荒野黄芽', 'Dasha''s favorite tea of the year: huang ya grade old bush material from wild gardens dry yellowed to an exquisite profile that she thinks is some of her best work.

This one checks a silly amount of pedigree boxes: old bush, wild/feral, seed grown quntizhong, delicate pickings, high elevation, 100% handmade. Even though this tea''s price was substantially more than I''d like, this one is an absolute treasure and rarity that couldn''t be passed on. Not as umami as this year''s wet-yellowed huang ya, but more bold, textured, fragrant, and clear.

Having made the pilgrimage to off-the-beaten-path Huoshan to stay with, assist, and learn from rebel purist Dasha twice now—with a bit more trust earned and dues paid—I feel privileged to access Dasha''s more full range of teas with a greater understanding of what goes into them. Dasha and family exclusively produce tea in micro batches, with a three person crew harvesting in the mountains most days of the week in the spring, with 100% hand-processing and intensive yellowing overseen back in their home factory unit in Da Hua Ping township.

Unconvering Living Traditions in a Buyers Beware Market

The 芽 Yá in Huang Ya means “bud,” referring to the tippy end of the picking spectrum. While apparently up to six picking standards can still be classified as Huoshan Huang Ya before tipping into the leafier categories of Huang Xiao Cha and Huang Da Cha, this particular Yellow Bud follows the most common market standard: one bud, one leaf.

Most Huang Ya from Huoshan is machine-straightened into needle-like shapes to match the market’s expectation of what a tea with “芽” in the name should look like. However, in Dasha’s case, her teas are handmade and intentionally unshaped, allowing the bud and leaf to sit naturally in their splayed form. The result is a coarser, non-uniform appearance compared to the market''s typical machine-straightened Huang Ya (see below).

Like other yellow teas from the few pockets in China where the tradition still hangs on, Huoshan’s Huang Ya suffers from widespread counterfeiting and corner-cutting. But Huoshan in particular has become notorious, with producers passing off cheap green tea—or teas with only the faintest yellowing—as the real thing under the more lucrative Huoshan Huang Ya label. Fresher, greener, and earlier-to-market spring teas are easier to sell and appeal to a broader audience. As a result, the slower, more complex, and more expensive world of true yellow tea has largely taken a back seat. Traditionally, harvest in Huoshan begins in mid-April or later—around 谷雨

gǔyǔ "grain rain" in the Chinese almanac. Proper yellowing and finishing pushes many of these teas to market by mid-to-late May—long after most buyers have wrapped up their spring tea shopping.

The on-the-ground reality is that machine-made, straightened green yellow tea has become the default in Huoshan—and even mediocre Huang Ya sells for a relatively high price. Some estimate that 99% of what’s sold as Huoshan Huang Ya is not the real thing.

Knowing this, I understood that finding the genuine article wouldn''t be easy. The original story is told in this video here. I wanted to understand what went into crafting a true yellow tea, so during my most recent visit with Dasha, I documented the full process. After harvest, withering, and pan-frying, the tea is prepared for either gàn mèn 干

闷 dry-yellowed or shī mèn 湿闷

wet-yellowed.

This particular Huang Ya is dry-yellowed, outlined below. For those curious about the wet-yellowing process, check out this year''s wet yellow Huang Ya.

Dasha''s Dry Yellowing

Yellowing or 闷黄 men huang "covering-

yellow" is the critical step that defines yellow tea, without which the tea would be considered green tea as the processes are identical otherwise. Dry yellowing is less moisture-rich and therefore not as risky form of men huang. It is also the best way to preserve and deepen good fragrance characteristics. After harvesting, withering, and pan-frying (rolling/bruising is entirely skipped for her delicate teas not as robust as Big Yellow Leaf), the hot and moist leaves are taken off of the wok, left piled during a lunch break before being exposed to a brief charcoal heat. This charcoal heat is not about roasting, but more about drying to control the moisture level for the next step.

This brief charcoal heat will dry out the leaves to a determined amount of moisture before being covered. While the percentage of moisture is higher in wet-yellowing and therefore this brief drying via charcoal heat is skipped, this step is essential to ensure the proper humidity for dry-yellowing.

Similar in green tea, during the pan-frying phase enzymes responsible for oxidation are deactivated via exposure to the wok''s heat. The covering of the warm and moist leaves that occurs in the nearly anaerobic environment under linen fabric transforms the leaves by dampening some of the greener catechin (bitter/bright/fragrant) profile of the leaves into a more mellowed, sweeter, less-bitter and yellow-hued tea. The transformation into such a profile typically would take place through enzymatic browning (the oxidation of the enzyme polyphenol oxidase and peroxidase) akin to what we see in red tea, yet since deactivation of these enzymes has already occurred in this process, yellowing relies on a mild Maillard Reaction (polymerization of sugars and amino acids to produce a caramelization effect) as well as an incomplete polyphenol autoxidation (the non-enzymatic oxidation of catechins into mild theaflavins and thearubigins).

L-Theanine and its corresponding flavor umami is preserved through the yellowing process. This is notable since L-Theanine and other amino acids are not well preserved through other forms of oxidation.

Dasha''s tea leaves are covered during her dry yellowing for about 5-7 days, gradually reducing the moisture content down to about 30% before final charcoal firing. Throughout this time, the tea is periodically uncovered, de-clumped, turned, and recovered as to evenly allow the yellowing the set in. Each day the tea is assessed visually and by smell, and brief charcoal heat is applied to ward away any unwanted characteristics. Each batch is different, and factors such as picking grade (density of tea material), weather, and batch size contribute to the variable time each tea spends yellowing.

Dasha decides whether a batch is to be dry or wet yellowed depending on the characteristics of its tea garden. Gardens producing material with distinctive aromas (as well as tippier grades in general) are usually destined for dry yellowing as to preserve and accent fragrance. Bolder flavors + mouthfeel and astringency in material are good candidates for wet yellowing.

After yellowing, the final step is a series of charcoal baking/drying called zhuang huo 壮火 "fire strengthening" that stabilizes the yellowing, perks up its aromatics, and dries it for storage-stability. It''s a set of three exposures to charcoal heat of increasing time and temperature ending with a crush test of the leaves; if the leaves can be crushed between the fingers into dust, it''s dry enough.

Throughout Dasha''s entire handmade process, no electrical outlet is needed. There''s not a single machine used.

Dasha''s brother Ocean guided our rigorous hike up to the family Tianji "skyrim" heirloom gardens resting at 200-300 meters higher than Huoshan''s more famous Jinjishan, the area''s core production region

Exploring the Gardens

The steep trail''s grade only broken by the intermittent creek crossing, we hiked with our socks pulled up over our pant legs to avoid the area''s leaches inhabiting the damp leaf litter beneath the bamboo groves waving gently overhead. A sweaty yet somehow serene hour-long trek later, we had finally reached Tianji tea gardens, Dasha''s family''s heirloom tea gardens that sprawl up the back of a mountainside to an impressive 960 meters in elevation. We eventually came out onto the cliffside to peer down at Jinjishan, the area''s most promoted core production tea area, resting some 300 meters below. Tianji translates to "skyrim" and this is why: in this bamboo covered mountainous landscape corner of Huoshan County only the massive granite bluff—Bai Lian Cliff—separating Skyrim from Jinji reaches taller.

At an earlier time, these Tianji gardens were left to grow feral, unpruned and self-seeding, likely during a time when the market couldn''t consistently pay a price for such a strenuous trek up the mountain to be worth it. No longer neglected, Dasha and her family reclaimed this garden twenty years ago, thinning out the wilderness that had engulfed it, and planted some new bushes by seed. These bushes are never sprayed or chemically fertilized. Bushes estimated to be 100 years old towards the top of Tianji give us a glimpse into the history of tea activity of this micro terroir, and Dasha thinks these older specimens were grown from Qimen County seeds brought up from further south in the province.

filming in an overgrown and older section of Tianji. This is the plot from which this tea was harvested.

Dasha'' two workers + her brother and a student are the harvesting crew for the day

Documenting the process from start to finish, from garden ecology, harvesting, processing, finishing, to drinking, deepened my respect for not just for a dying artform—traditional yellow tea—but of Dasha''s adherence to clean, integral, handmade tea; as high a caliber as you can find anywhere and which can only be achieved through committing to producing tea in micro-batches.

Not much of this tea exists. Treat yourself!

another glance at the old wild bushes', 'Dahuaping, Huoshan, Lu''an, Anhui, China', 'yellow', 'true_tea', 'medium', 85, 2, 4, 'Use 3g per 150ml at 85°C. Steep 2 minutes; re-steep up to 4 times.', ARRAY['Bold', 'Fragrant', 'Nutty', 'Textured']::text[], ARRAY[]::text[], '#E6C84E', 15, 25, 25, 15, 'default', 'Teapp', NULL, TRUE),
  ('Lao Chuan Huang Da Cha', 'lao-chuan-huang-da-cha', 'Lǎochuān Huángdàchá', '老川黄大茶', 'An ideal easy sipping yellow, good on the wallet and whatever brewing method you throw at it.

The most robust grade of yellow tea from the core production region atop legendary Meng Ding Mountain, crafted by intangible cultural heritage inheritor Li Hanmin. Expect a full-bodied, honeysuckle-nectarine laden broth—curiously reminiscent of raw young Liu Bao from one angle, and light-roast southern Fujian oolong from another. This one features a lighter touch on the yellowing compared to this year''s Little Yellow and therefore retains a more fragrant forward nose and complex texture in the jowls.

Purely a craftsman, Master Li doesn''t have tea gardens of his own so he secures his harvests with select farmers, including our friends the Guo family, who we have been working with since 2019. The Guo family primarily manage Fuxuan no. 9 cultivar gardens as well as the rare regional heirloom Lao Chuan Cha, both at higher than average elevations for the area: between 800-1100 meters. Teas in the Sichuan basin flush early—some bushes at lower elevations are ready for harvest as early as February—and while second flushes elsewhere might appear mid-May, their Fuxuan no. 9 gardens can easily see a second harvest late March. The first flush is naturally devoted to Gan Lu production, but this second harvest proves ideal for leafier grades teas like this Huang Da Cha. 1 bud, 2-3 leaves are plucked, and any woody stems are discarded.

Processing follows the labor-intensive 三炒三闷 "three pan-fries, three coverings" method that defines Meng Ding yellow tea. After initial withering and sorting, the leaves go through multiple rounds of pan-firing and warm, humid wrapping—a wet-heat process that encourages internal transformation and gradual yellowing. The timing and temperature of each round are adjusted based on how the leaves respond, with the full process lasting anywhere from five days to nearly a month. This careful, layered technique deepens the tea’s sweetness, softens its bitterness, and yields a mellow, toasty complexity unique to well-made yellow teas.

Tea material from select gardens, crafted by a recognized master, usually comes at a premium. While the industry’s focus on small-pluck early spring teas from Meng Ding and the broader Sichuan basin may be problematic for many reasons, one silver lining is the relatively undervalued status of later-harvest, leafier teas.

award decorated veteran

Vanishing Breed

Meng Ding teas aren''t currently defined by originating from a single cultivar. A 2023 study by Guo, Wang, and Li studied the 12 main cultivars used to produce Gan Lu and found that Lao Chuan Chá (Old Sichuan tea) and 福选 9 号 Fú xuǎn 9 hào (Fuxuan no.9) to be the most ideal cultivars. Likely due to the sheer diversity found in the plurality of distinct specimens, tea made from Lao Chuan Cha gardens scored exceptionally high in flavor compounds such as polyphenols, EGCG, and water-soluble extracts as well as overall preferred taste and aroma, exhibiting a rare balance in flavor expression despite a high phenol-to-amino acid ratio (usually presenting as bitter or astringent) without any bite. Whereas all other cultivars used to make Gan Lu comprise genetically identical tea gardens due to being asexually planted as cuttings for predictable yield and flavor expression, Lao Chuan Cha refers to seed-propagated tea plants in the diverse heirloom gene pool that has existed in the area for untold ages. In other words, in gardens of other cultivars, the tea is the same from bush to bush, whereas in Lao Chuan Cha gardens each tea bush is unique and contains heritage Sichuan genetics.

The problem with Lao Chuan Cha is that in a market that celebrates tea from the humid Sichuan basin as China’s earliest to market tea (with some iterations being sold by mid-February), this old heirloom flushes over a month later due to these antiquity genetics as well as its typically high elevation, colder environs. Due to genetic differences from bush to bush, harvest times are unpredictable and oftentimes a day’s pickings are not uniform. Yield is generally lower with each plant producing overall less buds than other cultivars, and often only flushing once during the spring. This frustrating lack of flexibility and efficiency in production scheduling, lower overall yield, and missing out of early-season markets has driven many tea producers to uproot their Lao Chuan Cha bushes and replace it with more predictable and profitable cultivars.

Tragically, Lao Chuan Cha is now considered a rare and precious boutique resource as it comprises only 2.5% of the Mengshan tea region.', 'Meng Ding Mountain, Ya''an, Sichuan, China', 'yellow', 'true_tea', 'medium', 85, 2, 4, 'Use 3g per 150ml at 85°C. Steep 2 minutes; re-steep up to 4 times.', ARRAY['Full-bodied', 'Honeysuckle', 'Toasty', 'Mellow']::text[], ARRAY[]::text[], '#E6C84E', 20, 30, 30, 16, 'default', 'Teapp', NULL, TRUE),
  ('Long Feng Xia Oolong', 'long-feng-xia-oolong', 'Lóng Fèng Xiá Wūlóng', '龍鳳峽烏龍茶', 'The return of an annual favorite and our sixth year offering this tea, the Yung family''s high mountain oolong is a treat for the senses as always. Cooling, thick, rich, herbaceous, and mellow, this tea delivers a 頂級 dǐngjí top tier oolong experience, and the most amino acid (umami-tasting) rich tea of all our high mountain offerings.

The Yung family was part of the first wave of 5 core families to settle the higher climes of 杉林溪 Shān Lín Xī at a now prestigious area known as 龍鳳峽 Lóng Fèng Xiá ("Dragon Phoenix Gorge") in the early 1980s. This area is well-aspected due to elevation (1850 meters), crosswind activity, and latitude for growing exceptional high mountain oolong. Morning winds push clouds up the gorge to enshroud the highest slopes with a thick cloud cover almost all day, subduing the growth of the leaves, producing thicker cell walled, mineral-rich, sweeter leaves with notable resiliency to strong brewing. The Yung family like to naturally fertilize with fermented dairy products like yogurt to express more of the milkier cooling tones of their high elevation tea.

The nearly perpetual mists attenuate photosynthesis so amino acids like l-theanine are not as readily converted to catechins, making for a dense, mellow, umami soupbroth that won’t give way to bitter flavors with astringent action in the mouth and throat.

To render these leaves into their buttery cloud nectar form you have to have serious skill. Because of the consistent moisture in the cloudcover, the most advanced withering-agitation step regimens we’ve ever come across are being practiced at the top of Long Feng Xia. If the excessive moisture isn’t gently shepherded out of the leaves by multiple, specifically-timed steps, the batch will spoiled.

Masters of these techniques, the Yung family allow us to taste some of the choicest high mountain teas the greater Shan Lin Xi area can produce.

The peak across the gorge called 草坔 Cǎo dì (1900 meters), the only place higher in Shan Lin Xi than the Yungs 17 acre operation (at 1850 meters) where I took this photo

sufficient gentle agitation 浪菁 Làng jīng was an all day affair, and was considered successful when the leaves no longer smelled vegetal, but smelled sweeter and fruitier, like green apple.', 'Long Feng Xia, Shan Lin Xi, Nantou County, Taiwan', 'oolong', 'true_tea', 'medium', 95, 1, 6, 'Use 5g per 150ml at 95–100°C. Quick rinse; steep 20–40 seconds; re-steep 5–7 times.', ARRAY['Cooling', 'Umami', 'Thick', 'Herbaceous']::text[], ARRAY[]::text[], '#D4852A', 25, 8, 17, 27, 'default', 'Teapp', NULL, TRUE),
  ('Luo Shui Dong Mao Cha', 'luo-shui-dong-mao-cha', 'Luò Shuǐ Dòng Máochá', '毛茶', 'It must have been 3 or 4 years since tea from Luo Shui Dong, a revered core village of Yiwu Mountain, has been in the shop. The He family of Yiwu were founding members of their cooperative that manages tea resources from select gardens of ancient trees in Luo Shui Dong. Elegant and classy.

落水洞 Luò Shuǐ Dòng is a 270 hectare growing area resting at 1300-1450 meters in elevation about 10 kilometers north of Yiwu town, just southwest of Mahei. While Luo Shui Dong and Mahei are like conjoined twin growing areas geographically side by side, there are some key differences in their teas'' expressions. Luo Shui Dong has a higher floral fragrance with a well balanced and complex mouthfeel. Mahei has more of a honey-like aroma and an expansive mouthfeel, bold and juicy with less astringency.

He Xinping at the gates', 'Luo Shui Dong, Yiwu, Mengla, Xishuangbanna, Yunnan, China', 'sheng_puerh', 'true_tea', 'medium', 95, 1, 8, 'Use 5g per 150ml at 95–100°C. Rinse once; steep 20–30 seconds; re-steep 8+ times.', ARRAY['Floral', 'Elegant', 'Balanced', 'Sweet']::text[], ARRAY[]::text[], '#DBBC70', 15, NULL, 22, 68, 'default', 'Teapp', NULL, TRUE),
  ('Meng Ding Huang Xiao Cha', 'meng-ding-huang-xiao-cha', 'Méngdǐng Huángxiǎochá', '蒙顶黄小茶', 'The result of a request to go heavier than usual on the yellowing process. Yellow tea cultural inheritor Li Hanmin made this batch out of the Guo family''s Fuxuan No. 9 cultivar gardens'' second flush, producing an entertaining but uncomplicated yellow giving refreshing notes of creamed honey, cucumber/melon rind, with a hydrating mouthfeel with a loose and round texture.

The intensive yellowing process, followed by charcoal baking, initiates a mild Maillard Reaction—a type of non-enzymatic browning akin to caramelization, as found in bread crusts, coffee, chocolate, and ghee.

Purely a craftsman, Master Li doesn''t have tea gardens of his own so he secures his harvests with select farmers, including our friends the Guo family, who we have been working with since 2019. The Guo family primarily manage Fuxuan no. 9 cultivar gardens as well as the rare regional heirloom Lao Chuan Cha, both at higher than average elevations for the area: between 800-1100 meters. Teas in the Sichuan basin flush early—some bushes at lower elevations are ready for harvest as early as February—and while second flushes elsewhere might appear mid-May, their Fuxuan no. 9 gardens can easily see a second harvest by late March. The first flush is naturally devoted to Gan Lu production, but this second harvest proves ideal for leafier grades teas like this Huang Xiao Cha. 1 bud, 2 leaves are plucked, and any woody stems are discarded.

Processing follows the labor-intensive 三炒三闷 "three pan-fries, three coverings" method that defines Meng Ding yellow tea. After initial withering and sorting, the leaves go through multiple rounds of pan-firing and warm, humid wrapping—a wet-heat process that encourages internal transformation and gradual yellowing. The timing and temperature of each round are adjusted based on how the leaves respond, with the full process lasting anywhere from five days to nearly a month. This careful, layered technique deepens the tea’s sweetness, softens its bitterness, and yields a mellow, toasty complexity unique to well-made yellow teas.

Tea material from select gardens, crafted by a recognized master, usually comes at a premium. While the industry’s focus on small-pluck early spring teas from Meng Ding and the broader Sichuan basin may be problematic for many reasons, one silver lining is the relatively undervalued status of later-harvest, leafier teas. This one is a standout—and available at a refreshingly approachable rate.

award decorated veteran

Fuxuan No. 9, the ideal Meng Ding cultivar

Unlike some famous Chinese teas tied to a single cultivar, Meng Ding teas like Gan Lu and Huang Ya are still defined more by place and process than by plant. But cultivar matters—and increasingly, producers and researchers are asking which ones best represent the mountain’s character. A 2023 study by Guo, Wang, and Li compared the twelve main cultivars used for Meng Ding Gan Lu and found that 老川茶 Lǎo Chuān Chá ("Old Sichuan tea") and 福选 9 号 Fú xuǎn 9 hào (Fuxuan no.9) came out on top, ranked first and second respectively. Lao Chuan Cha scored highest for aroma and overall cup quality, while Fuxuan No. 9 followed close behind—offering a similarly layered flavor but with better, more consistent yield, and fewer garden management headaches.

That last point matters. Lao Chuan Cha is still around, and in the last few years has thankfully begun earning more attention again. But its yield is unpredictable, and its cost remains significantly higher. Fuxuan No. 9, on the other hand, offers a kind of sweet spot—a cultivar that doesn’t compromise flavor for efficiency, and that lets producers make an excellent Meng Ding tea without pricing it out of reach.

That isn''t true of all Fuxuan lines. Fuxuan No. 4, which flushes very early but is generally seen as weaker in the cup, currently accounts for nearly half the planted area in the Mengshan production region—largely due to its speed-to-market advantage rather than quality. Fuxuan No. 9, by contrast, covers only about 10% of the area, making it a far more intentional choice for those prioritizing taste.

We’re pleased to source from the Guo family’s ecologically managed Fuxuan No. 9 gardens, located in the Niuniánpíng area on the slopes of Meng Ding Mountain at 800 meters.

Definitely worth a comparison with the Big Yellow from Huoshan, another rare rare yellow at a daily drinker pricepoint.', 'Meng Ding Mountain, Ya''an, Sichuan, China', 'yellow', 'true_tea', 'medium', 85, 2, 4, 'Use 3g per 150ml at 85°C. Steep 2 minutes; re-steep up to 4 times.', ARRAY['Honeyed', 'Cucumber', 'Round', 'Refreshing']::text[], ARRAY[]::text[], '#E6C84E', 18, 20, 22, 14, 'default', 'Teapp', NULL, TRUE),
  ('Sheng Liu Bao', 'sheng-liu-bao', 'Shēng Liùbǎo', '生六堡', 'This is the fresh, unaged, sprightly green-yellow version of a dark heicha famously cellared and long-aged to foster tea characteristics on the opposite end of the spectrum. This less-studied, deep cut iteration is akin to wily, year-of raw pu''er in the world of Liu Bao.

A treat for appreciators of zingier, brinier profiles found in greens, yellows, and raw pu''er as well as hunters of rare finds.

Having been served way too many mediocre versions of fresh, raw Liu Bao during our time in Guangxi province we were puzzled at the complex, viscous aliveness found in this particular producer''s teas. It is none other than Zhu Xue Lan''s craftmanship, one of the handful of intangible cultural inheritors of the craft of Liu Bao that have been knighted by Chinese government with UNESCO. Its quality later began to make more sense; all of her aged teas seem to be a cut above what other Liu Bao teas tend to give, and it''s no surprise that one of the reasons is that they all begin as great teas such as this one, even in the earlier, fresher months and years.

A local celebrity and hero of her village, as a fourth generation Yao ethnicity Liu Bao farmer-producer, Zhu Xue Lan has leveraged her knowledge of this style of tea to not only pull her people out of poverty, but also give greater awareness to the style of Liu Bao and provide an immeasurable amount of opportunity to tea folks within the broader region.

It was when she took us to her tea gardens and showed us her production facilities that we began to understand why her teas tasted more bold, cleaner, and more succinct than other producers'' around Liu Bao town. Her tea gardens climb up from 700 meters up to an unheard of 900 meters in a remote mountainous region 45 minutes drive from her village outside of Liu Bao town; the highest in the area. For reference, most Liu Bao tea gardens we came across otherwise were at 200-300 meters. Higher elevation means cleaner air and precipitation without being in the runoff of industry and pollution above; a larger temperature variance between day and night instilling a greater range and diversity of beneficial phytocompounds, as well as a slower growth rate ensuring more amino acids and sweetness.

Her 生态 shengtai ecologically-managed tea gardens are comprised of the region''s gene pool of seed-propagated landrace tea bushes, broadly classified across China as 群体种 qunti zhong ("communal breed") and more locally known to Liu Bao town as 原种 yuan zhong ("original breed"). A garden of these heirloom bushes represents a diverse gene pool and are non-cultivars, as cultivar-specific gardens are asexually-propagated from cuttings of one cultivated motherbush and are thus purposefully genetically similar to yield uniformity and predictability in both harvesting procedure as well as tea taste/aroma experiencing of the end result.

The remote, unkempt semi-wild ecology of these tea bushes of various ages, sizes, and in various stages of their seasonal flush may be a nightmare for those looking to produce tea on a mass scale. Due to the irregularity of the broad harvesting window created by managing gardens of these unruly qunti zhong bushes, they must be picked by hand by a crew that is seasonally housed and fed, dispatched on the daily to assess what''s available to harvest, and paid a premium for their work.

Young Liu Bao, a difficult classification

Typical Liu Bao teas on the market are easily categorized as 黑

茶

heicha (literally "black tea") one of the six major types of tea in China''s classification system — the darkest, most fermented/oxidized of them all. Yet describing this fresh, unaged Liu Bao as such would be misleading. It''s reasonably akin to the experience of drinking green tea or young raw pu''er, as well as similar enough in craft methods, yet due to a piling/covering step I witnessed in multiple producer''s facilities, I feel that a nod to yellow tea classification should be in the running as well.

Yellow tea goes through the typical green tea production steps such as withering, heat-fixation, rolling/bruising, and drying, yet with the addition of a covering step to initiate an enzymatic yellowing some time after the heat-fixation step when the leaves are still hot and moist. Similarly, Raw Liu Bao is often covered directly or at least piled in a basket before further processing. In the case of Zhu Xue Lan''s tea, the leaves were covered in a basket overnight, up to 12 hours, before further processing.

In the case of another producer, they covered their raw liu bao after heat-fixation in a way that seemed directly copied and pasted from yellow tea production specs

Zhu Xue Lan''s husband demonstrated what 20 years of proper cellaring can do, as the tea on the left is year-of, and the tea on the right began as a Raw Liu Bao in 2005.

This family only produces Raw Liu Bao, the original style of Liu Bao tea, before accelerated fermentation wet-piling methods were introduced in the 1970s, similar to the world of Pu''er. We look forward to introducing more of Zhu Xue Lan''s teas to the western tea community.', 'Liu Bao Town, Cangwu, Wuzhou, Guangxi, China', 'dark', 'true_tea', 'medium', 95, 2, 7, 'Use 5g per 150ml at 95–100°C. Rinse once; steep 30–60 seconds; re-steep 6+ times.', ARRAY['Briny', 'Viscous', 'Zingy', 'Green']::text[], ARRAY[]::text[], '#4A3225', 15, NULL, 20, 55, 'default', 'Teapp', NULL, TRUE),
  ('Ba Xian Dan Cong', 'ba-xian-dan-cong', 'Bāxiān Dāncóng', '八仙单丛', 'Wen Jian Fu''s favorite breed to work with, this one benefits from favored treatment.

Old bush grade at the 中山 zhong shan "middle mountain" category of elevation, these pedigrees produce an excellent 八仙

Ba Xian "Eight Immortals".

With a nose conjuring fig, hops, citrus, orchid, herbal resins, toasted nuts and grain, this may be the greenest dancong of this latest lot, its mouthfeel a touch more on the spritely and crisp side; these leaves weren’t allowed to oxidize as much as his juicier, rosier, Ao Fu Hou.

The advent of Ba Xian came right around the same time as the founding of the people’s republic in the 1950s. Wen’s tea gardens were planted at that time at 530 meters in elevation, and give us another fine-material / even-finer-processing tea experience that we know to be signature to Jian Fu, the vice president of the Chaozhou Tea Industry Association, and recipient of 2nd highest level tea grader award.

Due to the sensitive nature of Ba Xian cultivar leaves, Mr. Wen recommends leafing your pot with 1 gram less than usual, utilizing very fast steep times.

Wen Jian Fu insists on doing only charcoal bake finishing, and doing it himself', 'Phoenix Mountain, Chaozhou, Guangdong, China', 'oolong', 'true_tea', 'medium', 95, 1, 6, 'Use 5g per 150ml at 95–100°C. Quick rinse; steep 20–40 seconds; re-steep 5–7 times.', ARRAY['Fig', 'Orchid', 'Citrus', 'Crisp']::text[], ARRAY[]::text[], '#D4852A', 30, 25, 35, 30, 'default', 'Teapp', NULL, TRUE),
  ('Gao Cong Shui Xian', 'gao-cong-shui-xian', 'Gāocōng Shuǐxiān', '高枞水仙', 'Silky smooth, delicate yet robust flavored Shui Xian from hinterland village Wusandi. Woody, mossy flavors with a deep, distinguished aromatic profile. Solid choice for those looking for an entertaining and crisp session from time-to-time without breaking the bank.

高枞 Gao Cong translates to High Bush and is the grade next to 老枞 Lao Cong Old Bush, and describes its growth pattern: allowed to grow taller and more leggy beyond its younger, tabletop-maintained plantation counterparts, the first step to becoming thicket tea. Gao Cong Shui Xian thickets are typically between 25-50 years old. While the Wusandi area is already known for its ecologically managed tea, thicket garden management ensures that the farmer remains incentivized to keep the gardens clean, as the evident growth of moss, lichens, and other "understory" plants is a selling point.

This tea experiences a full 中火

medium roast, fixing a caramelized sugar maillard reaction and roasted almond butter aroma into the broth, slightly more roasted than its 中轻火 just-bel0w-medium roasted 60 year Shui Xian by the same producer.

Wusandi, an ideal zhengyan alternative

Wusandi is a village close to the headwaters of the River Huangbai, the watercourse that eventually flows down to the famous Nine Bend River by Wuyishan. Of the hinterlands growing tea alternative to the hyped core scenic park teas closer to the city, along with the villages of Tongmu, Wusandi is ecologically pristine, relatively high in elevation, is water abundant, and has ideal soil for tea growing. With tea gardens growing on the slopes from 600 to over 1000 meter peaks, teas from Wusandi are often touted as the "high mountain rock oolong".

Rewind to the mid-late 1600s during the late Ming / early Qing dynasties, when a general Wu Sangui revolted once he gained enough power in his assigned Yunnan and Guizhou territories and even declared himself emperor in 1678 after defending his revolt against the Manchurians of the Qing Dynasty. After dying of dysentery that same year, his grandson held power for a couple of years before being killed. Descendants of this family scattered, including 3 brothers that fled south to the safety of remote mountains in Northern Fujian. The story goes that on such a journey they were sure to bring along a rooster, as folk in those times believed that wherever a rooster crows must be a suitable place to live. At last, in a lush, bamboo forested valley, their rooster crowed for a long while, convincing the 3 brothers Wu to put down their bags. Wusandi was formed, and though the two oldest brothers eventually moved back to familiar territories as it became safer for their family, the youngest brother stayed in Wusandi and planted tea.

Today, hundreds of years later, Mr. Wu is one of the descendants of the younger brother who can trace his ancestry to the infamous Wu Sangui. Wusandi remains a tucked away mountain hamlet, and is known in connoisseur circles for having on average older Shui Xian bushes than the Wuyi scenic park which are generally about 60 years of age. Wusandi boasts around 2000 old Shui Xian bushes around 100 years old. Since these trees are old, the output is limited: each tree produces a little over 1 pound of finished tea annually.

Many specialty cultivars found in Wuyi in lower elevations are not suitable to grow in Wusandi, as the higher elevation produces late winter cold snaps that sensitive varietals can''t withstand. Qidan Da Hong Pao, Rougui, and Shui Xian are more cold hearty — a major reason why they are the most widely planted cultivars in the Wuyi Mountains — and Mr. Wu only grows and produces these varietals.

Wusandi has around 60 households - about 300 people

visiting Mr. Wu''s eldest grove of Shui Xian bushes, some of the oldest in the Wuyi Mountains

a study book handwritten by Mr. Wu''s grandfather for his father (there were not schools in Wusandi at the time). Mr. Wu''s grandfather planted the 60 year old Shui Xian bushes and Mr. Wu''s father planted the 40 year.', 'Wusandi, Wuyishan, Nanping, Fujian, China', 'oolong', 'true_tea', 'medium', 95, 1, 6, 'Use 5g per 150ml at 95–100°C. Quick rinse; steep 20–40 seconds; re-steep 5–7 times.', ARRAY['Silky', 'Woody', 'Mossy', 'Roasted']::text[], ARRAY[]::text[], '#D4852A', 45, 50, 55, 32, 'default', 'Teapp', NULL, TRUE),
  ('Lao Cong Shui Xian', 'lao-cong-shui-xian', 'Lǎocōng Shuǐxiān', '老枞水仙', 'Mr. Wu''s 60+ year old Shui Xian bushes from high mountain rock oolong hinterland village Wusandi provides a special Shui Xian experience. As many older trees produce less material, this age range is considered a sweet spot where bright vigorous flavor expression characteristic of younger bush material meets the more-steepable, smooth, mineral-richness of older bush stock.

Lao Cong 老枞 means Old Bush, and is a designation for bushes typically aged above 40-50 years, and are usually grown 生态 shengtai ecologically without chemicals to promote the growth of mosses and lichens that is often associated with this designation.

Mr. Wu''s grandfather planted these trees in the early 60s. It was his grandfather who planted the oldest bushes in their family, the Shui Xian Centenarian bushes, and it was his son that would plant the next generation Shui Xian bushes, the source material for the High Bush Shui Xian.

Alongside three other Shui Xian teas, this particular one is representative of the aspect of 枞味 congwei or "thicket taste" in the tasting set Old Thicket 2.0. Congwei is present in older bushes that have accumulated more resinous volatile compounds from its expansive root network, as well as from the secondary metabolism of its environment through its thicker bark covered in moss, lichens, and epiphytic plants.

demure, mossy fir flavor

Wusandi, an ideal zhengyan alternative

Wusandi is a village close to the headwaters of the River Huangbai, the watercourse that eventually flows down to the famous Nine Bend River by Wuyishan. Of the hinterlands growing tea alternative to the hyped core scenic park teas closer to the city, along with the villages of Tongmu, Wusandi is ecologically pristine, relatively high in elevation, is water abundant, and has ideal soil for tea growing. With tea gardens growing on the slopes from 600 to over 1000 meter peaks, teas from Wusandi are often touted as the "high mountain rock oolong".

Rewind to the mid-late 1600s during the late Ming / early Qing dynasties, when a general Wu Sangui revolted once he gained enough power in his assigned Yunnan and Guizhou territories and even declared himself emperor in 1678 after defending his revolt against the Manchurians of the Qing Dynasty. After dying of dysentery that same year, his grandson held power for a couple of years before being killed. Descendants of this family scattered, including 3 brothers that fled south to the safety of remote mountains in Northern Fujian. The story goes that on such a journey they were sure to bring along a rooster, as folk in those times believed that wherever a rooster crows must be a suitable place to live. At last, in a lush, bamboo forested valley, their rooster crowed for a long while, convincing the 3 brothers Wu to put down their bags. Wusandi was formed, and though the two oldest brothers eventually moved back to familiar territories as it became safer for their family, the youngest brother stayed in Wusandi and planted tea.

Today, hundreds of years later, Mr. Wu is one of the descendants of the younger brother who can trace his ancestry to the infamous Wu Sangui. Wusandi remains a tucked away mountain hamlet, and is known in connoisseur circles for having on average older Shui Xian bushes than the Wuyi scenic park which are generally about 60 years of age. Wusandi boasts around 2000 old Shui Xian bushes around 100 years old. Since these trees are old, the output is limited: each tree produces a little over 1 pound of finished tea annually.

Many specialty cultivars found in Wuyi in lower elevations are not suitable to grow in Wusandi, as the higher elevation produces late winter cold snaps that sensitive varietals can''t withstand. Qidan Da Hong Pao, Rougui, and Shui Xian are more cold hearty — a major reason why they are the most widely planted cultivars in the Wuyi Mountains — and Mr. Wu only grows and produces these varietals.

Wusandi has around 60 households - about 300 people

visiting Mr. Wu''s eldest grove of Shui Xian bushes, some of the oldest in the Wuyi Mountains

a study book handwritten by Mr. Wu''s grandfather for his father (there were not schools in Wusandi at the time). Mr. Wu''s grandfather planted the 60 year old Shui Xian bushes and Mr. Wu''s father planted the 40 year.', 'Wusandi, Wuyishan, Nanping, Fujian, China', 'oolong', 'true_tea', 'medium', 95, 1, 6, 'Use 5g per 150ml at 95–100°C. Quick rinse; steep 20–40 seconds; re-steep 5–7 times.', ARRAY['Smooth', 'Mineral', 'Mossy', 'Resinous']::text[], ARRAY[]::text[], '#D4852A', 45, 45, 52, 33, 'default', 'Teapp', NULL, TRUE),
  ('Qingyan Lapsang Souchong', 'qingyan-lapsang-souchong', 'Qīngyān Zhèngshān Xiǎozhǒng', '轻烟正山小种', 'An intriguing higher quality, whole-leaf take on the classic smoky export commodity Lapsang Souchong, this lighter smoked zheng shan xiao zhong is crafted for domestic connoisseur markets. A homerun for lapsang lovers curious to try a top shelf version, entertaining for peated scotch heads, yet not too one-dimensionally smoky as to dissuade the general black tea drinker from having the lapsang moment they thought they''d never want.

Fruity and vegetal spiciness shine beneath the modest level of smoke, yielding holiday spiced apple cider notes, eventually giving way to a sweet, mineral-rich toasted grain quality as the session makes its way through the last smoke layers in the session''s later steeps. Having already converted even some of the most smoke-shy and skeptical, this light smoke lapsang is absolutely worth a try.

Abiding by tradition, the Li family in Gu Wang Keng of Tongmu Pass use only heirloom plants referred to as 菜茶 cai cha that have been self-seeding there for untold amount of generations as the base material for their smoked teas. This existent, cultivation-escaped variety has adapted well to the acidic, bamboo-covered slopes of Tongmu. While some sources claim the founding of Tongmu was established as early as the late Tang Dynasty in the early 900s, we know that the region, due to limitations in what it can grow, has focused on producing tea from its naturally exceptional base material since at least the late Ming Dynasty (early 1600s).

The scene from the Li family house in Gu Wang Keng village, one of the smaller, more remote villages of Tongmu. The altitude here is 1000 meters.

Little ol Tongmu: the birthplace of the most global style of tea

桐木关 Tongmu Guan or Tongmu Pass is a hinterland region of the larger Wuyi Mountain area in northern Fujian and is considered to be the birthplace of 红茶 hong cha (literally "red tea"), known as black tea in the West. It happened by accident when a troop of soldiers making their way through the mountains along the provincial border of Jiangxi and Fujian took an less-common route and happened upon Tongmu in the midst of spring tea season. Its villagers taken by surprise, they abandoned their fresh-harvest of laid out withering leaves and ran for the hills. Upon their return, they found their leaves oxidized and damaged due to the soldiers having slept on them! In a last ditch effort to salvage the tea someone thought to burn some of their locally abundant pine tree species, letting the smoke dry out the spoiled looking leaves. The prepared tea of this intervention turned out to be well-received, and not only was red tea AKA black tea invented, the smoky version 正山小种 zheng shan xiao zhong or later known as Lapsang Souchong was also invented. The rest is history.

Exploring the Li family traditional Qing Lou smokehouse. Sometime in 2026 the youtube channel will have this episode out.

Smoking traditions adapting to changing times

To further protect this pristine area the government banned the continued harvesting of pinewood in the preserve of Tongmu in 2020. Additionally they prohibited the import of outside supplemental timber to enter the preserve out of precaution that an invasive pine-boring insect could jeopardize the remaining trees. This effectively decommissioned the iconic old 3 story traditional smokehouses of Tongmu called 青楼 Qing Lou. Knowing ahead of time, many resident smoked lapsang producers began stockpiling native pinewood prior to the policy shift. Some years later, having burned through much of their finite stockpiles and getting less-than-average aromatic results the more the wood ages, many families including the Li family have constructed new Qing Lous just outside the preserve.

With the advent of the popular and premium-priced Jin Jun Mei about twenty years ago, some families have opted to abandon smoking processes altogether to solely focus on unsmoked teas. While Jin Jun Mei remains the sensation, these days new experimental varietals using Tongmu''s excellent base materials seem to always be premiering, each one vying to become the next big blockbuster.

Each level of the Qing Lou is used according to the phase of processing, beginning with initial withering and finally with its finishing roast, ensuring that the leaves 吃烟 chi yan "eat smoke" and the smoke thoroughly integrates into the leaf.

Besides smoking, the leaves are subject to: withering to reduce moisture, rolling to thoroughly bruise the cell walls initiating deeper oxidation, wet-piling to retain moisture and heat to ensure thorough oxidation, wok heat-exposure the fix any remaining oxidative enzymes, and eventually more rolling, smoking, and sorting.

Traditional process Tongmu teas are truly special heirloom substances and you''re heartily invited to try this Light Smoke Lapsang, along with Tongmu Old Bush, and Tongmu Orchid Grotto from the Li family.', 'Gu Wang Keng, Tongmu, Wuyishan, Nanping, Fujian, China', 'black', 'true_tea', 'high', 95, 3, 4, 'Use 3g per 150ml at 95°C. Steep 3 minutes; re-steep 2–3 times.', ARRAY['Smoky', 'Fruity', 'Spicy', 'Mineral']::text[], ARRAY[]::text[], '#8B4513', 85, 55, 70, 50, 'default', 'Teapp', NULL, TRUE),
  ('Meng Ding Mao Feng', 'meng-ding-mao-feng', 'Méngdǐng Máofēng', '蒙顶毛峰', 'A thick broth of steamed crab, chestnut, hamhock, and umami rolls around in the mouth as this straightforward sichuan style unfolds over a brew session.

While Meng Ding Mountain is renowned for its legendary history and still-favored classics like Gan Lu and Huang Ya, it also produces some little brother styles, Mao Feng being one of them. The somewhat generic title 毛峰 máo fēng (literally "hairy tip") still aptly describes these trichome-rich, downy buds that not only look cool, but can only be found on recently sprouted tea buds, an indication of choice spring tea.

Can think of this tea as a more simplified, slightly later harvested Gan Lu (featuring a bit more leaf grown out), without the prestige-influenced price tag. This year''s Sichuan Mao Feng was harvested on April 6th, grown at 1100 meters on the slopes of Meng Ding. Brothy, juicier, grounded, this is an ideal early spring green tea at a daily drinker price.', 'Meng Ding Mountain, Ya''an, Sichuan, China', 'green', 'true_tea', 'medium', 80, 2, 3, 'Use 3g per 150ml at 80°C. Steep 1–2 minutes; re-steep up to 3 times.', ARRAY['Umami', 'Chestnut', 'Brothy', 'Sweet']::text[], ARRAY[]::text[], '#7BA05B', 8, NULL, 15, 52, 'default', 'Teapp', NULL, TRUE),
  ('Qimen Jin Zhen', 'qimen-jin-zhen', 'Qímén Jīnzhēn', '祁门金针', 'Qimen Jin Zhen "Gold Bud / Gold Needle" is a tippier, more delicate grade of the globally recognized "Keemun Black Tea". This tea offers a nice harmony of floral, honey, and fruit aromas/flavors framed with a light-medium mouthfeel. A small harvest window, low yields, higher pay for tea pickers, and a more exacting oxidation process due to the sensitivity of these delicate bud pickings, all factor into the craft of this more specialty grade of Qimen red.

Tippy bud-only red teas can''t undergo the standard 揉捻 rounian rolling step after withering; their delicate structure can only handle a light bruising. Since this can''t ensure full, even oxidation in the same way, to compensate many tea producers utilize a heated humidity room for a covered piling step to ensure complete oxidation after gentle rolling. This heated humid piling can easily go on for too long, contributing to a common but generally unwanted sweet potato-y root vegetable flavor. This one stays right in the honey zone.

This one was crafted in the Likou-based Li family backyard: Li Shan, where they have family-owned natural tea gardens established back in the 1980s. While some cultivars have come into the area, mostly to support the green tea operations, the Li family still uses the seed grown local variety there, referred to as 槠叶种 zhu ye zhong for all their red teas.

Inspired by Fujian hong cha styles, Qimen red tea was developed in the late 1800s and gained recognition beyond its domestic market to become the primary export commodity black tea coming out of China, competing with the leafy, maximally oxidized, and robust expressions of Indian black teas, and eventually winning gold medals at international tea expos throughout the 20th century, as well as becoming a favorite of the British royal family. It is now in the ranks of the Four Major Black Teas in the world, alongside Darjeeling, Assam, and Ceylon black teas.

As the domestic market demand for more specialty varietals increased in the late 20th century, this more delicate Gold Bud varietal was developed by highlighting a tippier plucking grade during its harvesting. Whereas the existent 祁红毛峰 Qi Hong Mao Feng features a later harvest with more leaf mass, Gold Bud features a meticulously gathered pickings of 1 bud - 1 partially opened leaf in the early spring; its harvest window only lasting a couple of days and requiring much attention to detail with low yield.

checking out the heated humidity room for oxidizing reds, primarily for tippier delicate reds like this one that can''t undergo aggressive cell-wall bruising

A precursor to Jin Jun Mei?

Jin Jun Mei, a tippy, early spring-harvested red tea from Tongmu Guan, played a key role in further invigorating the red tea market in the mid-2000s. Its creator, Liang Junde, may have drawn inspiration from Qimen Gold Bud during a visit to Qimen County just before developing Jin Jun Mei. When this new government-backed varietal debuted in 2007, it set record prices for red tea, sparking a shift in the market toward higher quality production; the success pushing farmers to meet the growing demand to improve versions of existent red tea. While Qimen Gold Bud may have influenced Jin Jun Mei during its inception, it has in turn benefited from its descendant''s success, becoming not only a gourmet varietal within the Qimen family, but a premier rival to the monumental Jin Jun Mei.

While not from Tongmu so therefore not an official Jin Jun Mei, this year''s Zhenghe County "Jin Jun Mei" crafted by white tea legend Yang Feng serves us another tippy, gourmet red. While sure to be in the shadow of the real Tongmu Jin Jun Mei, we recommend Qimen Gold Bud and Zhenghe JJM as ideal alternatives due to their competitive quality at a much more approachable price.', 'Likou, Qimen County, Anhui, China', 'black', 'true_tea', 'high', 95, 3, 4, 'Use 3g per 150ml at 95°C. Steep 3 minutes; re-steep 2–3 times.', ARRAY['Floral', 'Honey', 'Fruity', 'Delicate']::text[], ARRAY[]::text[], '#8B4513', 90, NULL, 45, 58, 'default', 'Teapp', NULL, TRUE),
  ('Qimen Mao Feng', 'qimen-mao-feng', 'Qímén Máofēng', '祁红毛峰', 'A more classic Qimen experience, this mao feng grade gives us honey sweetness, a well rounded juicy mouthfeel, a toasty finish that makes you want another rip, and is everything we want and more in a daily Qimen. Creamy, brisk, with ample 生津 sheng jin resalivation effect and empty cup aromas.

This is a more ecologically-minded take on the classic, robust "Keemun Black Tea" either for those who are looking for a high quality on-ramp into the style, or for those looking to upgrade their qimen shelf. Produced by the Li family, this successful family is well resourced with skillset knowledge as well as land assets, both owned and contracted.

exploring reclaimed wild gardens around Qimen county with young Da Le, the fifth generation tea producer in the Li family out of Likou

Inspired by Fujian hong cha styles, Qimen red tea was developed in the late 1800s and gained recognition beyond its domestic market to become the primary export commodity black tea coming out of China, competing with the leafy, maximally oxidized, and robust expressions of Indian black teas, and eventually winning gold medals at international tea expos throughout the 20th century, as well as becoming a favorite of the British royal family. Qimen is now in the ranks of the Four Major Black Teas in the world, alongside Darjeeling, Assam, and Ceylon black teas, and is a base material for Earl Grey.

In the late twentieth century, as the domestic economy and appetite for finer teas grew, variations on this famous export commodity were funded, producing variants featuring finer plucking grades like tippy Qimen Gold Bud as well as grades emphasizing tea tree age, garden management style, and elevation.', 'Likou, Qimen County, Anhui, China', 'black', 'true_tea', 'high', 95, 3, 4, 'Use 3g per 150ml at 95°C. Steep 3 minutes; re-steep 2–3 times.', ARRAY['Honey', 'Creamy', 'Toasty', 'Brisk']::text[], ARRAY[]::text[], '#8B4513', 90, NULL, 42, 56, 'default', 'Teapp', NULL, TRUE),
  ('Tongmu Orchid Grotto', 'tongmu-orchid-grotto', '', NULL, 'This experimental Tongmu red tea showcases an oolong cultivar with unsmoked lapsang style treatment. Pristine Tongmu terroir meets modern craftmanship meets oolong flair.

As the gaiwan lid lifts off the leaves off the first steep, vapors of buttered pastry and mossy spring greet the senses. Orchid Grotto playfully displays a neat, tight balance of aroma/flavor, mouthfeel, and return sweetness effects on the afterbreath. These qualities pair well with the distinctly Tongmu mineral-laden "stony" character present throughout the teas coming from the area.

The cultivar used is No. 220 金牡丹 Jin Mu Dan "Golden Peony", a breed developed in the late twentieth century, and came into prominence around the turn of the century. Jin Mu Dan is a cross between 黄棪 Huang Yan and 铁观音 Tie Guan Yin cultivars and is celebrated for its floral-honey-peach character it imparts. The Li family in Tongmu planted these bushes in the early 2000s and manages them using sheng tai ecological farming practices, manually weeding once a year in July-August.

The scene from the Li family house in Gu Wang Keng village, one of the smaller, more remote villages of Tongmu. The altitude here is 1000 meters.

It was neat to see the Li family use a slow turning yao qing barrel, slowly bruising the leaf edges to accentuate the aromatics for red tea varietals like this, borrowing an oolong production technique.

The Progeny of Red Tea''s Renaissance

When the government-commissioned Jin Jun Mei debuted in 2006, it asked — and received — unheard of prices for the genre. Modern luxury hong cha was born and the race to emphasize higher quality inputs in existing varietals and prototype newer trendy ones to get in on the hype was underway. Genuine Jin Jun Mei hails from the birthplace of red tea — Tongmu Pass in the greater Wuyi Mountains — and the legendary area began to rightfully receive more attention with the help of its new posterchild.

If this incentive to pivot from producing the old smoky export black teas to higher earning fashionable domestic products wasn''t enough, the government banned the harvest of wild pine in the protected preserve in 2020 (as well as the import of outside pine), effectively decommissioning the old 青楼 Qing Lou smokehouses of Tongmu. Focusing on producing high quality unsmoked iterations became paramount to Tongmu farmers.

With demand for unsmoked Lapsang 正山小种 zheng shan xiao zhong increasing, room to expand upon varietals within that umbrella was afforded. The Li family Orchid Grotto and Tongmu Old Bush are just this: twists on the classic unsmoked lapsang style, with an emphasis on differentiated raw material inputs prior to production.

The Li family harvest of Jin Mu Dan bushes for this Orchid Grotto tea in late April

Little ol Tongmu: the birthplace of the most global style of tea

桐木关 Tongmu Guan or Tongmu Pass is a hinterland region of the larger Wuyi Mountain area in northern Fujian and is considered to be the birthplace of 红茶 hong cha (literally "red tea"), known as black tea in the West. It happened by accident when a troop of soldiers making their way through the mountains along the provincial border of Jiangxi and Fujian took an less-common route and happened upon Tongmu in the midst of spring tea season. Its villagers taken by surprise, they abandoned their fresh-harvest of laid out withering leaves and ran for the hills. Upon their return, they found their leaves oxidized and damaged due to the soldiers having slept on them! In a last ditch effort to salvage the tea someone thought to burn some of their locally abundant pine tree species, letting the smoke dry out the spoiled looking leaves. The prepared tea of this intervention turned out to be well-received, and not only was red tea AKA black tea invented, the smoky version 正山小种 zheng shan xiao zhong or later known as Lapsang Souchong was also invented. The rest is history.', 'Gu Wang Keng, Tongmu, Wuyishan, Nanping, Fujian, China', 'black', 'true_tea', 'high', 95, 3, 4, 'Use 3g per 150ml at 95°C. Steep 3 minutes; re-steep 2–3 times.', ARRAY['Buttery', 'Mossy', 'Floral', 'Stony']::text[], ARRAY[]::text[], '#8B4513', 88, NULL, 40, 57, 'default', 'Teapp', NULL, TRUE),
  ('Wudong Lao Cong Shui Xian', 'wudong-lao-cong-shui-xian', 'Wūdōng Lǎocōng Shuǐxiān', '乌岽老枞水仙', 'For those into Phoenix Dancong, tea from Wudong Mountain needs no introduction. As the core production area for this style of tea, Wudong and its villages sits at the highest elevations of the area and holds some of the oldest tea trees of the area.

Between the elevations of 1000-1100 meters, brother Jun’s family has been stewarding several old school dancong cultivar varieties for many generations now, one of which being the classic Shui Xian. Considered by some to be the Phoenix Mountains’ oldest cultivar, Wen’s large, mature centenarian+ Shui Xian bushes offers a phoenix dancong experience not easily found.

While officially classified as a separate cultivar than the Shui Xian found in Fujian, some would debate that this Shui Xian stock found in the Phoenix Mountains not only predates, but was an ancestor to the modern day Shui Xian found in the Wuyi Mountains, Zhangping, and Jianyang (considered the birthplace of Fujian Shui Xian). In any case, prestigious Wudong Mountain Shui Xian represents some of the oldest oolong genetics around.

Brother Jun’s Shui Xian bushes are some of the oldest and largest in his tea gardens, and when asked how old they are answers can range from “at least 100-200 years” to “the oldest may be several hundred” — in other words, he doesn’t quite know — a common and acceptable answer from those that have inherited truly old growth tea trees.

The small leaf variety breeds of eastern China are known to have a shorter life span than the large leaf varieties found in their native Southern Yunnan / Golden Triangle areas, and like the centenarian Lao Cong Shui Xian from Wusandi from our partner Mr. Wu, these old bushes are considered by some to be past their prime. Fresh leaf yields start to diminish, and while aroma, minerality, and 枞味 congwei “mossy bush flavor” in the finished tea still persists, the flavor-mouthfeel structure begins to flag, not as consistent in its texture over the session.

Despite this mild “geriatric” aspect, the enjoyment of this tea was worth the investment and has become a favorite amongst friends.', 'Wudong Mountain, Phoenix, Chaozhou, Guangdong, China', 'oolong', 'true_tea', 'medium', 95, 1, 6, 'Use 5g per 150ml at 95–100°C. Quick rinse; steep 20–40 seconds; re-steep 5–7 times.', ARRAY['Mossy', 'Mineral', 'Floral', 'Mature']::text[], ARRAY[]::text[], '#D4852A', 32, 28, 36, 28, 'default', 'Teapp', NULL, TRUE);
