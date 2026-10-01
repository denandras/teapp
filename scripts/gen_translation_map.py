#!/usr/bin/env python3
"""Generate translation_map.json for teas.translation (meaning of the name).

Reads /tmp/teas_names.tsv (slug|name|original_name|tea_type) exported from Supabase,
writes scripts/translation_map.json { slug: translation }.
"""
import json, re

G = {}
def g(keys, val):
    for k in keys: G[k] = val

# ---- Generic pinyin/term glosses (shared across teas) ----
g(['古樹生'], 'Ancient-Tree Raw')
g(['古樹熟'], 'Ancient-Tree Ripe')
g(['熟茶'], 'Ripe Tea')
g(['生茶'], 'Raw Tea')
g(['毛茶', 'Mao Chà', 'Māo Chà'], 'Mao Cha (unprocessed loose tea)')
g(['老樹生'], 'Old-Tree Raw')
g(['老樹熟', '老樹熟茶'], 'Old-Tree Ripe')
g(['宮廷熟茶'], 'Palace-Grade Ripe')
g(['熟磚'], 'Ripe Brick')
g(['熟沱'], 'Ripe Tuo')
g(['生沱'], 'Raw Tuo')
g(['老茶頭', '老茶头'], 'Old Tea Nuggets')
g(['焙じ茶'], 'Roasted Tea (Hojicha)')
g(['焙じ茶粉'], 'Powdered Roasted Tea')
g(['煎茶'], 'Sencha (decocted tea)')
g(['抹茶'], 'Powdered Tea (Matcha)')
g(['鹿児島抹茶'], 'Kagoshima Matcha')
g(['奧緑', '奥緑'], 'Deep Green (Okumidori cultivar)')
g(['佳葉龍茶'], 'GABA Tea (Gabaron)')
g(['高山茶'], 'High-Mountain Tea (Gao Shan)')
g(['烏龍茶'], 'Wulong (Black Dragon) Tea')
g(['紅茶'], 'Red Tea (Black)')
g(['黑茶', '黒茶'], 'Dark Tea')
g(['黄茶'], 'Yellow Tea')
g(['白茶'], 'White Tea')
g(['老白茶'], 'Aged White Tea')
g(['老生茶'], 'Aged Raw Tea')
g(['老熟茶'], 'Aged Ripe Tea')
g(['老茶王'], 'Old Tea King')
g(['老樹生沱'], 'Old-Tree Raw Tuo')
g(['紅玉'], 'Ruby #18 (Hong Yu cultivar)')
g(['大紅袍', '大红袍'], 'Big Red Robe')
g(['铁观音', '鐵觀音'], 'Iron Goddess of Mercy')
g(['肉桂'], 'Cinnamon (Rou Gui)')
g(['水仙'], 'Narcissus (Shui Xian)')
g(['老枞水仙', '老欉水仙'], 'Old-Tree Narcissus')
g(['岩茶'], 'Rock Tea (Yancha)')
g(['正山小種'], 'Lapsang Souchong (Original Mountain)')
g(['凤凰单丛', '鳳凰單叢'], 'Phoenix Dancong (single bush)')
g(['碧螺春'], 'Green Snail Spring')
g(['龙井', '龍井'], 'Dragon Well')
g(['黄山毛峰'], 'Yellow Mountain Woolly Peak')
g(['信陽毛尖', '信阳毛尖'], 'Xinyang Woolly Tip')
g(['安吉白茶'], 'Anji White Tea (green from white-leaf cultivar)')
g(['白毫银针', '白毫銀針'], 'White Hair Silver Needle')
g(['白牡丹'], 'White Peony')
g(['寿眉', '壽眉'], 'Longevity Eyebrow')
g(['貢眉', '贡眉'], 'Tribute Eyebrow')
g(['珠茶'], 'Pearl/Gunpowder Tea')
g(['珍眉'], 'Precious Eyebrows')
g(['六安瓜片'], 'Lu\u2019an Melon Seed')
g(['太平猴魁'], 'Monkey Chief (Taiping Houkui)')
g(['竹叶青', '竹叶青茶'], 'Bamboo-Leaf Green')
g(['恩施玉露'], 'Enshi Jade Dew')
g(['玉露'], 'Jade Dew (Gyokuro)')
g(['碾茶'], 'Tencha (matcha raw material)')
g(['玄米茶'], 'Brown-Rice Tea (Genmaicha)')
g(['玄米'], 'Brown Rice')
g(['茎茶'], 'Twig/Stem Tea (Kukicha)')
g(['粉茶'], 'Powder Tea (Konacha)')
g(['芽茶'], 'Bud Tea (Mecha)')
g(['番茶'], 'Everyday Coarse Tea (Bancha)')
g(['麦茶'], 'Roasted Barley Tea (Mugicha)')
g(['新茶'], 'First-Harvest (Shincha)')
g(['釜炒り茶'], 'Pan-Fired Tea (Kamairicha)')
g(['玉緑茶'], 'Curly-Ball Green Tea (Tamaryokucha)')
g(['和紅茶'], 'Japanese Black Tea (Wakoucha)')
g(['深蒸し茶'], 'Deep-Steamed Tea (Fukamushi)')
g(['かぶせ茶'], 'Shade-Grown Tea (Kabusecha)')
g(['荒茶'], 'Unrefined Rough Tea (Aracha)')
g(['発酵茶'], 'Fermented Tea')
g(['後発酵茶'], 'Post-Fermented (Dark) Tea')
# Japanese place/cultivar names with meaning
g(['知覧茶'], 'Tea from Chiran')
g(['八女茶'], 'Tea from Yame')
g(['八女玉露'], 'Yame Jade Dew (Gyokuro)')
g(['狭山茶'], 'Sayama Tea')
g(['狭山香一番茶'], 'Sayama-Aroma First Harvest')
g(['嬉野茶'], 'Tea from Ureshino')
g(['鹿児島茶'], 'Tea from Kagoshima')
g(['宇治抹茶'], 'Uji Matcha')
g(['宇治昔'], 'Uji of Old (Mukashi blend)')
g(['霧島煎茶'], 'Kirishima Sencha')
g(['県の森'], 'Prefectural Forest (Agata no Mori)')
g(['洞川仙品'], 'Dosenbo Finest')
g(['北極星'], 'North Star (Hokkyokusei)')
g(['不二'], 'Mt. Fuji')
g(['あさひ'], 'Morning Sun (Asahi cultivar)')
g(['旭'], 'Morning Sun')
g(['星の極'], 'Hoshino Extreme')
g(['星野'], 'Star Field (Hoshino)')
g(['鷲峰'], 'Eagle Peak (Washimine)')
g(['薗北'], 'Sonokita (Saemidori line cultivar)')
g(['和光'], 'Harmonious Light (Wako)')
g(['皇祝'], 'Imperial Celebration (Oju)')
g(['明成'], 'Bright Achievement (Meiju)')
g(['明君'], 'Wise Ruler (Meikun)')
g(['成仁'], 'Becoming Benevolent (Narino)')
g(['雲鶴'], 'Cloud Crane (Unkaku)')
g(['無門'], 'Gateless (Zen: Mumon)')
g(['奥の露'], 'Dew of the Depths (Oku no Tsuyu)')
g(['山吹'], 'Golden-Yellow (Yamabuki flower)')
g(['山吹撫子'], 'Yamabuki Nadeshiko')
g(['みどり'], 'Green (Midori)')
g(['みどり二番茶'], 'Green Second Harvest')
g(['春ほのか'], 'Subtle Spring (Haru Honoka)')
g(['つぐみ'], 'Thrush (songbird, Tsugumi)')
g(['サンルージュ'], 'Sun Rouge (Sunrouge, red-purple hybrid)')
g(['べにふうき'], 'Red Windmill (Benifuki cultivar)')
g(['福寿'], 'Fortune & Longevity (Fukuju)')
g(['花香焙茶'], 'Flower-Fragrance Hojicha')
g(['オヤトコの焙じ茶'], "Papa's Hojicha (Oyatoko)")
g(['白焙じ'], 'White-Roasted Hojicha (Shiro Houji)')
g(['水出し煎茶'], 'Cold-Brewed Sencha (Mizudashi)')
g(['インスタント煎茶'], 'Instant Sencha')
g(['抹茶入り煎茶'], 'Sencha with Matcha')
g(['抹茶入り玄米茶'], 'Genmaicha with Matcha')
g(['佐賀の雪玄米茶'], 'Saga Snow Genmaicha')
g(['かぶせ奥緑'], 'Shade-Grown Okumidori')
g(['深蒸しかぶせ茶'], 'Deep-Steamed Kabusecha')
g(['限定煎茶'], 'Limited-Edition Sencha')
g(['煎茶秀品'], 'Exhibition-Grade Sencha')
g(['碁石茶'], 'Go-Stone Tea (fermented discs, Goishicha)')
g(['阿波晩茶'], 'Awa Late Tea (lacto-fermented, Awabancha)')
g(['石鎚黒茶'], 'Ishizuchi Dark Tea')
g(['田実茶'], 'Field-Edge Tea (Damine)')
g(['十六茶'], 'Sixteen-Herb Blend')
g(['ギャバ烏龍茶'], 'GABA Wulong')
g(['焙じ烏龍茶'], 'Roasted Wulong')
g(['春烏龍茶'], 'Spring Wulong')
g(['在来紅茶'], 'Native-Cultivar Black Tea')
# ---- Chinese dark/other ----
g(['安化黑茶'], 'Anhua Dark Tea')
g(['安化松针'], 'Anhua Pine Needle')
g(['茯磚', '茯磚茶'], 'Fu Brick')
g(['花磚', '花砖茶'], 'Flower Brick')
g(['黑磚茶', '黑砖茶'], 'Black Brick')
g(['康磚茶', '康砖茶'], 'Kang Brick')
g(['青磚茶', '青砖茶'], 'Green Brick')
g(['湖北青砖茶'], 'Hubei Green Brick')
g(['千兩茶', '千两茶'], 'Thousand-Tael Log Tea')
g(['天尖'], 'Heavenly Tip (Tianjian)')
g(['貢尖', '贡尖'], 'Tribute Tip (Gongjian)')
g(['金尖'], 'Golden Tip (Jinjian)')
g(['生尖'], 'Raw Tip (Shengjian)')
g(['六堡茶'], 'Six-Bastion Tea (Liupao)')
g(['老六堡'], 'Aged Liupao')
g(['生六堡'], 'Raw Liupao')
g(['佳倉六安', '佳仓六安'], 'Fine-Cellared Liu\u2019an')
g(['雅安藏茶'], 'Ya\u2019an Tibetan Tea')
g(['辺銷茶', '邊銷茶'], 'Border-Market Tea')
g(['青願茶'], 'Azure Wish Tea')
g(['陳皮熟茶'], 'Tangerine-Peel Ripe Tea')
g(['茶馬古道熟茶', '茶马古道熟茶'], 'Tea-Horse-Road Ripe Tea')
g(['老同志'], 'Old Comrade (Haiwan brand)')
g(['七子餅', '七子饼'], 'Seven-Sons Cake (round beeng)')
g(['勐海7542'], 'Menghai Recipe 7542')
g(['勐海7572熟茶'], 'Menghai Recipe 7572 Ripe')
g(['昆明7581熟砖'], 'Kunming Recipe 7581 Ripe Brick')
g(['大益V93熟沱'], 'Dayi Recipe V93 Ripe Tuo')
g(['下关8663熟茶', '下关8663熟碢'], 'Xiaguan 8663 Ripe')
g(['下关甲級沱', '下关甲级沱'], 'Xiaguan Grade-A Tuo')
g(['下关销法沱', '下关銷法沱'], 'Xiaguan France-Market Tuo')
g(['倚邦'], 'Yibang (ancient tea mountain)')
g(['易武生茶'], 'Yiwu Raw Tea')
g(['彎弓古樹生茶', '弯弓古树生茶'], 'Wangong Ancient-Tree Raw')
g(['老班章生茶'], 'Lao Banzhang Raw')
g(['老班章老樹'], 'Lao Banzhang Old Trees')
g(['老班章古茶廠'], 'Lao Banzhang Old Tea Factory')
g(['老曼峨生茶', '老曼峨生碢'], 'Lao Man\u2019e Raw')
g(['老曼峨熟茶'], 'Lao Man\u2019e Ripe')
g(['老曼峨国有林生茶'], 'Lao Man\u2019e State-Forest Raw')
g(['南糯山生茶'], 'Nannuo Mountain Raw')
g(['南糯山野生生茶'], 'Nannuo Mountain Wild Raw')
g(['南糯滇紅'], 'Nannuo Yunnan Red')
g(['景邁生茶', '景迈生茶'], 'Jingmai Raw')
g(['布朗山古樹生茶'], 'Bulang Mountain Ancient-Tree Raw')
g(['布朗山熟茶'], 'Bulang Mountain Ripe')
g(['冰島生茶', '冰岛生茶'], 'Ice-Island Raw (Bingdao)')
g(['永德大雪山生茶'], 'Yongde Great Snow Mountain Raw')
g(['一抹陽光'], 'A Stroke of Sunlight')
g(['有機生茶'], 'Organic Raw Tea')
g(['白芽苞'], 'White Bud Sheath')
g(['芽苞'], 'Bud Sheath (Ya Bao)')
g(['野生白芽'], 'Wild White Bud')
g(['月光白'], 'Moonlight White')
g(['白露'], 'White Dew (Bai Lu)')
g(['老茶白茶'], 'Aged White Tea')
g(['曬紅', '晒红'], 'Sun-Dried Red')
g(['頭採紅茶', '头採红茶'], 'First-Pick Red')
g(['英德紅茶'], 'Yingde Red Tea')
g(['宜紅', '宜红'], 'Yihong (Yichang Red)')
g(['宜興工夫紅茶', '宜兴工夫红茶'], 'Yixing Gongfu Red')
g(['越紅工夫', '越红工夫'], 'Yuehong Gongfu Red')
g(['寧紅工夫', '宁红工夫'], 'Ninghong Gongfu Red')
g(['川紅工夫', '川红工夫'], 'Sichuan Gongfu Red')
g(['祁門紅茶', '祁门红茶'], 'Keemun Red Tea')
g(['祁門金針', '祁门金针'], 'Keemun Golden Needle')
g(['祁紅毛峰', '祁红毛峰'], 'Keemun Mao Feng')
g(['滇紅', '滇红'], 'Yunnan Red (Dianhong)')
g(['滇紅金毫', '滇红金毫'], 'Yunnan Golden Hair-Tip')
g(['滇紅金螺', '滇红金螺'], 'Yunnan Golden Snail')
g(['滇紅金芽', '滇红金芽'], 'Yunnan Golden Bud')
g(['滇紅金針', '滇红金针'], 'Yunnan Golden Needle')
g(['金猴紅茶', '金猴红茶'], 'Golden Monkey Red')
g(['金猴茶'], 'Golden Monkey Tea')
g(['金駿眉', '金骏眉'], 'Golden Steed Eyebrow (Jin Jun Mei)')
g(['九曲紅梅', '九曲红梅'], 'Nine-Bend Red Plum')
g(['老川黃大茶', '老川黄大茶'], 'Aged Sichuan Large-Leaf Yellow')
g(['蒙頂黃小茶', '蒙顶黄小茶'], 'Mengding Small-Leaf Yellow')
g(['蒙頂黃芽', '蒙顶黄芽'], 'Mengding Yellow Bud')
g(['蒙頂甘露', '蒙顶甘露'], 'Mengding Sweet Dew (Ganlu)')
g(['蒙頂毛峰', '蒙顶毛峰'], 'Mengding Woolly Peak')
g(['霍山黃芽', '霍山黄芽'], 'Huoshan Yellow Bud')
g(['莫干黃芽', '莫干黄芽'], 'Mogan Yellow Bud')
g(['黃大茶', '黄大茶'], 'Large-Leaf Yellow')
g(['黃小茶', '黄小茶'], 'Small-Leaf Yellow')
g(['平陽黃湯', '平阳黄汤'], 'Pingyang Yellow Broth')
g(['溫州黃湯', '温州黄汤'], 'Wenzhou Yellow Broth')
g(['君山銀針', '君山银针'], 'Junshan Silver Needle')
g(['天目湖黃茶', '天目湖黄茶'], 'Tianmu Lake Yellow Tea')
g(['遠安鹿苑', '远安鹿苑'], 'Yuan\u2019an Deer-Park Yellow (Luyuan)')
g(['溈山毛尖', '沩山毛尖'], 'Weishan Woolly Tip')
g(['都勻毛尖', '都匀毛尖'], 'Duyun Woolly Tip')
g(['北港毛尖'], 'Beigang Woolly Tip')
g(['古丈毛尖'], 'Guzhang Woolly Tip')
g(['廬山雲霧', '庐山云雾'], 'Lushan Cloud-Mist')
g(['雲霧', '云雾'], 'Cloud-Mist')
g(['早春雲霧', '早春云雾'], 'Early-Spring Cloud-Mist')
g(['南京雨花茶'], 'Nanjing Rain-Flower Tea')
g(['頂谷大方', '顶谷大方'], 'Valley-Treasure Dafang')
g(['珍眉'], 'Precious Eyebrows (Chun Mee)')
g(['珠茶'], 'Gunpowder Pearl Tea')
g(['碧螺春'], 'Green Snail Spring')
g(['紅碧螺', '红碧螺'], 'Red Snail (black Bi Luo)')
g(['安吉白茶'], 'Anji White Tea (green from white cultivar)')
g(['白毛猴'], 'White-Haired Monkey')
g(['茉莉白毫銀針', '茉莉白毫银针'], 'Jasmine Silver Needle')
g(['茉莉花茶'], 'Jasmine Flower Tea')
g(['菊花茶'], 'Chrysanthemum Tea')
g(['二十四味'], 'Twenty-Four Flavors')
g(['絞股藍', '绞股蓝'], 'Jiaogulan (five-leaf ginseng herb)')
# Wuyi / Yan cha
g(['慧苑坑百年老欉水仙', '慧苑坑百年老枞水仙'], 'Huiyuankeng Century-Old Narcissus')
g(['慧苑坑北斗大紅袍', '慧苑坑北斗大红袍'], 'Huiyuankeng Beidou Da Hong Pao')
g(['慧苑坑肉桂'], 'Huiyuankeng Cinnamon')
g(['倒水坑肉桂'], 'Daoshuikeng Cinnamon')
g(['觀音巖肉桂', '观音岩肉桂'], 'Guanyin-Rock Cinnamon')
g(['馬頭巖鐵羅漢', '马头岩铁罗汉'], 'Matouyan Iron Arhat')
g(['鐵羅漢', '铁罗汉'], 'Iron Arhat (Tieluohan)')
g(['水金龜'], 'Golden Water Turtle (Shui Jin Gui)')
g(['金鎖匙', '金锁匙'], 'Golden Key (Jin Suo Chi)')
g(['白瑞香'], 'White Daphne (Bai Rui Xiang)')
g(['半天腰'], 'Mid-Cliff Waist (Ban Tian Yao)')
g(['白雞冠'], 'White Cockscomb (Bai Ji Guan)')
g(['竹窠矮腳烏龍', '竹窠矮脚乌龙'], 'Bamboo-Pit Short-Leg Wulong')
g(['烏岽老欉水仙', '乌岽老枞水仙'], 'Wudong Old-Tree Narcissus')
g(['大坑口老欉水仙', '大坑口老枞水仙'], 'Dakengkou Old-Tree Narcissus')
g(['高欉水仙', '高枞水仙'], 'Tall-Tree Narcissus')
# Anxi / Taiwan oolongs
g(['本山'], 'Native Mountain (Ben Shan cultivar)')
g(['毛蟹'], 'Hairy Crab (Mao Xie cultivar)')
g(['黃金桂', '黄金桂'], 'Golden Cassia (Huangjin Gui)')
g(['黃觀音', '黄观音'], 'Yellow Guanyin')
g(['黃玫瑰', '黄玫瑰'], 'Yellow Rose (Huang Mei Gui)')
g(['金佛'], 'Golden Buddha (Jin Fo)')
g(['奇蘭', '奇兰'], 'Wondrous Orchid (Qi Lan)')
g(['白芽奇蘭', '白芽奇兰'], 'White-Bud Wondrous Orchid')
g(['杏仁香'], 'Almond Fragrance')
g(['鴨屎香', '鸭屎香'], 'Duck-Dung Fragrance (famed aroma)')
g(['蜜蘭香', '蜜兰香'], 'Honey-Orchid Fragrance')
g(['宋種', '宋种'], 'Song Dynasty Cultivar')
g(['雪片'], 'Snow Flake (winter Dancong)')
g(['八仙單叢', '八仙单丛'], 'Eight Immortals Single-Bush')
g(['不知春'], 'Unknowing Spring (Bu Zhi Chun)')
g(['東方美人', '东方美人'], 'Eastern Beauty (Oriental Beauty)')
g(['包種茶', '包种茶'], 'Wrapped Style (Baozhong)')
g(['凍頂', '冻顶'], 'Frozen Summit (Dong Ding)')
g(['四季春'], 'Four Seasons of Spring (Sijichun)')
g(['青心烏龍', '青心乌龙'], 'Green-Heart Wulong (Qing Xin)')
g(['杉林溪'], 'Fir-Creek (Shanlinxi)')
g(['大禹嶺'], 'Great-Yu Ridge (Da Yu Ling)')
g(['梨山高山烏龍'], 'Lishan High-Mountain Wulong')
g(['阿里山高山烏龍'], 'Alishan High-Mountain Wulong')
g(['阿里山金萱'], 'Alishan Golden Lily (Jin Xuan)')
g(['金萱'], 'Golden Lily (Jin Xuan, milk oolong)')
g(['福壽山烏龍茶', '福寿山烏龙茶'], 'Fushou Mountain Wulong')
g(['頂湖烏龍茶', '顶湖乌龙茶'], 'Dinghu Wulong')
g(['龍鳳峽烏龍茶', '龙凤峡乌龙茶'], 'Dragon-Phoenix Gorge Wulong')
g(['奇萊山紅茶', '奇莱山红茶'], 'Qilai Mountain Red')
g(['紅玉白茶', '红玉白茶'], 'Ruby White Tea')
g(['紅水'], 'Red Water (Hong Shui style)')
g(['蜜香紅茶', '蜜香红茶'], 'Honey-Aroma Red Tea')
g(['火山烏龍', '火山乌龙'], 'Volcano Wulong')
g(['猴採鐵觀音', '猴采铁观音'], 'Monkey-Picked Iron Goddess')
g(['高山滇綠', '高山滇绿'], 'Highland Yunnan Green')
g(['佛手'], 'Buddha\u2019s Hand (Fo Shou)')
g(['歧韻白茶', '歧运白茶'], 'Qi-Yun White Tea')
g(['歧運紅茶', '歧运红茶'], 'Qi-Yun Red Tea')
g(['輕煙正山小種', '轻烟正山小种'], 'Light-Smoke Lapsang Souchong')
g(['桐木關正山小種', '桐木关正山小种'], 'Tongmu Pass Lapsang Souchong')
g(['山茶'], 'Mountain Tea (Shan Cha)')
g(['軟枝', '软枝'], 'Soft-Twig (Ruanzhi cultivar)')
g(['黃梔', '黄栀'], 'Gardenia Yellow')
# Vietnamese / Southeast Asian
g(['Ản Nhất'], 'An the First')
g(['Ản Nhị'], 'An the Second')
g(['Ản Tam'], 'An the Third')
g(['Ản Tứ'], 'An the Fourth')
g(['Ản Bí Mật'], 'An\u2019s Secret')
g(['Bạch Hồng Shan'], 'White-Red Mountain')
g(['Bạch Trà'], 'White Tea')
g(['Hồng Trà'], 'Red Tea (Vietnamese Black)')
g(['Hồng Trà Nhài'], 'Jasmine Red Tea')
g(['Hồng Trà Sen'], 'Lotus Red Tea')
g(['Shan Tuyết'], 'Snow Mountain (wild highland tea)')
g(['Măng Tím'], 'Purple Bamboo Shoot')
g(['Măng Trắng'], 'White Bamboo Shoot')
g(['Mật Ong Hồng Trà'], 'Honey Red Tea')
g(['Mật Ong'], 'Honey')
g(['Tôm Nõn'], 'Shrimp-Roe (tender-tip green)')
g(['Trà sen'], 'Lotus Tea')
g(['Lão Oolong'], 'Aged Wulong')
g(['Pu-er Tình Yêu'], 'Pu-er Love')
g(['Rừng Kỳ Diệu'], 'Magic Forest')
g(['Trà Trà Hoa Chi Tử'], 'Gardenia Green Tea')
# South/Southeast Asia estates & regional names
g(['दार्जिलिंग'], 'Darjeeling')
g(['मसाला चाय'], 'Spiced Tea (Masala Chai)')
g(['दूध पत्ती चाय'], 'Milk-Leaf Chai')
g(['मार्गारेट्स होप'], 'Margaret\u2019s Hope (estate)')
g(['हाजुआ'], 'Hajua (estate)')
g(['जस्बिरे'], 'Jasbire (village)')
g(['सिम्पानी'], 'Simpani (village)')
g(['सिक्किम'], 'Sikkim')
g(['कांगड़ा चाय'], 'Kangra Tea')
g(['कश्मीरी कहवा'], 'Kashmiri Kahwa')
g(['डोके ऊलंग'], 'Doke (estate) Wulong')
g(['बालासुन'], 'Balasun (estate)')
g(['நீலகிரி'], 'Blue Mountains (Nilgiri)')
g(['Rize çayı'], 'Rize Tea (Turkish Black Sea)')
g(['Söder te'], 'Söder Tea (Södermalm blend)')
g(['Краснодарский чай'], 'Krasnodar Tea')
g(['Іван-чай'], 'Ivan Chai (fermented fireweed)')
g(['τσάι του βουνού'], 'Mountain Tea (Sideritis)')
g(['სოჭის ჩაი'], 'Sochi Tea')
g(['ნაგომარი'], 'Nagomari (Georgian estate)')
g(['сүүтэй цай'], 'Milk Tea (Suutei Tsai)')
g(['نون چای'], 'Pink Salt Tea (Noon Chai)')
g(['شاهي حليب'], 'Royal Milk (Shahi Haleeb)')
g(['شاي الليمون المجفف'], 'Dried Lime Tea')
g(['أتاي'], 'Maghrebi Mint Tea')
g(['شاي كويتي'], 'Kuwaiti Tea')
# Tibet / Mongolia / Burma / Thailand
g(['ཇ་སྲུབ་མ'], 'Butter Tea (Chasu ma)')
g(['བོད་ཇ'], 'Tibetan Tea')
g(['ལྕང་མྱུག'], 'Willow Leaf Tea')
g(['လက်ဖက်'], 'Pickled Tea Leaf (Lahpet)')
g(['เมี่ยง'], 'Pickled Tea Leaf (Miang)')
# Korean
g(['홍차'], 'Red Tea (Korean Black)')
g(['황차'], 'Yellow Tea (Hwangcha)')
g(['하동황차'], 'Hadong Yellow Tea')
g(['재설차'], 'Lingering Snow Tea (Jaekseol)')
g(['세작'], 'Sparrow-Tongue Fine Pluck (Sejak)')
g(['우전'], 'Pre-Rain (Ujeon grade)')
g(['발효차'], 'Fermented Tea (Balhyeocha)')
g(['떡차 / 병차'], 'Rice-Cake Tea (pressed Tteokcha)')
g(['돈차'], 'Mound Tea (Doncha disc)')
g(['메밀차'], 'Buckwheat Tea')
g(['칡차'], 'Arrowroot Tea (Chik-Cha)')
g(['도화차'], 'Peach-Blossom Tea (Dohwa)')
g(['매화차'], 'Plum-Blossom Tea (Maehwa)')
g(['매실차'], 'Green-Plum Tea (Maesil)')
g(['옥수수 수염차'], 'Corn-Silk Tea')
g(['옥수수차'], 'Corn Tea')
g(['연잎차'], 'Lotus-Leaf Tea')
g(['감잎차'], 'Persimmon-Leaf Tea')
g(['모과차'], 'Quince Tea (Mogwa)')
g(['유자차'], 'Yuzu Tea (Yuja)')
g(['율무차'], 'Job\u2019s-Tears Tea (Yulmu)')
g(['쑥차'], 'Mugwort Tea (Ssuk)')
g(['계피차'], 'Cinnamon Tea (Gyepi)')
g(['오미자차'], 'Five-Flavor-Berry Tea (Omija)')
g(['결명자차'], 'Cassia-Seed Tea (Gyeolmyeongja)')
g(['표고차'], 'Shiitake-Mushroom Tea (Pyogo)')
g(['뿌리차'], 'Root Tea (Ppuri)')
g(['곡물차'], 'Grain Tea (Gokmul)')
g(['산약차'], 'Mountain-Yam Tea (Sanyak)')
g(['대추차'], 'Jujube Tea (Daechu)')
g(['귤향'], 'Tangerine Fragrance (Gyul-hyang)')
g(['수정과'], 'Sweet Cinnamon Punch (Sujeonggwa)')
g(['가별차'], 'Gabyul Tea (light ferment)')
g(['조숙차'], 'Goodnight Tea (Joseuk)')
g(['풍월차'], 'Relief Tea (Pungwol)')
g(['숨차'], 'Breathing Tea (Sum)')
g(['수초차'], 'Willow Tea (Sucho)')
# ---- slug-specific overrides (name-only / unique cases) ----
S = {
 # blends & breakfasts (no original_name): keep simple glosses
 'afternoon-gongfu': 'Afternoon Congou (blend)',
 'andrei-s-high-tea': 'Andrei\u2019s High Tea (blend)',
 'assam': 'Assam (region)',
 'australian-breakfast': 'Australian Breakfast Blend',
 'bvumbwe-hand-made-treasure': 'Bvumbwe Hand-Made Treasure (estate)',
 'bvumbwe-white-peony': 'Bvumbwe White Peony (estate)',
 'ceylon': 'Ceylon (Sri Lanka)',
 'ceylon-uva-blackwood': 'Uva Highlands Blackwood Ceylon',
 'chamomile-mint': 'Chamomile & Mint Herbal',
 'darjeeling': 'Darjeeling (region)',
 'earl-grey': 'Earl Grey (bergamot blend)',
 'earl-grey-with-natural-bergamot': 'Earl Grey w/ Natural Bergamot',
 'english-breakfast': 'English Breakfast Blend',
 'evening-gongfu': 'Evening Congou (blend)',
 'family-tea': 'Family Tea (household blend)',
 'ginger-root': 'Ginger Root Herbal',
 'green-sencha-with-apple-and-quince': 'Sencha with Apple & Quince',
 'green-tea-with-ginger-and-citrus-flavour': 'Green Tea w/ Ginger & Citrus',
 'hand-rolled-black-tea': 'Hand-Rolled Black Tea',
 'hibiscus': 'Hibiscus (Roselle) Herbal',
 'high-grown-ceylon': 'High-Grown Ceylon',
 'indian-breakfast': 'Indian Breakfast Blend',
 'indonesian-breakfast': 'Indonesian Breakfast Blend',
 'irish-breakfast': 'Irish Breakfast Blend',
 'japanese-breakfast': 'Japanese Breakfast Blend',
 'kenyan-breakfast': 'Kenyan Breakfast Blend',
 'korean-breakfast': 'Korean Breakfast Blend',
 'lady-chamomile-with-pink-pepper-and-rose-petals': 'Chamomile w/ Pink Pepper & Rose',
 'lady-grey': 'Lady Grey (bergamot-orange blend)',
 'lapacho': 'Lapacho (pau d\u2019arco bark)',
 'latumoni-spring-wonder': 'Latumoni Spring Pluck (estate)',
 'lavender': 'Lavender Herbal',
 'lemon-buttermilk': 'Lemon Buttermilk Blend',
 'lemongrass-herbal': 'Lemongrass Herbal',
 'malawi-fermented-tea': 'Malawi Fermented Dark Tea',
 'moringa-tea': 'Moringa Leaf Herbal',
 'morning-gongfu': 'Morning Congou (blend)',
 'nepalese-breakfast': 'Nepalese Breakfast Blend',
 'ofelia-tea': 'Ofelia Tea (house blend)',
 'organic-darjeeling-2nd-flush': 'Organic Darjeeling 2nd Flush',
 'organic-earl-grey-with-blue-cornflowers': 'Organic Earl Grey w/ Cornflower',
 'organic-greek-mountain-tea-with-orange': 'Greek Mountain Tea w/ Orange',
 'organic-indian-chai': 'Organic Indian Chai',
 'organic-mint-blend': 'Organic Mint Blend',
 'organic-sencha-w-summer-flowers': 'Organic Sencha w/ Summer Flowers',
 'organic-sing-herbal-mint-herbs-and-licorice-root': 'Sing Herbal Mint & Licorice',
 'organic-white-and-green-tea-with-rosehip-and-elderflower': 'White-Green w/ Rosehip & Elderflower',
 'organic-white-tea-with-geranium-and-elderflower': 'White Tea w/ Geranium & Elderflower',
 'pai-mu-tan-with-nettle-apple-and-cornflower': 'White Peony w/ Nettle, Apple, Cornflower',
 'peppermint': 'Peppermint Herbal',
 'prince-of-wales': 'Prince of Wales (honorary blend)',
 'purple-rain': 'Purple Rain (purple-leaf dark tea)',
 'rooibos-with-raspberries-and-cranberries': 'Rooibos w/ Raspberry & Cranberry',
 'rooibos-with-vanilla-pieces': 'Rooibos w/ Vanilla',
 'russian-caravan': 'Russian Caravan (smoke-tinged caravan blend)',
 'silver-needle-2': 'Silver Needle (Baihao Yinzhen)',
 'silver-rings': 'Silver Rings (curled white buds)',
 'sing-luxus-breakfast-tea': 'Luxury Breakfast Blend (Sing Tehus)',
 'sing-winter-tea': 'Sing Winter Blend',
 'sourenee': 'Sourenee (Darjeeling estate)',
 'sourenee-muscatel': 'Sourenee Muscatel (estate)',
 'student-breakfast': 'Student Breakfast (value strong blend)',
 'sweet-bombay': 'Sweet Bombay (masala-style blend)',
 'thyolo-oolong': 'Thyolo Wulong (Malawi highland)',
 'tongmu-orchid-grotto': 'Tongmu Orchid Grotto (black)',
 'tsheringma-tea': 'Tsheringma (Bhutanese safflower herbal)',
 'turmeric-tea': 'Turmeric Herbal',
 'upper-fagu-spring-wonder': 'Upper Fagu Spring Pluck (estate)',
 'white-and-green-tea-with-grapefruit-flowers': 'White-Green w/ Grapefruit & Flowers',
 'white-champagne': 'White-Champagne (pale sparkling cup)',
 'yorkshire-tea': 'Yorkshire (strong everyday blend)',
 # teas WITH unique original_name not generic
 'rolling-thunder': 'Rolling Thunder (Doke estate wulong)',
 'magic-forest': 'Magic Forest (Lung Vai ancient trees)',
 'green-forest': 'Green Forest (Snow Mountain green)',
 'green-snow-shan': 'Snow Mountain Green',
 'red-snow-shan': 'Snow Mountain Red',
 'white-snow-shan': 'Snow Mountain White',
 'red-forest': 'Red Forest (mountain red)',
 'red-star': 'Red Star (mountain red)',
 'president-tea': 'President (aged Moc Chau wulong)',
 'foggy-peak': 'Foggy Peak (aged Moc Chau wulong)',
 'deep-jungle': 'Deep Jungle (Lung Vai ancient trees)',
 'green-gardenia': 'Gardenia-Scented Green',
 'red-jasmine': 'Jasmine Red (blend)',
 'red-lotus': 'Lotus Red (blend)',
 'hou-s-dream': 'Hou\u2019s Dream (Snow Mountain green)',
 'hou-s-secret': 'Hou\u2019s Secret (honey red tea)',
 'an-s-secret': 'An\u2019s Secret (fermented dark)',
 'mang-tim': 'Purple Bamboo Shoot',
 'mang-trang': 'White Bamboo Shoot',
 'tom-non': 'Tender Shrimp-Tip Green',
 'mat-ong-hong-tra': 'Honey Red Tea',
 'mountain-honey-2019': 'Mountain Honey (ancient-tree raw)',
 'pu-er-love-1-0': 'Pu-er Love 1.0',
 'pu-er-love-2-0': 'Pu-er Love 2.0',
 'lao-oolong': 'Aged Wulong',
 'lao-ban-zhang-lao-shu-shu': 'Lao Banzhang Old Trees',
 'laobanzhang-lao-shu': 'Lao Banzhang Old Trees',
 'lao-mane-sheng': 'Lao Man\u2019e Raw',
 'laomane-shu-pu-erh-2022': 'Lao Man\u2019e Ripe',
 'lao-menghai-shu-cha': 'Aged Menghai Ripe',
 'lao-cha-wang': 'Old Tea King',
 'lao-cha-tou': 'Old Tea Nuggets',
 'lao-liu-bao': 'Aged Liupao',
 'lao-chuan-huang-da-cha': 'Aged Sichuan Large-Leaf Yellow',
 'huo-shan-wulong': 'Volcano Wulong',
 'huoshan-wild-huangya': 'Huoshan Wild Yellow Bud',
 'huoshan-huangya-tea': 'Huoshan Yellow Bud',
 'huang-ya': 'Huoshan Yellow Bud',
 'xiaguan-bian-xiao-cha': 'Border-Market Tea',
 'xiaguan-xiao-fa-tuo': 'Xiaguan France-Export Tuo',
 'xian-qicai-cha-ye-you-sheng': 'Organic Raw Tea',
 'ya-bao-red': 'Bud Sheath (Ya Bao, black)',
 'yesheng-bai-ya-tea': 'Wild White Bud',
 'yunnan-bai-mudan-lao-bai-cha': 'Aged Yunnan White Peony',
 'yunnan-chi-tse-beeng-cha': 'Seven-Sons Cake',
 'organic-muscatel-dragon-yunnan': 'Yunnan Red (Dianhong)',
 'wild-forest-nannuo-dianhong': 'Nannuo Yunnan Red',
 'nannuo-sheng-puer-wild-forest-2012': 'Nannuo Wild Raw',
 'jing-mai-gu-shu-sheng': 'Jingmai Ancient-Tree Raw',
 'xi-gui-lao-shu-sheng-tuo-cha': 'Xigui Old-Tree Raw Tuo',
 'xi-gui-gu-shu-sheng-cha': 'Xigui Ancient-Tree Raw',
 'xigui-gu-shu-mao-cha-2023': 'Xigui Ancient-Tree Mao Cha',
 'matai-gu-shu-sheng': 'Matai Ancient-Tree Raw',
 'matai-gu-shu-mao-cha-2021': 'Matai Ancient-Tree Mao Cha',
 'huang-cao-ba-gu-shu-mao-cha-2022': 'Huangcaoba Ancient-Tree Mao Cha',
 'bai-ying-gu-shu-mao-cha-2019': 'Baiying Ancient-Tree Mao Cha',
 'bai-ying-gu-shu-sheng': 'Baiying Ancient-Tree Raw',
 'gu-shu-bai-lu': 'Ancient-Tree White Dew',
 'lao-cha-bai-cha': 'Aged White Tea',
 'moli-baihao-yinzhen': 'Jasmine Silver Needle',
 'fuding-lao-cong-bai-mudan': 'Fuding Old-Tree White Peony',
 'fuding-bai-mudan': 'Aged Fuding White Peony',
 'zhenghe-bai-mudan': 'Zhenghe White Peony',
 'zhenghe-lao-bai-mudan': 'Zhenghe Aged White Peony',
 'zhenghe-huangye-bai-mudan': 'Zhenghe Wild White Peony',
 'zhenghe-huangye-shou-mei': 'Zhenghe Wild Longevity Eyebrow',
 'zhenghe-lao-cong-shou-mei': 'Zhenghe Old-Tree Longevity Eyebrow',
 'zhenghe-yuanya-bai-mudan': 'Zhenghe Far-Bud White Peony',
 'zhenghe-gongfu': 'Zhenghe Gongfu Red',
 'tan-yang-gongfu': 'Tanyang Gongfu Red',
 'bai-lin-gongfu': 'Bailin Gongfu Red',
 'feng-huang-gongfu-hong-cha': 'Phoenix Gongfu Red',
 'ming-jian-wu-yi-hong-cha': 'Mingjian Wuyi Red',
 'shui-sha-lian-hong-cha': 'Shuishalian Ruby #18 Red',
 'qi-yun-hong-cha': 'Qi-Yun Red',
 'qi-yun-bai-cha': 'Qi-Yun White',
 'qi-lai-shan-hong-cha': 'Qilai Mountain Red',
 'tou-cai-hong-cha': 'First-Pick Red',
 'da-xue-shan-gu-shu-shai-hong': 'Great Snow Mountain Sun-Dried Red',
 'gu-shu-shai-hong': 'Ancient-Tree Sun-Dried Red',
 'da-hong-pao-zhengyan': 'Big Red Robe (Zhengyan)',
 'tong-mu-guan-lapsang-souchong': 'Tongmu Pass Lapsang Souchong',
 'qingyan-lapsang-souchong': 'Light-Smoke Lapsang Souchong',
 'shan-cha-fujian': 'Fujian Mountain Tea',
 'shan-cha-taiwan': 'Taiwan Mountain Tea',
 'shui-jin-gui-tea': 'Golden Water Turtle',
 'jin-fo-tea': 'Golden Buddha',
 'jin-suo-chi': 'Golden Key',
 'ruanzhi-tea': 'Soft-Twig (Ruanzhi)',
 'ban-tian-yao-tea': 'Mid-Cliff Waist (Ban Tian Yao)',
 'bai-jiguan-tea': 'White Cockscomb',
 'wuyi-te-lo-han': 'Iron Arhat',
 'ma-tou-yan-tie-luo-han': 'Matouyan Iron Arhat',
 'dao-shui-keng-rougui': 'Daoshuikeng Cinnamon',
 'guanyin-yan-rougui': 'Guanyin-Rock Cinnamon',
 'hui-yuan-keng-rougui': 'Huiyuankeng Cinnamon',
 'hui-yuan-keng-100-year-shui-xian': 'Huiyuankeng Century-Old Narcissus',
 'hui-yuan-keng-beidou-da-hong-pao': 'Huiyuankeng Beidou Da Hong Pao',
 'da-keng-kou-lao-cong-shui-xian': 'Dakengkou Old-Tree Narcissus',
 'gao-cong-shui-xian': 'Tall-Tree Narcissus',
 'lao-cong-shui-xian': 'Old-Tree Narcissus',
 'wudong-lao-cong-shui-xian': 'Wudong Old-Tree Narcissus',
 'miaolian-shui-xian': 'Wondrous-Lotus Narcissus',
 'zhangping-shui-xian': 'Zhangping Narcissus Cake',
 'jianyang-shui-xian-bai': 'Jianyang Narcissus White',
 'shijiao-lao-cong-mei-zhan': 'Shijiao Old-Tree Meizhan',
 'zhuke-aijiao-wulong': 'Bamboo-Pit Short-Leg Wulong',
 'wuyi-bai-rui-xiang': 'White Daphne',
 'wuyi-yi-chuan-wu-long': 'Yancha Rock Wulong',
 'dahongpao-zhengyan-yancha': 'Big Red Robe (Zhengyan Yancha)',
 'song-zhong-dan-cong': 'Song Cultivar Dancong',
 'xing-ren-xiang-dan-cong': 'Almond Fragrance Dancong',
 'ya-shi-xiang-dan-cong': 'Duck-Dung Fragrance Dancong',
 'yu-lan-xiang-dan-cong': 'Magnolia Fragrance Dancong',
 'mi-lan-xiang': 'Honey-Orchid Fragrance Dancong',
 'ba-xian-dan-cong': 'Eight Immortals Dancong',
 'xue-pian-dan-cong': 'Snow-Flake Dancong',
 'classic-dan-cong': 'Classic Phoenix Dancong',
 'fenghuang-dancong': 'Phoenix Dancong',
 'monkey-picked-oolong': 'Monkey-Picked Iron Goddess',
 'qi-lan-tea': 'Wondrous Orchid',
 'huang-guanyin-tea': 'Yellow Guanyin',
 'huang-mei-gui-tea': 'Yellow Rose',
 'organ-yellow-pumpkin-and-turmeric': 'Organic Yellow Pumpkin & Turmeric',
 'organic-yellow-pumpkin-and-turmeric': 'Organic Yellow Pumpkin & Turmeric',
 'buckwheat-tea': 'Buckwheat Tea',
 'bukubuku': 'Bubbles (Bukubuku bubbly tea)',
 'bulang-dan-zhu-gu-shu-sheng': 'Bulang Single-Tree Ancient Raw',
 'ha-giang-dan-zhu-gu-shu-sheng': 'Ha Giang Single-Tree Ancient Raw',
 'bulang-shan-long-zhu-sheng': 'Bulang Dragon-Pearl Raw',
 'butter-tea': 'Butter Tea',
 'cao-bo-gu-shu': 'Ancient-Tree Ripe (Cao Bo)',
 'cao-bo-gu-shu-mao-cha-2014': 'Cao Bo Ancient-Tree Mao Cha',
 'lao-cai-gu-shu-mao-cha-2018': 'Lao Cai Ancient-Tree Mao Cha',
 'yen-bai-mao-cha-2023': 'Yen Bai Mao Cha',
 'dien-bien-gu-shu-mao-cha-2019': 'Dien Bien Ancient-Tree Mao Cha',
 'son-la-gu-shu-yellow-tea-2023': 'Son La Ancient-Tree Yellow',
 'lung-vai-bach-tra': 'Lung Vai White Tea',
 'tay-con-linh-lao-shu-sheng': 'Tay Con Linh Old-Tree Raw',
 'ha-giang-lao-sheng': 'Ha Giang Aged Raw',
 'ha-giang-lao-shu': 'Ha Giang Old-Tree Ripe',
 'ha-giang-gu-shu-shu-cha': 'Ha Giang Ancient-Tree Ripe',
 'gu-shu-da-ye-shu-cha': 'Ancient-Tree Large-Leaf Ripe',
 'wu-liang-gu-shu': 'Wuliang Ancient-Tree Ripe',
 'wu-liang-gu-shu-sheng': 'Wuliang Ancient-Tree Raw',
 'wangong-gu-shu-sheng': 'Wangong Ancient-Tree Raw',
 'yiwu-gu-shu-sheng': 'Yiwu Ancient-Tree Raw',
 'yiwu-gua-feng-zai-gu-shu-sheng': 'Guafengzhai Ancient-Tree Raw',
 'yiwu-gua-feng-zhai-mao-cha-2023': 'Guafengzhai Mao Cha',
 'gua-feng-zhai-yi-mo-yang-guang': 'Stroke of Sunlight (Guafengzhai)',
 'ming-feng-gu-shu-fang-cha': 'Square Brick Ancient-Tree Raw',
 'ming-feng-gu-shu-lao-cha-tou': 'Mingfeng Ancient-Tree Nuggets',
 'ming-feng-gu-shu-mao-cha-2021': 'Mingfeng Ancient-Tree Mao Cha',
 'ming-feng-gu-shu-sheng': 'Mingfeng Ancient-Tree Raw',
 'ming-feng-shan-zi-ya-mao-cha-2023': 'Ziya Mao Cha (Mingfeng Hill)',
 'man-song-man-wei-gu-shu-sheng': 'Mansong Manwei Ancient-Tree Raw',
 'ban-pen-lao-zhai-gu-shu-sheng': 'Banpen Laozhai Ancient-Tree Raw',
 'ban-pen-mao-cha': 'Ban Pen Mao Cha',
 'ba-nuo-gu-shu-sheng': 'Banuo Ancient-Tree Raw',
 'bulang-shou': 'Bulang Ripe',
 'nan-jian-bulang-shan-shu-cha': 'Nanjian Bulang Mountain Ripe',
 'mengku-rongshi-lao-shu': 'Mengku Rongshi Old Trees',
 'menghai-7542': 'Menghai Recipe 7542',
 'menghai-7572': 'Menghai Recipe 7572 Ripe',
 'menghai-gu-shu-sheng': 'Menghai Ancient-Tree Raw',
 'menghai-shu-cha': 'Menghai Ripe',
 'menghai-spring': 'Menghai Spring Ripe',
 'menghai-zhuan-cha': 'Menghai Brick',
 'mengku-gu-shu-sheng': 'Mengku Ancient-Tree Raw',
 'meng-ding-huang-xiao-cha': 'Mengding Small-Leaf Yellow',
 'meng-ding-huangya': 'Mengding Yellow Bud',
 'meng-ding-mao-feng': 'Mengding Woolly Peak',
 'mengding-ganlu-tea': 'Mengding Sweet Dew',
 'meng-song-lao-shu-sheng': 'Mengsong Old-Tree Raw',
 'yibang': 'Yibang (ancient mountain)',
 'yibang-wang-zi-shan-mao-cha-2023': 'Wangzishan Mao Cha (Yibang)',
 'yiwu-lao-shu': 'Yiwu Old-Tree Ripe',
 'yiwu-sheng': 'Yiwu Raw',
 'simao-gong-ting': 'Simao Palace-Grade Ripe',
 'banzhang-gong-ting': 'Banzhang Palace-Grade Ripe',
 'banzhang-jin-ya': 'Banzhang Golden Bud Ripe',
 'dayi-v93': 'Dayi Recipe V93 Ripe Tuo',
 'kunming-7581': 'Kunming Recipe 7581 Ripe Brick',
 'zhong-cha-8571': 'Zhongcha Recipe 8571 Ripe',
 'xiaguan-8663': 'Xiaguan Recipe 8663 Ripe',
 'xiaguan-jia-ji-tuo': 'Xiaguan Grade-A Tuo',
 'yaan-zangcha': 'Ya\u2019an Tibetan Tea',
 'qianliang-cha': 'Thousand-Tael Log Tea',
 'tianjian': 'Heavenly Tip',
 'gongjian': 'Tribute Tip',
 'jinjian': 'Golden Tip',
 'shengjian': 'Raw Tip',
 'fu-brick': 'Fu Brick Tea',
 'heizhuan-brick': 'Black Brick Tea',
 'huazhuan-brick': 'Flower Brick Tea',
 'kang-brick': 'Kang Brick Tea',
 'hubei-qingzhuan': 'Hubei Green Brick',
 'sheng-liu-bao': 'Raw Liupao',
 'liu-bao': 'Liupao (Six-Bastion Dark)',
 'jia-cang-liu-an': 'Fine-Cellared Liu\u2019an',
 'goishicha': 'Go-Stone Tea (fermented)',
 'awabancha': 'Awa Late Tea (lacto-fermented)',
 'ishizuchi-kurocha': 'Ishizuchi Dark Tea',
 'doncha': 'Mound Tea (Doncha)',
 'tteokcha': 'Rice-Cake Tea (Tteokcha)',
 'lahpet': 'Pickled Tea Leaf',
 'miang': 'Pickled Tea Leaf',
 'tibeti': 'Tibetan Brick Tea',
 'suutei-tsai': 'Milk Tea',
 'noon-chai': 'Pink Salt Tea',
 'shahi-haleeb': 'Royal Milk Tea',
 'dried-lime-tea': 'Dried Lime Tea',
 'kuwaiti-tea': 'Kuwaiti Tea',
 'maghrebi-mint-tea': 'Maghrebi Mint Tea',
 'doodh-pati-chai': 'Milk-Boiled Chai',
 'masala-chai': 'Spiced Chai',
 'noon': 'Pink Salt Tea',
 'ivan-chai': 'Ivan Chai (fireweed)',
 'krasnodar-tea': 'Krasnodar Tea (Russian)',
 'greek-mountain-tea': 'Greek Mountain Tea',
 'rize-tea': 'Rize Tea (Turkish)',
 'russian-caravan': 'Russian Caravan',
 'rooibos': 'Rooibos (Red Bush)',
 'green-mate': 'Green Mat\u00e9',
 'kashmiri-kahwa': 'Kashmiri Kahwa',
 'noon-chai': 'Pink Salt Tea',
 'shahi-haleeb': 'Royal Milk Tea',
 'sunrouge': 'Sun Rouge (red sun)',
 'butter-tea': 'Butter Tea',
 'tsai-tou-vounou': 'Mountain Tea (Greek)',
 'sujeonggwa': 'Cinnamon Punch (Sujeonggwa)',
 'gyeolmyeongja-cha': 'Cassia-Seed Tea',
 'omija-cha': 'Five-Flavor-Berry Tea',
 'ssuk-cha': 'Mugwort Tea',
 'gyepi-cha': 'Cinnamon Tea',
 'ogwa-cha': 'Five-Fruit Tea',
 'persimmon-leaf-tea': 'Persimmon-Leaf Tea',
 'lotus-tea': 'Lotus-Leaf Tea',
 'plum-blossom-tea': 'Plum-Blossom Tea',
 'peach-blossom-tea': 'Peach-Blossom Tea',
 'maesil-cha': 'Green-Plum Tea',
 'daechu-cha': 'Jujube Tea',
 'corn-silk-tea': 'Corn-Silk Tea',
 'corn-tea': 'Corn Tea',
 'yulmu-cha': 'Job\u2019s-Tears Tea',
 'yuja-cha': 'Citron Tea',
 'mogwa-cha': 'Quince Tea',
 'sanyak-tea': 'Mountain-Yam Tea',
 'yam-tea': 'Mountain-Yam Tea',
 'seed-tea': 'Grain Tea',
 'root-tea': 'Root Tea',
 'arrowroot-tea': 'Arrowroot Tea',
 'light-tea-fermented-herbs': 'Light Tea (fermented herbs)',
 'good-night-tea-fermented-herbs': 'Goodnight Tea (fermented herbs)',
 'relief-tea-fermented-herbs': 'Relief Tea (fermented herbs)',
 'breathing-tea-fermented-herbs': 'Breathing Tea (fermented herbs)',
 'willowy-tea-fermented-herbs': 'Willow Tea (fermented herbs)',
 'chik-tea': 'Arrowroot Tea',
 'buckwheat': 'Buckwheat Tea',
 'jeju-gyul-hyang': 'Tangerine Fragrance',
 'chrysanthemum-tea': 'Chrysanthemum Tea',
 'jasmine-green': 'Jasmine Green Tea',
 'ginseng-tea': 'Ginseng Tea',
 'ginger-tea': 'Ginger Tea',
 'jiaogulan': 'Jiaogulan Herb',
 'kokicha': 'Yellow-Wax-Tree Tea (Koki)',
 'konacha': 'Powder Tea',
 'mecha-tea': 'Bud Tea',
 'kukicha': 'Twig Tea',
 'kukicha-with-yuzu': 'Yuzu Twig Tea',
 'sencha-with-matcha': 'Sencha with Matcha',
 'genmaicha': 'Brown-Rice Tea',
 'genmaicha-with-matcha': 'Genmaicha with Matcha',
 'genmaicha-with-roasted-brown-rice-saga-no-yuki': 'Saga Snow Genmaicha',
 'obubu-genmai-roasted-brown-rice': 'Brown Rice (Genmai)',
 'kabusecha-shade-grown-2025': 'Shade-Grown Tea',
 'kabuse-okumidori-sencha-for-cold-brew': 'Shade-Grown Okumidori',
 'fukamushicha': 'Deep-Steamed Tea',
 'fukamushi-kabusecha-shade-grown-slow-steamed': 'Deep-Steamed Kabusecha',
 'sencha-limited': 'Limited-Edition Sencha',
 'sencha-shuppin-2024-exhibition-tea': 'Exhibition-Grade Sencha',
 'sencha-instant-40-grams': 'Instant Sencha',
 'aracha': 'Unrefined Rough Tea',
 'asamushi': 'Light-Steamed Sencha',
 'chumushi': 'Medium-Steamed Sencha',
 'irimushi': 'Pan-Steamed Hybrid Sencha',
 'tencha': 'Tencha (matcha base)',
 'shincha': 'First-Harvest Tea',
 'premium-shincha-no-120-2026': 'First-Harvest No. 120',
 'sayama-tea': 'Sayama Tea',
 'sayamakaori-ichibancha': 'Sayama-Aroma First Harvest',
 'chiran': 'Tea from Chiran',
 'yamecha': 'Tea from Yame',
 'gyokuro-yame': 'Yame Jade Dew',
 'gyokuro-oku-no-tsuyu': 'Dew of the Depths',
 'hon-gyokuro-mare': 'True Gyokuro Mare',
 'natural-black-gyokuro': 'Black Jade Dew',
 'kyoto-gyokuro': 'Kyoto Jade Dew',
 'premium-gyokuro-kiwami': 'Ultimate Jade Dew',
 'gyokuro-shuppin': 'Exhibition-Grade Jade Dew',
 'gyokuro-classic-edible-leaves': 'Edible Jade-Dew Leaves',
 'matcha-ujimukashi': 'Uji of Old',
 'matcha-uji-mukashi': 'Uji of Old',
 'matcha-unkaku-marukyu-koyamaen-ceremonial': 'Cloud Crane (Unkaku)',
 'matcha-wako-marukyu-koyamaen-ceremonial': 'Harmonious Light (Wako)',
 'matcha-oju-marukyu-koyamaen-ceremonial': 'Imperial Celebration (Oju)',
 'matcha-meiju-marukyu-koyamaen-ceremonial': 'Bright Achievement (Meiju)',
 'matcha-mumon': 'Gateless (Mumon)',
 'matcha-narino-20g-ceremonial': 'Narino Cultivar Matcha',
 'matcha-washimine': 'Eagle Peak',
 'matcha-hoshino': 'Star Field (Hoshino)',
 'matcha-kagoshima': 'Kagoshima Matcha',
 'organic-kagoshima-matcha-no-90': 'Kagoshima Matcha No. 90',
 'okumidori-matcha-25g-tin-ceremonial': 'Deep Green (Okumidori) Matcha',
 'natural-okumidori-matcha-25g-tin-ceremonial': 'Organic Deep-Green Matcha',
 'samidori-matcha-25g-tin-ceremonial': 'Samidori Cultivar Matcha',
 'matcha-samidori': 'Samidori Cultivar Matcha',
 'sencha-midori': 'Green (Midori)',
 'sencha-midori-nibancha': 'Midori Second Harvest',
 'haru-honoka': 'Subtle Spring',
 'sencha-agata-no-mori': 'Prefectural Forest',
 'sencha-dosenbo-ippin-sencha': 'Dosenbo Finest',
 'hokkyokusei-special-blend-sencha-tea': 'North Star (Hokkyokusei)',
 'organic-sencha-oritaen': 'Oritaen Garden Sencha',
 'kirishima-sencha': 'Kirishima Sencha',
 'organic-sencha-kirishima': 'Kirishima Sencha (organic)',
 'kagoshima-green-tea': 'Kagoshima Green',
 'sencha-mizudashi-cold-brew': 'Cold-Brew Sencha',
 'mizudashi-sencha-with-matcha-for-cold-brew-iced-tea': 'Cold-Brew Sencha with Matcha',
 'hanaka-hojicha': 'Flower-Aroma Hojicha',
 'white-leaf-hojicha': 'White-Roasted Hojicha',
 'oyatoko-no-hojicha': 'Papa\u2019s Hojicha',
 'hojicha-gold': 'Premium Hojicha (Gold)',
 'koyamaen-hojicha-powder': 'Powdered Hojicha (Hojicha-ko)',
 'hojicha-ko': 'Powdered Hojicha',
 'tamaryokucha': 'Curly-Ball Green',
 'kamairicha-tea': 'Pan-Fired Tea',
 'wakoucha': 'Japanese Black Tea',
 'miyazaki-zairai-wakoucha': 'Native-Cultivar Black Tea',
 'miyazaki-gaba-uroncha': 'GABA Wulong (Miyazaki)',
 'miyazaki-roasted-uroncha': 'Roasted Wulong (Miyazaki)',
 'miyazaki-spring-uroncha': 'Spring Wulong (Miyazaki)',
 'shimizu-koshun-uroncha': 'Shimizu Koshun Wulong',
 'green-jade-gaba': 'Green-Jade GABA',
 'red-jade-gaba': 'Red-Jade GABA',
 'jaekseol': 'Lingering-Snow Black (Jaekseol)',
 'saejak': 'Sparrow Tongue (fine pluck)',
 'sejak': 'Sparrow Tongue (fine pluck)',
 'ujeon': 'Pre-Rain Grade (Ujeon)',
 'hwang-cha': 'Yellow Tea',
 'hadong-yellow-tea': 'Hadong Hwangcha',
 'balhyeocha': 'Fermented Tea',
 'daejak': 'Large Pluck (Daejak grade)',
 'hongcha': 'Red Tea (Korean Black)',
 'japanese-breakfast': 'Japanese Breakfast Blend',
 'mugi-cha-japanese-barley-tea': 'Roasted Barley Tea',
 'jurokucha': 'Sixteen-Herb Blend',
 'goji-tea': 'Goji-Berry Tea',
 'chiran-tea': 'Chiran Tea',
 'tsugumi': 'Thrush (Tsugumi roast)',
 'damine': 'Damine (field-edge tea)',
 'fukuju': 'Fortune & Longevity',
 'ben-shan': 'Native Mountain (Ben Shan)',
 'mao-xie-hairy-crab': 'Hairy Crab (Mao Xie)',
 'fo-shou-tea': 'Buddha\u2019s-Hand',
 'huangjin-gui': 'Golden Cassia',
 'huangguanyin-tea': 'Yellow Guanyin',
 'huang-xiao-cha': 'Small-Leaf Yellow',
 'huang-da-cha': 'Large-Leaf Yellow',
 'four-seasons-of-spring': 'Four Seasons of Spring',
 'milky-oolong': 'Golden Lily (milk oolong)',
 'organic-jade-oolong': 'Green-Heart Wulong (Qing Xin)',
 'jin-xuan-wulong-lao-cha': 'Aged Golden Lily Wulong',
 'lao-cha-wang': 'Old Tea King',
 'dong-ting-bi-luo-chun': 'Green Snail Spring (Dongting)',
 'biluochun': 'Green Snail Spring',
 'dragonwell-long-jing': 'Dragon Well',
 'xihu-longjing': 'Dragon Well (West Lake)',
 'chun-mee': 'Precious Eyebrows',
 'gunpowder-green': 'Gunpowder Pearl',
 'emei-zhu-ye-qing': 'Bamboo-Leaf Green (Emei)',
 'zhuyeqing-tea': 'Bamboo-Leaf Green Tea',
 'enshi-yulu': 'Enshi Jade Dew',
 'nanjing-yuhua': 'Rain-Flower Green (Nanjing)',
 'duyun-maojian': 'Duyun Woolly Tip',
 'maojian-tea': 'Xinyang Woolly Tip',
 'weishan-maojian': 'Weishan Woolly Tip',
 'beigang-maojian': 'Beigang Woolly Tip',
 'gu-zhang-mao-jian': 'Guzhang Woolly Tip',
 'lushan-yunwu': 'Lushan Cloud-Mist',
 'yun-wu': 'Cloud-Mist',
 'hunan-zao-chun-yun-wu': 'Early-Spring Cloud-Mist',
 'dafang-tea': 'Valley-Treasure Dafang',
 'jiuqu-hongmei': 'Nine-Bend Red Plum',
 'anhua-song-zhen': 'Anhua Pine Needle',
 'anhua-heicha': 'Anhua Dark Tea',
 'gongmei': 'Tribute Eyebrow',
 'shoumei-tea': 'Longevity Eyebrow',
 'white-peony': 'White Peony (Bai Mu Dan)',
 'silver-needle': 'Silver Needle (Baihao Yinzhen)',
 'junshan-yinzhen': 'Junshan Silver Needle',
 'meng-ding-huangya': 'Mengding Yellow Bud',
 'mogan-huangya': 'Mogan Yellow Bud',
 'huoshan-huangya-tea': 'Huoshan Yellow Bud',
 'pingyang-huangtang': 'Pingyang Yellow Broth',
 'wenzhou-huangtang': 'Wenzhou Yellow Broth',
 'yuanan-luyuan': 'Deer-Park Yellow (Luyuan)',
 'taiping-houkui': 'Monkey Chief (Taiping Houkui)',
 'luan-guapian': 'Lu\u2019an Melon Seed',
 'keemun': 'Keemun Red',
 'qimen-jin-zhen': 'Keemun Golden Needle',
 'qimen-mao-feng': 'Keemun Mao Feng',
 'dian-hong-jin-hao': 'Yunnan Golden Hair-Tip',
 'dian-hong-jin-luo': 'Yunnan Golden Snail',
 'dian-hong-jin-ya': 'Yunnan Golden Bud',
 'dian-hong-jin-zhen': 'Yunnan Golden Needle',
 'dianhong': 'Yunnan Red',
 'organic-golden-yunnan': 'Golden Yunnan Red',
 'golden-monkey-tea': 'Golden Monkey',
 'jin-jun-mei-tea': 'Golden Steed Eyebrow',
 'lapsang-souchong': 'Lapsang Souchong',
 'yihong': 'Yihong (Yichang Red)',
 'yihong-gongfu-hong-cha': 'Yihong Gongfu Red',
 'yingdehong-tea': 'Yingde Red',
 'chuanhong-gongfu': 'Sichuan Gongfu Red',
 'ninghong-gongfu': 'Ninghong Gongfu Red',
 'yuehong-gongfu': 'Yuehong Gongfu Red',
 'yixing-gongfu-hong-cha': 'Yixing Gongfu Red',
 'zhenghe-gongfu': 'Zhenghe Gongfu Red',
 'tan-yang-gongfu': 'Tanyang Gongfu Red',
 'feng-huang-gongfu-hong-cha': 'Phoenix Gongfu Red',
 'bai-lin-gongfu': 'Bailin Gongfu Red',
 'qiman': 'Keemun',
 'ching-yuen-cha': 'Azure-Wish Tea',
 'chen-pi-shu-cha': 'Tangerine-Peel Ripe',
 'tea-horse-road-shu-puer-2006': 'Tea-Horse-Road Ripe',
 'lao-tong-zhi': 'Old Comrade',
 'yunnan-chi-tse-beeng-cha': 'Seven-Sons Cake',
 'menghai-spring': 'Menghai Spring Ripe',
 'banzhang-gong-ting': 'Banzhang Palace Ripe',
 'simao-gong-ting': 'Simao Palace Ripe',
 'lao-menghai-shu-cha': 'Aged Menghai Ripe',
 'bulang-shou': 'Bulang Ripe',
 'bu-lang-shan-shu-cha': 'Bulang Mountain Ripe',
 'nan-jian-bulang-shan-shu-cha': 'Nanjian Bulang Ripe',
 'nan-jian-sheng-tuo': 'Nanjian Raw Tuo',
 'nan-jian-tuo-shu-cha': 'Nanjian Ripe Tuo',
 'lao-ban-zhang-lao-shu-shu': 'Lao Banzhang Old Trees',
 'lao-banzhang-sheng': 'Lao Banzhang Raw',
 'lao-man-er-lao-shu-sheng': 'Lao Man\u2019e Old-Tree Raw',
 'lao-man-er-zhuan-shu-cha': 'Lao Man\u2019e Ripe Brick',
 'lao-mane-sheng': 'Lao Man\u2019e Raw',
 'laomane-shu-pu-erh-2022': 'Lao Man\u2019e Ripe',
 'lao-man-e-guoyoulin-sheng': 'Lao Man\u2019e State-Forest Raw',
 'laobanzhang-gu-cha-chang': 'Lao Banzhang Old Tea Factory',
 'nannuo-sheng': 'Nannuo Raw',
 'nannuo-sheng-puer-wild-forest-2012': 'Nannuo Wild Raw',
 'nannuo-sheng-puer-wild-forest': 'Nannuo Wild Raw',
 'wild-forest-nannuo-dianhong': 'Nannuo Yunnan Red',
 'bing-dao-gu-shu-mao-cha-2023': 'Bingdao Ancient-Tree Mao Cha',
 'bing-dao-gu-shu-sheng': 'Bingdao Ancient-Tree Raw',
 'bingdao-sheng': 'Bingdao Raw',
 'da-xue-shan-gu-shu-mao-cha-2022': 'Great-Snow-Mountain Ancient-Tree Mao Cha',
 'da-xue-shan-gu-shu-sheng': 'Great-Snow-Mountain Ancient-Tree Raw',
 'da-xue-shan-sheng': 'Yongde Great-Snow-Mountain Raw',
 'jing-mai-gu-shu-sheng': 'Jingmai Ancient-Tree Raw',
 'jingmai-sheng': 'Jingmai Raw',
 'jingshan-mao-feng': 'Jingshan Woolly Peak',
 'jingshan-maofeng': 'Jingshan Woolly Peak',
 'xinyang-maojian': 'Xinyang Woolly Tip',
 'maojian-tea': 'Xinyang Woolly Tip',
 'duyun-maojian': 'Duyun Woolly Tip',
 'gu-zhang-mao-jian': 'Guzhang Woolly Tip',
 'anji-bai-cha': 'Anji White (green)',
 'da-yu-ling-gao-shan-wulong': 'Great-Yu-Ridge High-Mountain Wulong',
 'lishan-oolong': 'Lishan High-Mountain Wulong',
 'alishan-gao-shan-wulong': 'Alishan High-Mountain Wulong',
 'alishan-oolong': 'Alishan High-Mountain Wulong',
 'alishan-jin-xuan': 'Alishan Golden Lily',
 'bagua-shan-cui-yu': 'Baguashan Jade-Jade (Cuiyu)',
 'dinghu-alishan-oolong': 'Dinghu Alishan Wulong',
 'fushou-shan-oolong': 'Fushou-Mountain Wulong',
 'long-feng-xia-oolong': 'Dragon-Phoenix Gorge Wulong',
 'shanlin-xi-gaba': 'Shanlinxi GABA',
 'dongfang-meiren-tea': 'Eastern Beauty',
 'tung-ting-tea': 'Frozen Summit (Dong Ding)',
 'baozhong': 'Wrapped Style (Baozhong)',
 'san-xia-mi-xiang': 'Sanxia Honey-Aroma Red',
 'hong-yu-bai-cha': 'Ruby White Tea',
 'hong-shui': 'Red Water (Hong Shui)',
 'hong-bi-luo': 'Red Snail',
 'organic-china-leaf-oolong-shui-xian': 'Narcissus Wulong',
 'shui-xian': 'Narcissus Wulong',
 'rougui-tea': 'Cinnamon (Rou Gui)',
 'tie-guan-yin': 'Iron Goddess of Mercy',
 'tieguanyin': 'Iron Goddess of Mercy',
 'tieluohan-tea': 'Iron Arhat',
 'wuyi-te-lo-han': 'Iron Arhat',
 'dahongpao-zhengyan-yancha': 'Big Red Robe',
 'wuyi-bai-rui-xiang': 'White Daphne',
 'wuyi-yi-chuan-wu-long': 'Yancha Rock Wulong',
 'huo-shan-wulong': 'Volcano Wulong',
 'hei-moli-zhucha': 'Black Jasmine Pearl',
 'organic-black-jasmine-pearls': 'Black Jasmine Pearl',
 'red-jasmine': 'Jasmine Red',
 'hei-mu-li-zhu-cha': 'Black Jasmine Pearl',
 'he-mu-li-zhu-cha': 'Black Jasmine Pearl',
 'baimao-hou': 'White-Haired Monkey',
 'benifuki': 'Red Windmill (Benifuki)',
 'organic-benifuki': 'Benifuki (Red Windmill)',
 'sencha-shuppin': 'Exhibition Sencha',
 'sencha-agata-no-mori': 'Prefectural Forest',
 'ajisai-matcha': 'Hydrangea Matcha',
 'fukamushi-kabusecha': 'Deep-Steamed Kabusecha',
 'fukamushi-kabusecha-shade-grown-slow-steamed': 'Deep-Steamed Kabusecha',
 'kabusecha': 'Shade-Grown Tea',
 'kabusecha-shade-grown': 'Shade-Grown Tea',
 'sencha-instant': 'Instant Sencha',
 'mizudashi-sencha': 'Cold-Brew Sencha',
 'koyamaen-hojicha-powder': 'Powdered Hojicha',
 'hanaka-hojicha': 'Flower-Fragrance Hojicha',
 'shimizu-koshun-uroncha': 'Shimizu Koshun Wulong',
 'miyazaki-gaba-uroncha': 'GABA Wulong',
 'miyazaki-roasted-uroncha': 'Roasted Wulong',
 'miyazaki-spring-uroncha': 'Spring Wulong',
 'miyazaki-zairai-wakoucha': 'Native-Cultivar Black',
 'natural-okumidori-matcha-25g-tin-ceremonial': 'Organic Okumidori Matcha',
 'okumidori-matcha-25g-tin-ceremonial': 'Okumidori Matcha',
 'samidori-matcha-25g-tin-ceremonial': 'Samidori Matcha',
 'matcha-ujimukashi': 'Uji of Old (Mukashi)',
 'matcha-unkaku-marukyu-koyamaen-ceremonial': 'Cloud Crane (Unkaku)',
 'matcha-wako-marukyu-koyamaen-ceremonial': 'Harmonious Light (Wako)',
 'matcha-oju-marukyu-koyamaen-ceremonial': 'Imperial Celebration (Oju)',
 'matcha-meiju-marukyu-koyamaen-ceremonial': 'Bright Achievement (Meiju)',
 'matcha-mumon': 'Gateless (Mumon)',
 'matcha-narino-20g-ceremonial': 'Narino Cultivar Matcha',
 'matcha-washimine': 'Eagle Peak (Washimine)',
 'matcha-hoshino': 'Star Field (Hoshino)',
 'matcha-kagoshima': 'Kagoshima Matcha',
 'japanese-matcha-yamabuki-top-quality-for-matcha-latte': 'Golden Yellow (Yamabuki)',
 'yamabuki-nadeshiko': 'Golden Pink (Yamabuki Nadeshiko)',
 'matcha-mukashi': 'Uji of Old (Mukashi)',
 'org-yellow-pumpkin-and-turmeric': 'Organic Yellow Pumpkin & Turmeric',
 'org-yellow-pumpkin-turmeric': 'Organic Yellow Pumpkin & Turmeric',
 'butter-tea': 'Butter Tea',
 'tibeti': 'Tibetan Tea',
 'lahpet': 'Pickled Tea Leaf',
 'miang': 'Pickled Tea Leaf',
 'pu-er-bai-ya-bao': 'White Bud Sheath (Bai Ya Bao)',
 'ya-bao-red': 'Bud Sheath Black (Ya Bao)',
 'yesheng-bai-ya-tea': 'Wild White Bud',
 'xian-qicai-cha-ye-you-sheng': 'Organic Raw Tea',
 'söder-tea': 'Söder (Södermalm Blend)',
 'east-friesland-tea-blend': 'East-Frisian Blend (Ostfriesentee)',
 'oyatoko-no-hojicha': 'Papa\u2019s Hojicha',
}

rows = []
for line in open('/tmp/teas_names.tsv'):
    parts = line.rstrip('\n').split('\t')
    if len(parts) != 4 or parts[0] == 'slug': continue
    rows.append(dict(zip(['slug','name','orig','type'], parts)))

translation_map = {}
missed = []
for r in rows:
    slug, name, orig, ttype = r['slug'], r['name'].strip(), r['orig'].strip(), r['type']
    year = ''
    m = re.search(r'\b(?:19|20)\d{2}\b', name)
    if m: year = name[m.start():m.end()]
    val = None
    if slug in S:
        val = S[slug]
    elif orig in G:
        val = G[orig]
        if year and year not in val:
            val = f"{val} ({year})"
    else:
        val = None
    if not val:
        missed.append((slug, name, orig))
        continue
    translation_map[slug] = val

with open('/home/denandras/projects/teapp/scripts/translation_map.json', 'w') as f:
    json.dump(translation_map, f, ensure_ascii=False, indent=2)

print('mapped:', len(translation_map))
print('missed:', len(missed))
for slug, name, orig in missed:
    print('MISS', slug, '|', name, '|', orig)