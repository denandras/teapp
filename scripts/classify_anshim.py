#!/usr/bin/env python3
"""Classify AN SHIM TEA catalog -> teapp teas rows.

Output: /tmp/anshim-classified.json with fields:
  name, slug, original_name, description, origin, tea_type, category,
  color_hex, source_type, source, is_public, skipped/reason
"""
import json, re, unicodedata, html as H

data = json.load(open('/tmp/anshim-clean.json'))

def uid_of(title, url_hint=None):
    hits = [d for d in data if d['title'] == title]
    if url_hint:
        hits = [d for d in hits if url_hint in d['url']]
    assert len(hits) == 1, f"non-unique: {title}: {[d['uid'] for d in hits]}"
    return hits[0]['uid']

# tea_type enum: green white black oolong sheng_puerh shou_puerh dark yellow tisane blend
# category enum: true_tea blend tisane

CLS = {}  # uid -> dict(tea_type, category, original_name, name_override)
def cls(title, ttype, cat, orig, name_override=None):
    CLS[uid_of(title)] = dict(tea_type=ttype, category=cat, original_name=orig,
                              name_override=name_override)

# ---------- SKIP (sample sets, non-teas) ----------
SKIP = {}
for d in data:
    if 'TAKE FIVE' in d['title']:
        SKIP[d['uid']] = 'sample set'

# ---------- Duplicates of existing default teas (verified against DB) ----------
DUPES = {}
for nm in [
    'Anji Bai Cha', 'Huang Shan Mao Feng', 'Lu Shan Yun Wu', 'Enshi Yu Lu',
    'Ujeon', 'Tamaryokucha', 'Sencha', 'Kukicha', 'Kabusecha', 'Gyokuro',
    'Tencha', 'Hojicha', 'Genmaicha', 'Yue Guang Bai', 'Si Ji Chun',
    'Jiu Qui Hong Mei', 'Meng Ding Gan Lu', "Lu'An Gua Pian",
    '2020 Ishizuchi Kurocha', 'Dong Fang Mei Ren',
    'Fuding Bai Hao Yin Zheng', 'Fuding Bai Mudan', 'Fuding Gong Mei',
    'Wuyi Jin Jun Mei', '2024 Wuyi Shui Jin Gui', '2022 Wuyi Bai Ji Guan',
    '2024 Wuyi Qi Lan', '2024 Wuyi Da Hong Pao', '2024 Wuyi Rou Gui',
    '2022 Wuyi Lao Cong Shui Xian', 'Zheng Shan Xiao Zhong',
    'Jin Mao Huo', 'Qi Men Hong Xiang',
    'Dong Ding Competition', 'Dong Ding',
    'Qing Xiang Tie Guan Yin', 'Te Ji Qing Xiang Tie Guan Yin',
    'Nong Xiang Tie Guan Yin', '2019 Tan Bei Tie Guan Yin',
    'Milan Xiang Dan Cong', '2016 Don cha', '2022 Goishicha',
    'Benifuki Wakoucha', 'Kamairicha',
]:
    DUPES[uid_of(nm)] = nm

# internal dupes (year-strip collisions, keep richer-description row)
SKIP[uid_of('2017 Bing Dao Gu Shu Sheng')] = 'internal dupe of 2014 Bing Dao (year-strip collision, kept richer)'
SKIP[uid_of('2022 YiWu Gu Shu Sheng')] = 'internal dupe of 2004 YiWu (year-strip collision, kept richer)'

# ---------- AN SHIM PRODUCTION (Vietnam mostly) ----------
cls('DEEP JUNGLE', 'sheng_puerh', 'true_tea', 'Mao Chà')
cls('BAN BE SNOW SHAN', 'sheng_puerh', 'true_tea', 'Mao Chà')
cls("Andrei's High Tea", 'blend', 'blend', '')
cls('WHITE FOREST', 'white', 'true_tea', 'Bạch Trà')
cls("HOU'S SECRET", 'black', 'true_tea', 'Hồng Trà')
for nm in ['MORNING GONGFU', 'STUDENT BREAKFAST', 'AFTERNOON GONGFU', 'EVENING GONGFU', 'FAMILY TEA']:
    cls(nm, 'blend', 'blend', '')
cls('120/80', 'black', 'true_tea', 'Hồng Trà')
cls("2023 PU'RE LOVE 1.0", 'sheng_puerh', 'true_tea', 'Pu-er Tình Yêu')
cls("2019 PU'RE LOVE 2.0", 'sheng_puerh', 'true_tea', 'Pu-er Tình Yêu')
cls('2022 MAGIC FOREST', 'sheng_puerh', 'true_tea', 'Rừng Kỳ Diệu')
cls('2022 "7566" (AN I)', 'sheng_puerh', 'true_tea', 'Ản Nhất')
cls('2023 "AN II"', 'sheng_puerh', 'true_tea', 'Ản Nhị')
cls('2023 "AN III"', 'sheng_puerh', 'true_tea', 'Ản Tam')
cls('2023 "AN IV"', 'sheng_puerh', 'true_tea', 'Ản Tứ')
cls('Mountain Honey 2019', 'sheng_puerh', 'true_tea', 'Mật Ong')  # aged mao cha
cls('Ivan Chai', 'tisane', 'tisane', 'Іван-чай')  # rosebay willowherb, Latvia
cls('GREEN GARDENIA', 'green', 'true_tea', 'Trà Trà Hoa Chi Tử')  # gardenia-scented green
cls('2024 RED JASMINE', 'blend', 'blend', 'Hồng Trà Nhài')  # jasmine red = scented
cls('2024 RED LOTUS', 'blend', 'blend', 'Hồng Trà Sen')  # lotus red = scented
cls('Qi Lai Shan Hong Cha', 'black', 'true_tea', '奇萊山紅茶')
for nm in ['Korean Breakfast', 'Indonesian Breakfast', 'Australian Breakfast',
           'Nepalese Breakfast', 'Indian Breakfast', 'Kenyan Breakfast', 'Japanese Breakfast']:
    cls(nm, 'blend', 'blend', '')

# Black tea section
cls('Rolling Thunder', 'oolong', 'true_tea', 'Doke Wulong')  # Bihar Doke Oolong!
cls('Jasbire Wonder', 'black', 'true_tea', 'जस्बिरे')  # Nepal first flush black
cls("Margaret's Hope", 'black', 'true_tea', 'मार्गारेट्स होप')
cls('Balasun', 'black', 'true_tea', 'बालासुन')
cls('Dian Hong Jin Hao', 'black', 'true_tea', '滇红金毫')
cls('Hajua Special', 'black', 'true_tea', 'हाजुआ')
cls('Nagomari Black Tea', 'black', 'true_tea', 'ნაგომარი')  # Georgian

# Green section (China/Korea/Vietnam/Japan)
cls('Emei Zhu Ye Qing', 'green', 'true_tea', '竹叶青')
cls('Dong Ting Bi Luo Chun', 'green', 'true_tea', '碧螺春')
cls('Gu Zhang Mao Jian', 'green', 'true_tea', '古丈毛尖')
cls('Anhua Song Zhen', 'green', 'true_tea', '安化松针')
cls('Hunan Zao Chun Yun Wu', 'green', 'true_tea', '早春云雾')
cls('Gao Shan Dian Lu', 'green', 'true_tea', '高山滇绿')
cls('Saejak', 'green', 'true_tea', '세작')  # saejak hangul
cls('Daejak', 'green', 'true_tea', '대작')
cls('Tôm Nõn', 'green', 'true_tea', 'Tôm Nõn')  # Vietnamese native already
cls('GREEN SNOW SHAN', 'green', 'true_tea', 'Shan Tuyết')
cls("HOU'S DREAM", 'green', 'true_tea', 'Shan Tuyết')
cls('Hanaka Hojicha', 'green', 'true_tea', '花香焙茶')
cls('Matcha Washimine', 'green', 'true_tea', '鷲峰')
cls('Matcha Kagoshima', 'green', 'true_tea', '鹿児島抹茶')
cls('Matcha Hoshino', 'green', 'true_tea', '星野抹茶')
cls('GREEN JADE GABA', 'green', 'true_tea', '佳葉龍茶')  # GABA oolong green style

# White section
cls("Pu'er Bai Ya Bao", 'white', 'true_tea', '白芽苞')
cls('2014 Fuding Bai Mudan', 'white', 'true_tea', '老白牡丹')  # name: aged => Lao Bai Mudan
cls('2011 Lao Cha Bai Cha', 'white', 'true_tea', '老茶白茶')
cls('2015 Fuding Shou Mei', 'white', 'true_tea', '寿眉')
cls('2017 Yunnan Bai Mudan Lao Bai Cha', 'white', 'true_tea', '老白茶')
cls('2020 Gu Shu Bai Lu', 'white', 'true_tea', '白露')

# Yellow
cls('Huang Ya', 'yellow', 'true_tea', '霍山黄芽')
cls('Huang Da Cha', 'yellow', 'true_tea', '黄大茶')
cls('Huang Xiao Cha', 'yellow', 'true_tea', '黄小茶')
cls("Sơn La Gu Shu Yellow Tea 2023", 'yellow', 'true_tea', 'Mao Chà')  # VN yellow from mao cha

# Oolong
cls('Yu Lan Xiang Dan Cong', 'oolong', 'true_tea', '玉兰香')
cls('Xue Pian Dan Cong', 'oolong', 'true_tea', '雪片')
cls('Song Zhong Dan Cong', 'oolong', 'true_tea', '宋种')
cls('Ya Shi Xiang Dan Cong', 'oolong', 'true_tea', '鸭屎香')
cls('Xing Ren Xiang Dan Cong', 'oolong', 'true_tea', '杏仁香')
cls('1992 Classic Dan Cong', 'oolong', 'true_tea', '凤凰单丛')
cls('2022 Wuyi Yi Chuan Wu Long', 'oolong', 'true_tea', '岩茶')
cls('Huo Shan Wulong', 'oolong', 'true_tea', '火山乌龙')
cls('Bai Ya Qi Lan', 'oolong', 'true_tea', '白芽奇兰')
cls('2021 Wuyi Bai Rui Xiang', 'oolong', 'true_tea', '白瑞香')
cls('2018 Wuyi Te Lo Han', 'oolong', 'true_tea', '铁罗汉')
cls('Da Yu Ling Gao Shan Wulong', 'oolong', 'true_tea', '大禹嶺')
cls('Alishan Gao Shan Wulong', 'oolong', 'true_tea', '阿里山')
cls('Bagua Shan Cui Yu', 'oolong', 'true_tea', '八卦山翠玉')
cls('Hong Shui', 'oolong', 'true_tea', '紅水')
cls('2009 Lao Cha Wang', 'oolong', 'true_tea', '老茶王')
cls('1996 Jin Xuan Wulong Lao Cha', 'oolong', 'true_tea', '老茶')
cls('2022 Yamabuki Nadeshiko', 'dark', 'true_tea', '山吹撫子')  # Japanese fermented (goishicha-style)
cls('Miyazaki Spring Uroncha', 'oolong', 'true_tea', '春烏龍茶')
cls('Shimizu Koshun Uroncha', 'oolong', 'true_tea', '烏龍茶')
cls('Miyazaki Gaba Uroncha', 'oolong', 'true_tea', 'ギャバ烏龍茶')
cls('Miyazaki Roasted Uroncha', 'oolong', 'true_tea', '焙じ烏龍茶')
cls('Sayamakaori Ichibancha', 'green', 'true_tea', '狭山香ori一番茶'.replace('狭山香ori', '狭山香'))
cls('Thyolo Oolong', 'oolong', 'true_tea', 'Thyolo')  # Malawi - English native region name
cls('Balhyeocha', 'oolong', 'true_tea', '발효차')
cls('RED JADE GABA', 'oolong', 'true_tea', '佳葉龍茶')
cls('2017 Lão Oolong', 'oolong', 'true_tea', 'Lão Oolong')  # VN aged wulong
cls('2014 PRESIDENT TEA', 'oolong', 'true_tea', 'Lão Oolong')
cls('2013 Foggy Peak', 'oolong', 'true_tea', 'Lão Oolong')
cls('Hong Yu Bai Cha', 'white', 'true_tea', '紅玉白茶') if False else None
cls('2019 Hong Yu Bai Cha', 'white', 'true_tea', '紅玉白茶')
cls('Qi Yun Bai Cha', 'white', 'true_tea', '歧韻白茶')
cls('Qi Yun Hong Cha', 'black', 'true_tea', '歧運紅茶')
cls('Shui Sha Lian Hong Cha', 'black', 'true_tea', '紅玉')  # Ruby #18
cls('San Xia Mi Xiang', 'black', 'true_tea', '蜜香紅茶')
cls('Ming Jian Wu Yi Hong Cha', 'black', 'true_tea', '紅茶')
_shan_uids = sorted(d['uid'] for d in data if d['title'] == 'Shan Cha')
_shan_by_url = {d['uid']: d['url'] for d in data if d['title'] == 'Shan Cha'}
for _su, _u in _shan_by_url.items():
    if 'mountain-tea' in _u:   # Taiwan wild black
        CLS[_su] = dict(tea_type='black', category='true_tea', original_name='山茶',
                        name_override='Shan Cha (Taiwan)')
    else:                       # Fujian green
        CLS[_su] = dict(tea_type='green', category='true_tea', original_name='山茶',
                        name_override='Shan Cha (Fujian)')

# Black/red tea section (Chinese + others)
cls('Gu Shu Shai Hong', 'black', 'true_tea', '晒红')
cls('2016 Yixing Gongfu Hong Cha', 'black', 'true_tea', '宜興工夫紅茶')
cls('Dian Hong Jin Zhen', 'black', 'true_tea', '滇红金针')
cls('Dian Hong Jin Ya', 'black', 'true_tea', '滇红金芽')
cls('Tou Cai Hong Cha', 'black', 'true_tea', '頭採紅茶')
cls('Yihong Gongfu Hong Cha', 'black', 'true_tea', '宜紅工夫')
cls('Hong Bi Luo', 'black', 'true_tea', '红碧螺')
cls('Feng Huang Gongfu Hong Cha', 'black', 'true_tea', '鳳凰工夫紅茶')
cls('RED SNOW SHAN', 'black', 'true_tea', 'Shan Tuyết')
cls('RED FOREST', 'black', 'true_tea', 'Shan Tuyết')
cls('Mật Ong Hồng Trà', 'black', 'true_tea', 'Mật Ong Hồng Trà')
cls('Hongcha', 'black', 'true_tea', '홍차')
cls('Bvumbwe Hand-made Treasure', 'black', 'true_tea', 'Bvumbwe')
cls('Hand-rolled Black Tea', 'black', 'true_tea', 'Hand-rolled')  # Sri Lanka English native
cls('Ceylon Uva Blackwood', 'black', 'true_tea', 'Uva Blackwood')
cls('High Grown Ceylon', 'black', 'true_tea', 'Dimbula OP')
cls('Upper Fagu Spring Wonder', 'black', 'true_tea', 'Upper Fagu')
cls('Sourenee', 'black', 'true_tea', 'Sourenee')
cls('Sourenee Muscatel', 'black', 'true_tea', 'Sourenee Muscatel')
cls('Latumoni Spring Wonder', 'black', 'true_tea', 'Latumoni')

# Hei cha section
cls('2017 Zhou Jia Gou Fu Zhuan Hei Cha', 'dark', 'true_tea', '花磚')  # Anhua fu zhuan
cls('2008 Bai Sha Xi Fu Zhuan Cha', 'dark', 'true_tea', '茯磚')
cls('2011 Ching Yuen Cha', 'dark', 'true_tea', '青願茶')
cls('2009 Jia Cang Liu An', 'dark', 'true_tea', '佳倉六安')
cls('1981 Lao Liu Bao', 'dark', 'true_tea', '老六堡')
cls('2018 Malawi Fermented Tea', 'dark', 'true_tea', 'Malawi Fermented')

# Sheng pu'er section (Mao cha + pressed)
cls('Da Xue Shan Gu Shu Mao Cha 2022', 'sheng_puerh', 'true_tea', '毛茶')
cls('Huang Cao Ba Gu Shu Mao Cha 2022', 'sheng_puerh', 'true_tea', '毛茶')
cls('Ming Feng Gu Shu Mao Cha 2021', 'sheng_puerh', 'true_tea', '毛茶')
cls('Ming Feng Shan Zi Ya Mao Cha 2023', 'sheng_puerh', 'true_tea', '毛茶')
cls('Yibang Wang Zi Shan Mao Cha 2023', 'sheng_puerh', 'true_tea', '毛茶')
cls('Yiwu Gua Feng Zhai Mao Cha 2023', 'sheng_puerh', 'true_tea', '毛茶')
cls('Bai Ying Gu Shu Mao Cha 2019', 'sheng_puerh', 'true_tea', '毛茶')
cls('Bing Dao Gu Shu Mao Cha 2023', 'sheng_puerh', 'true_tea', '毛茶')
cls('Xigui Gu Shu Mao Cha 2023', 'sheng_puerh', 'true_tea', '毛茶')
cls('Matai Gu Shu Mao Cha 2021', 'sheng_puerh', 'true_tea', '毛茶')
cls('2021 Ming Feng Gu Shu Sheng', 'sheng_puerh', 'true_tea', '古樹生')
cls('2020 Xian Qicai Cha Ye You Sheng', 'sheng_puerh', 'true_tea', '有機生茶')
cls('2021 Matai Gu Shu Sheng', 'sheng_puerh', 'true_tea', '古樹生')
cls('2019 Bai Ying Gu Shu Sheng', 'sheng_puerh', 'true_tea', '古樹生')
cls('2014 Bing Dao Gu Shu Sheng', 'sheng_puerh', 'true_tea', '古樹生')
cls('2014 Jing Mai Gu Shu Sheng', 'sheng_puerh', 'true_tea', '古樹生')
cls('2012 Ban Pen Lao Zhai Gu Shu Sheng', 'sheng_puerh', 'true_tea', '古樹生')
cls('2012 Hua Zhu Liang Zi Gu Shu Sheng', 'sheng_puerh', 'true_tea', '古樹生')
cls('2019 Laobanzhang Gu Cha Chang', 'sheng_puerh', 'true_tea', '老班章古茶廠')
cls('2017 Lao Man Er Lao Shu Sheng', 'sheng_puerh', 'true_tea', '老曼峨老樹')
cls('2015 Bulang Shan Long Zhu Sheng', 'sheng_puerh', 'true_tea', '龍珠生')
cls('2015 Meng Song Lao Shu Sheng', 'sheng_puerh', 'true_tea', '老樹生')
cls('1998 Bulang Dan Zhu Gu Shu Sheng', 'sheng_puerh', 'true_tea', '單株古樹')
cls('1992 Menghai Zhuan Cha', 'sheng_puerh', 'true_tea', '磚茶')
cls('2009 Mengku Gu Shu Sheng', 'sheng_puerh', 'true_tea', '古樹生')
cls('2008 Nan Jian Sheng Tuo', 'sheng_puerh', 'true_tea', '生沱')
cls('2007 Menghai Gu Shu Sheng', 'sheng_puerh', 'true_tea', '古樹生')
cls('2006 Xi Gui Lao Shu Sheng Tuo Cha', 'sheng_puerh', 'true_tea', '老樹生沱')
cls('2004 YiWu Gu Shu Sheng', 'sheng_puerh', 'true_tea', '古樹生')
cls('2022 Ba Nuo Gu Shu Sheng', 'sheng_puerh', 'true_tea', '古樹生')
cls('2022 Man Song Man Wei Gu Shu Sheng', 'sheng_puerh', 'true_tea', '古樹生')
cls('2019 Wu Liang Gu Shu Sheng', 'sheng_puerh', 'true_tea', '古樹生')
cls('2022 Ming Feng Gu Shu Fang Cha', 'sheng_puerh', 'true_tea', '方磚')
cls('Hà Giang Gu Shu Mao Cha 2020', 'sheng_puerh', 'true_tea', 'Mao Chà')
cls('Lai Châu Gu Shu Mao Cha 2025', 'sheng_puerh', 'true_tea', 'Mao Chà')
cls('Lao Cai Gu Shu Mao Cha 2018', 'sheng_puerh', 'true_tea', 'Mao Chà')
cls('Cao Bồ Gu Shu Mao Cha 2014', 'sheng_puerh', 'true_tea', 'Mao Chà')
cls('Dien Bien Gu Shu Mao Cha 2019', 'sheng_puerh', 'true_tea', 'Mao Chà')
cls('Yên Bái Mao Cha 2023', 'sheng_puerh', 'true_tea', 'Mao Chà')
cls('2022 Hà Giang Dan Zhu Gu Shu Sheng', 'sheng_puerh', 'true_tea', '單株古樹')
cls('2017 Tây Côn Lĩnh Lao Shu Sheng', 'sheng_puerh', 'true_tea', '老樹生')
cls('1999 Hà Giang Lao Sheng', 'sheng_puerh', 'true_tea', '老生茶')
cls('2023 Yiwu Gua Feng Zai Gu Shu Sheng', 'sheng_puerh', 'true_tea', '古樹生')
cls('2023 Xi Gui Gu Shu Sheng Cha', 'sheng_puerh', 'true_tea', '古樹生')
cls('2004 Gua Feng Zhai Yi Mo Yang Guang', 'sheng_puerh', 'true_tea', '一抹陽光')

# Shu pu'er section
cls('2024 CHEN PI SHU CHA', 'shou_puerh', 'true_tea', '陳皮熟茶')
cls('2020 Lao Cha Tou', 'shou_puerh', 'true_tea', '老茶頭')
cls('2022 Ming Feng Gu Shu Lao Cha Tou', 'shou_puerh', 'true_tea', '老茶頭')
cls('2022 Gu Shu Da Ye Shu Cha', 'shou_puerh', 'true_tea', '大葉熟茶')
cls('2004 Xiaguan Bian Xiao Cha', 'shou_puerh', 'true_tea', '邊銷茶')
cls('2013 Nan Jian Bulang Shan Shu Cha', 'shou_puerh', 'true_tea', '熟茶')
cls('2005 Bu Lang Shan Shu Cha', 'shou_puerh', 'true_tea', '熟茶')
cls('2017 Banzhang Gong Ting', 'shou_puerh', 'true_tea', '宮廷熟茶')
cls('2016 Banzhang Jin Ya', 'shou_puerh', 'true_tea', '金芽熟茶')
cls('2012 Po Meai Pu Er Shu Cha Zhuan', 'shou_puerh', 'true_tea', '熟磚')
cls('2015 Simao Gong Ting', 'shou_puerh', 'true_tea', '宮廷熟茶')
cls('2008 Nan Jian Tuo Shu Cha', 'shou_puerh', 'true_tea', '熟沱')
cls('2006 Lao Tong Zhi', 'shou_puerh', 'true_tea', '老同志')
cls('2006 Mengku Rongshi Lao Shu', 'shou_puerh', 'true_tea', '老樹熟茶')
cls('2009 Yong De Zao Xiang Cha Zhuan', 'shou_puerh', 'true_tea', '熟磚')
cls('2009 60th Anniversary Cake', 'shou_puerh', 'true_tea', '熟茶')
cls('2003 Lao Man Er Zhuan Shu Cha', 'shou_puerh', 'true_tea', '熟磚')
cls('2005 Zhong Cha "8571"', 'shou_puerh', 'true_tea', '8571')
cls('2003 Yunnan Chi Tse Beeng Cha', 'shou_puerh', 'true_tea', '七子餅')
cls('2004 Menghai Shu Cha', 'shou_puerh', 'true_tea', '熟茶')
cls('2018 Menghai Spring', 'shou_puerh', 'true_tea', '熟茶')
cls("1990's Hong Kong Temple Zhuan Cha", 'shou_puerh', 'true_tea', '熟磚')
cls('1996 Lao Menghai Shu Cha', 'shou_puerh', 'true_tea', '老熟茶')
cls('2010 "7581"', 'dark', 'true_tea', '7581')  # 7581 is Kunming hei cha brick!
cls('2022 Wu Liang Gu Shu', 'shou_puerh', 'true_tea', '古樹熟')  # url says shu-puer
cls('2012 Yiwu Lao Shu', 'shou_puerh', 'true_tea', '老樹熟茶')
cls('2011 Bada Shan Shu Cha', 'shou_puerh', 'true_tea', '熟茶')
cls('2009 "7572"', 'shou_puerh', 'true_tea', '7572')
for _d in data:
    if _d['title'] == '2017 Laobanzhang Lao Shu':
        if 'sheng-puer' in _d['url']:
            CLS[_d['uid']] = dict(tea_type='sheng_puerh', category='true_tea',
                                  original_name='老班章老樹', name_override=None)
        elif 'shu-puer' in _d['url']:
            CLS[_d['uid']] = dict(tea_type='shou_puerh', category='true_tea',
                                  original_name='老班章老樹', name_override='Lao Ban Zhang Lao Shu Shu')

# Out-of-type
cls('Green Mate', 'tisane', 'tisane', 'Erva-mate')  # Brazilian, Portuguese native
cls("2022 AN'S SECRET", 'dark', 'true_tea', 'Ản Bí Mật')
cls('Silver Needle', 'white', 'true_tea', 'Silver Needle')  # Indian (Bihar) - English estate naming
cls('WHITE SNOW SHAN', 'white', 'true_tea', 'Shan Tuyết')
cls('Silver Rings', 'white', 'true_tea', 'Silver Rings')
cls('Măng Trắng', 'white', 'true_tea', 'Măng Trắng')
cls('Bvumbwe White Peony', 'white', 'true_tea', 'Bvumbwe')
cls('2022 Lùng Vài Bach Tra', 'white', 'true_tea', 'Bạch Trà')
cls('WHITE CHAMPAGNE', 'white', 'true_tea', 'White Champagne')
cls('Simpani Green', 'green', 'true_tea', 'Simpani')
cls('GREEN FOREST', 'green', 'true_tea', 'Shan Tuyết')
cls('Măng Tím', 'green', 'true_tea', 'Măng Tím')
cls('Bạch Hồng Shan', 'green', 'true_tea', 'Bạch Hồng Shan')
cls('RED STAR', 'black', 'true_tea', 'Shan Tuyết')
# ---------- extra classifications ----------
cls('Xihu Longjing', 'green', 'true_tea', '龍井')
cls('2022 Da Xue Shan Gu Shu Sheng', 'sheng_puerh', 'true_tea', '古樹生')
cls('Da Xue Shan Gu Shu Shai Hong', 'black', 'true_tea', '曬紅')
cls('2016 Ha Giang Gu Shu Shu Cha', 'shou_puerh', 'true_tea', '古樹熟')
cls('2017 Hà Giàng Lao Shu', 'shou_puerh', 'true_tea', '老樹熟')
cls('2007 Cao Bồ Gu Shu', 'shou_puerh', 'true_tea', '古樹熟')
cls('1991 Cao Bồ Gu Shu', 'shou_puerh', 'true_tea', '古樹熟')
cls('Miyazaki Zairai Wakoucha', 'black', 'true_tea', '在来紅茶')
cls('2023 Purple Rain', 'dark', 'true_tea', 'Purple Rain')  # Kenya purple tea (fermented cultivar)
# 1986 Lao Wenshan Bao Zhong is in DUPES (= Baozhong)? it's aged baozhong variant -> treat as dupe
_skip_baozhong = uid_of('1986 Lao Wenshan Bao Zhong')
SKIP[_skip_baozhong] = 'dupe of Baozhong (aged variant)'


# ---------- final dedupe passes ----------
# 2007 Cao Bo collides with 1991 after year-strip (both shou) -> keep 1991
for _d in data:
    if _d['title'] == '2007 Cao Bồ Gu Shu':
        SKIP[_d['uid']] = 'year-strip collision with 1991 Cao Bồ Gu Shu (kept older vintage)'
# 2020 Lao Cha Tou = existing DB 'Lao Cha Tou'
DUPES[uid_of('2020 Lao Cha Tou')] = 'Lao Cha Tou'

# ---------- build final rows ----------
from datetime import datetime
rows = []
skipped = []
for d in data:
    uid = d['uid']
    if uid in SKIP:
        skipped.append((d['title'], SKIP[uid])); continue
    if uid in DUPES:
        skipped.append((d['title'], f"dupe of DB tea: {DUPES[uid]}")); continue
    if uid not in CLS:
        print("UNCLASSIFIED:", uid, d['title']); continue
    c = CLS[uid]
    name = c['name_override'] or d['title']
    rows.append(dict(
        uid=uid, name=name, parts=d['parts'], url=d['url'],
        text=d['text'], tea_type=c['tea_type'], category=c['category'],
        original_name=c['original_name'],
    ))
print(f"rows={len(rows)} skipped={len(skipped)}")
from collections import Counter
print(Counter(r['tea_type'] for r in rows))
print(Counter(r['category'] for r in rows))
json.dump(dict(rows=rows, skipped=skipped), open('/tmp/anshim-classified.json','w'), ensure_ascii=False)
