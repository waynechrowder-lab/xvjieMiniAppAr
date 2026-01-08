// data/poi.js
const URL_Head = "https://shanghai-mashu-wxapp.oss-cn-shanghai.aliyuncs.com/ui/zhengding";
// ★ 把你 index.js 里现在用的 POI_LIST 原样搬到这里来
const POI_LIST = [
  {
    id: 'poi_longxingsi',
    index: 24,
    poi: 0,
    name: '隆兴寺',
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    categories: ['scenic'],//scenic景点，arCheckinAR打卡，arHistoryAR访古，public公共设施，business商业设施
    x: 0.52,
    y: 0.50,
    coverImage: URL_Head + '/main/longxingsi.jpg',
    description: '始建于586年，有“京外第一名刹”之称。寺内有宋代摩尼殿、倒座观音等六处全国之最，是古代艺术宝库。',
    checkinIcon: '',
    medalIcon: URL_Head + '/checkinIcon.png',
  },
  {
    id: 'poi_kaiyuansi',
    index: 1,
    poi: 73270,
    name: '开元寺',
    arrived: 2,//0无法导航；1可导航，不可到达； 2可导航
    categories: ['scenic'],
    x: 0.41,
    y: 0.54,
    coverImage: URL_Head + '/main/kaiyuansi.jpg',
    description: '是正定八大寺之一，位于燕赵南大街西侧。始建于东魏，唐开元二十六年改名。寺内有唐代钟楼、须弥塔等建筑，其布局是唐代佛教寺院典型实例。',
 
    checkinIcon: '',
    medalIcon: URL_Head + '/checkinIcon.png',
  },
  {
    id: 'poi_guanghuisi',
    index: 13,
    poi: 0,
    name: '广惠寺',
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    categories: ['scenic'],
    x: 0.43,
    y: 0.66,
    coverImage: URL_Head + '/main/guanghuisi.jpg',
    description: '始建于唐贞元年间，因仅存华塔又称“华塔寺”。华塔为金代重修遗存，造型奇特、装饰华美，是国内华塔中的精品。',
 
    checkinIcon: '',
    medalIcon: URL_Head + '/checkinIcon.png',
  },
  {
    id: 'poi_linjisi',
    index: 12,
    poi: 0,
    name: '临济寺',
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    categories: ['scenic'],
    x: 0.42,
    y: 0.62,
    coverImage: URL_Head + '/main/linjisi.jpg',
    description: '是佛教临济宗的祖庭，山门为五开间歇山顶建筑。寺内澄灵塔造型秀丽，与大雄宝殿、圆通殿等沿中轴线分布，庄重古朴。',
 
    checkinIcon: '',
    medalIcon: URL_Head + '/checkinIcon.png',
  },
  {
    id: 'poi_rongguofu',
    index: 18,
    poi: 0,
    name: '荣国府',
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    categories: ['scenic'],
    x: 0.48,
    y: 0.4,
    coverImage: URL_Head + '/main/rongguofu.jpg',
    description: '87版《红楼梦》拍摄地，1986年建成。按书中描写设计，有212间房、102间游廊，分三路五进四合院，再现明清古典建筑风貌。',
 
    checkinIcon: '',
    medalIcon: URL_Head + '/checkinIcon.png',
  },
  {
    id: 'poi_fuwenmiao',
    index: 19,
    poi: 0,
    name: '府文庙',
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    categories: ['scenic'],
    x: 0.44,
    y: 0.47,
    coverImage: URL_Head + '/main/fuwenmiao.jpg',
    description: '正定府文庙，位于河北省石家庄市正定县城内常山东路路南。宋以前建置不可考，北宋熙宁三年（1070年）由龙图阁学士知府事吴中复创修。',
 
    checkinIcon: '',
    medalIcon: URL_Head + '/checkinIcon.png',
  },
  {
    id: 'poi_zhaoyunmiao',
    index: 26,
    poi: 0,
    name: '赵云庙',
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    categories: ['scenic'],
    x: 0.55,
    y: 0.4,
    coverImage: URL_Head + '/main/zhaoyunmiao.jpg',
    description: '1997年重建开放。采用仿明清古建筑结构，有庙门、四义殿等建筑，展出赵云故里碑等遗物，纪念“常胜将军”赵云。',
 
    checkinIcon: '',
    medalIcon: URL_Head + '/checkinIcon.png',
  },
  {
    id: 'poi_longxingbieyuan',
    index: 25,
    poi: 0,
    name: '隆兴别院',
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    categories: ['scenic'],
    x: 0.54,
    y: 0.58,
    coverImage: URL_Head + '/main/longxingbieyuan.jpg',
    description: '又名劳动公园，占地5.7万平方米，是开放性城市公园。有荷塘、石桥、亭子，分六大功能区，是休闲观赏好去处。',
 
    checkinIcon: '',
    medalIcon: URL_Head + '/checkinIcon.png',
  },
  {
    id: 'poi_chongyinsi',
    index: 23,
    poi: 0,
    name: '崇因寺',
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    categories: ['scenic'],
    x: 0.45,
    y: 0.3,
    coverImage: URL_Head + '/main/chongyinsi.jpg',
    description: '始建年代不详，明万历年间重修，曾是正定“八大寺”之一。现仅存藏经楼及琉璃照壁，藏经楼为明代楼阁式建筑，具有较高的历史文化价值。',
 
    checkinIcon: '',
    medalIcon: URL_Head + '/checkinIcon.png',
  },
  {
    id: 'poi_wangshizhenjiuju',
    index: 7,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '王士珍旧居',
    categories: ['scenic'],
    x: 0.33,
    y: 0.5,
    coverImage: URL_Head + '/main/wangshizhenjiuju.jpg',
    description: '位于正定县里门里（今中山西路），是民国总理王士珍的住所。建筑为传统四合院风格，有多进院落，房屋古朴典雅，展现了民国时期的建筑风貌和生活气息。',
 
    checkinIcon: '',
    medalIcon: URL_Head + '/checkinIcon.png',
  },
  {
    id: 'poi_wangshishuangjieci',
    index: 8,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '王氏双节祠',
    categories: ['scenic'],
    x: 0.35,
    y: 0.53,
    coverImage: URL_Head + '/main/wangshishuangjieci.jpg',
    description: '是王士珍的家祠，与故居隔路相望。坐南面北，分正院和东西两院，现存大门、石牌坊、正厅等，曾有众多军政名人手书牌匾。',
 
    checkinIcon: '',
    medalIcon: URL_Head + '/checkinIcon.png',
  },
  {
    id: 'poi_yuanqubowuguan',
    index: 20,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '元曲博物馆',
    categories: ['scenic'],
    x: 0.42,
    y: 0.5,
    coverImage: URL_Head + '/main/yuanqubowugua.jpg',
    description: '由马家大院改造而成，以“曲韵天成、遗音流响”为主题，分四个单元，展示元曲发展脉络，陈列白朴书房模拟造型等，是元曲文化展示中心。',
 
    checkinIcon: '',
    medalIcon: URL_Head + '/checkinIcon.png',
  },
  {
    id: 'poi_tianningsi',
    index: 22,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '天宁寺',
    categories: ['scenic'],
    x: 0.48,
    y: 0.5,
    coverImage: URL_Head + '/main/tianningsi.jpg',
    description: '始建于唐懿宗咸通年间，现存大殿为元代木构建筑，保留部分宋代构件。寺内凌霄塔为八角九级楼阁式塔，是正定四塔中最高者，结构独特。',
 
    checkinIcon: '',
    medalIcon: URL_Head + '/checkinIcon.png',
  },
  {
    id: 'poi_yanghelou',
    index: 11,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '阳和楼',
    categories: ['scenic'],
    x: 0.4,
    y: 0.62,
    coverImage: URL_Head + '/main/yanghelou.jpg',
    description: '正定阳和楼作为古城核心地标，既是元曲发祥地，更以独特建筑形制被梁思成赞誉为‘庄严过于凯旋门’，其历史可追溯至金元时期。',
 
    checkinIcon: '',
    medalIcon: URL_Head + '/checkinIcon.png',
  },
  // {
  //   id: 'poi_yanta',
  //   name: '雁塔',
  //   categories: ['arCheckin'],
  //   x: 0.35,
  //   y: 0.3,
  //   coverImage: URL_Head + '/main/',
  //   description_checkin: '雁塔打卡点位于开元寺入口位置，在此处使用AR打卡功能，将镜头对准开元寺入口，即可与虚拟开元寺雁塔进行合照打卡。在附近点击“AR打卡”前往该地点点击“开启AR导航”',
 
  //   uncheckinIcon: URL_Head + '/checkin/uncheck-yanta.png',
  //   checkinIcon: URL_Head + '/checkin/check-yanta.png',
  //   uncheckinCover: URL_Head + '/checkin/uncheck-yanta-bg.jpg',
  //   checkinCover: URL_Head + '/checkin/check-yanta-bg.jpg',
  //   medalIcon: URL_Head + '/checkinIcon.png',
  // },
  // {
  //   id: 'poi_bixi',
  //   name: '赑屃',
  //   categories: ['arCheckin'],
  //   x: 0.4,
  //   y: 0.3,
  //   coverImage: URL_Head + '/main/',
  //   description: '雁塔打卡点位于开元寺入口位置，在此处使用AR打卡功能，将镜头对准开元寺入口，即可与虚拟开元寺雁塔进行合照打卡。在附近点击“AR打卡”前往该地点点击“开启AR导航”',
 
  //   uncheckinIcon: URL_Head + '/checkin/uncheck-bixi.png',
  //   checkinIcon: URL_Head + '/checkin/check-bixi.png',
  //   uncheckinCover: URL_Head + '/checkin/uncheck-bixi-bg.jpg',
  //   checkinCover: URL_Head + '/checkin/check-bixi-bg.jpg',
  //   medalIcon: URL_Head + '/checkinIcon.png',
  // },
  {
    id: 'poi_jiadashanguju',
    index: 4,
    poi: 0,
    arrived: 1,//0无法导航；1可导航，不可到达； 2可导航
    name: '贾大山故居',
    categories: ['scenic','arCheckin','arHistory'],
    x: 0,
    y: 0,
    coverImage: URL_Head + '/main/jiadashanguju.jpg',
    description: '位于育才街 54 号，建于 1982 年，是座平顶建筑，建筑面积 125 平方米。屋内还原了创作室等生活场景，东侧展厅展示其作品及人生经历，免费对公众开放。',
    description_checkin: '位于育才街 54 号，建于 1982 年，是座平顶建筑，建筑面积 125 平方米。屋内还原了创作室等生活场景，东侧展厅展示其作品及人生经历，免费对公众开放。',
    description_history: '位于育才街 54 号，建于 1982 年，是座平顶建筑，建筑面积 125 平方米。屋内还原了创作室等生活场景，东侧展厅展示其作品及人生经历，免费对公众开放。',
 
    uncheckinIcon: URL_Head + '/checkin/uncheck-guju.png',
    checkinIcon: URL_Head + '/checkin/check-guju.png',
    uncheckinCover: URL_Head + '/checkin/uncheck-guju-bg.jpg',
    checkinCover: URL_Head + '/checkin/check-guju-bg.jpg',
    medalIcon: URL_Head + '/histroy/lock-guju.png',
    medalIconUnlock: URL_Head + '/histroy/unlock-guju.png',
    medalIconUnlockTop: URL_Head + '/histroy/unlock-guju-top.png',

    uncheckinHistoryCover: URL_Head + '/histroy/uncheck-guju-bg.jpg',
    checkinHistoryCover: URL_Head + '/histroy/check-guju-bg.jpg',
  },
  {
    id: 'poi_kaiyuansidong',
    index: 5,
    poi: 73270,
    arrived: 2,//0无法导航；1可导航，不可到达； 2可导航
    name: '开元寺东门',
    categories: ['arHistory','arCheckin'],
    x: 0.41,
    y: 0.54,
    coverImage: URL_Head + '/main/kaiyuansidong.jpg',
    description: '位于开元寺东，燕赵大街一侧。',
    description_checkin: '位于开元寺东，燕赵大街一侧。',
    description_history: '位于开元寺东，燕赵大街一侧',
 
    uncheckinIcon: URL_Head + '/checkin/uncheck-bixi.png',
    checkinIcon: URL_Head + '/checkin/check-bixi.png',
    uncheckinCover: URL_Head + '/checkin/uncheck-bixi-bg.jpg',
    checkinCover: URL_Head + '/checkin/check-bixi-bg.jpg',

    medalIcon: URL_Head + '/histroy/lock-damen.png',
    medalIconUnlock: URL_Head + '/histroy/unlock-damen.png',
    medalIconUnlockTop: URL_Head + '/histroy/unlock-damen-top.png',

    uncheckinHistoryCover: URL_Head + '/histroy/uncheck-damen-bg.jpg',
    checkinHistoryCover: URL_Head + '/histroy/check-damen-bg.jpg',
  },
  {
    id: 'poi_kaiyuansiyizhi',
    index: 6,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '开元寺考古遗址',
    categories: ['scenic','arHistory'],
    x: 0,
    y: 0,
    coverImage: URL_Head + '/main/kaiyuansiyizhi.jpg',
    description: '位于开元寺南侧，面积约 12000 平方米。自 2015 年起发掘，发现唐至清七个历史时期连续文化层叠压，出土可复原文物 7000 余件，为研究正定古城变迁提供了实物证据。',
 
    description_history: '位于开元寺南侧，面积约 12000 平方米。自 2015 年起发掘，发现唐至清七个历史时期连续文化层叠压，出土可复原文物 7000 余件，为研究正定古城变迁提供了实物证据。',

    checkinIcon: URL_Head + '/checkinIcon.png',
    medalIcon: URL_Head + '/histroy/lock-yizhi.png',
    medalIconUnlock: URL_Head + '/histroy/unlock-yizhi.png',
    medalIconUnlockTop: URL_Head + '/histroy/unlock-yizhi-top.png',

    uncheckinHistoryCover: URL_Head + '/histroy/uncheck-yizhi-bg.jpg',
    checkinHistoryCover: URL_Head + '/histroy/check-yizhi-bg.jpg',
  },
  {
    id: 'poi_jiaolinshuwu',
    index: 2,
    poi: 73273,
    arrived: 2,//0无法导航；1可导航，不可到达； 2可导航
    name: '蕉林书屋',
    categories: ['scenic','arHistory','arCheckin'],
    x: 0.43,
    y: 0.56,
    coverImage: URL_Head + '/main/jiaolinshuwu.jpg',
    description: '位于正定县城内燕赵大街东侧，是清代户部尚书梁清标藏书、会友、写字、赋诗之处。书屋见证了梁清标的文化活动，承载着丰富的历史文化内涵，具有一定的文物价值。',

    description_checkin: '位于正定县城内燕赵大街东侧，是清代户部尚书梁清标藏书、会友、写字、赋诗之处。书屋见证了梁清标的文化活动，承载着丰富的历史文化内涵，具有一定的文物价值。',
 
    uncheckinIcon: URL_Head + '/histroy/lock-shuwu.png',
    checkinIcon: URL_Head + '/histroy/unlock-shuwu.png',
    uncheckinCover: URL_Head + '/histroy/uncheck-shuwu-bg.jpg',
    checkinCover: URL_Head + '/histroy/check-shuwu-bg.jpg',

    description_history: '位于正定县城内燕赵大街东侧，是清代户部尚书梁清标藏书、会友、写字、赋诗之处。书屋见证了梁清标的文化活动，承载着丰富的历史文化内涵，具有一定的文物价值。',

    medalIcon: URL_Head + '/histroy/lock-shuwu.png',
    medalIconUnlock: URL_Head + '/histroy/unlock-shuwu.png',
    medalIconUnlockTop: URL_Head + '/histroy/unlock-shuwu-top.png',

    uncheckinHistoryCover: URL_Head + '/histroy/uncheck-shuwu-bg.jpg',
    checkinHistoryCover: URL_Head + '/histroy/check-shuwu-bg.jpg',
  },
  {
    id: 'poi_liangshizongci',
    index: 3,
    poi: 73274,
    arrived: 2,//0无法导航；1可导航，不可到达； 2可导航
    name: '梁氏宗祠',
    categories: ['scenic','arHistory'],
    x: 0.44,
    y: 0.58,
    coverImage: URL_Head + '/main/liangshizongci.jpg',
    description: '位于燕赵南大街东侧 218 号，创建于明代晚期，占地面积 672 平方米。坐东朝西，面阔五间，为单檐硬山顶建筑，是梁氏家族祭祀祖先的地方，2019 年被列为全国重点文物保护单位。',
    description_history: '位于燕赵南大街东侧 218 号，创建于明代晚期，占地面积 672 平方米。坐东朝西，面阔五间，为单檐硬山顶建筑，是梁氏家族祭祀祖先的地方，2019 年被列为全国重点文物保护单位。',
 
    checkinIcon: URL_Head + '/checkinIcon.png',
    medalIcon: URL_Head + '/histroy/lock-zongci.png',
    medalIconUnlock: URL_Head + '/histroy/unlock-zongci.png',
    medalIconUnlockTop: URL_Head + '/histroy/unlock-zongci-top.png',

    uncheckinHistoryCover: URL_Head + '/histroy/uncheck-zongci-bg.jpg',
    checkinHistoryCover: URL_Head + '/histroy/check-zongci-bg.jpg',
  },
  {
    id: 'poi_lianhuashidishengtaiyuan',
    index: 9,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '莲池湿地生态园',
    categories: ['scenic'],
    x: 0.34,
    y: 0.57,
    coverImage: URL_Head + '/main/lianhuashidishengtaiyuan.jpg',
    description: '正定莲池公园位于河北省石家庄市正定县城西南部古城墙内，以‌莲花、湿地和生态‌为主题。',

  },
  {
    id: 'poi_fuchenghuangmiao',
    index: 10,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '府城隍庙',
    categories: ['scenic'],
    x: 0.37,
    y: 0.59,
    coverImage: URL_Head + '/main/lianhuashidishengtaiyuan.jpg',
    description: '‌正定城隍庙，具体位于石坊西路正安智园东北侧约160米‌。该建筑群始建于明代，是正定道教活动中心，现存建筑为2000年重建。',

  },
  {
    id: 'poi_qingzhensi',
    index: 14,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '清真寺',
    categories: ['scenic'],
    x: 0.47,
    y: 0.66,
    coverImage: URL_Head + '/main/qingzhensi.jpg',
    description: '清真寺，县级重点文物保护单位。 位于正定城内镇州南街东侧。系正定府镇台闵正丰(回民)于清道光十二年(1832年)修建。',

  },
  {
    id: 'poi_fengdongbei',
    index: 15,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '风动碑',
    categories: ['scenic'],
    x: 0.4,
    y: 0.48,
    coverImage: URL_Head + '/main/fengdongbei.jpg',
    description: '风动碑，全称为《大唐清河郡王纪功载政之颂碑》，是位于河北省正定县城解放街西侧的一座唐代巨型石碑。‌\n它立于唐永泰二年（766年）七月一日，由唐代宗李豫敕令刻立，用以颂扬成德军节度使、恒州刺史、清河郡王李宝臣在恒州（今正定）任内的政绩功德。‌',

  },
  {
    id: 'poi_xianwenmiao',
    index: 16,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '县文庙',
    categories: ['scenic'],
    x: 0.37,
    y: 0.48,
    coverImage: URL_Head + '/main/xianwenmiao.jpg',
    description: '正定县文庙始建于明洪武七年(1374年)，将旧寺院按文庙规制改建而成，大成殿即为当时的古寺佛殿，明、清两代陆续重修、增建。‌',

  },
  {
    id: 'poi_changshangongyuan',
    index: 17,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '常山公园',
    categories: ['scenic'],
    x: 0.45,
    y: 0.39,
    coverImage: URL_Head + '/main/changshangongyuan.jpg',
    description: '正定古城中心休闲公园，以 “常山” 历史文化为主题，有仿古建筑、雕塑、湖泊，是市民健身与文化体验的场所。‌',

  },
  {
    id: 'poi_zhengdingbowuguan',
    index: 21,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '正定博物馆',
    categories: ['scenic'],
    x: 0,
    y: 0,
    coverImage: URL_Head + '/main/zhengdingbowuguan.jpg',
    description: '国家二级博物馆，2019年建成。馆藏文物7672件，设9个展厅，有县史陈列、造像、陶瓷等展览，还设文创体验区，展现正定历史文化。',

  },
  {
    id: 'poi_tanyuan',
    index: 27,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '潭园',
    categories: ['scenic'],
    x: 0.55,
    y: 0.3,
    coverImage: URL_Head + '/main/tanyuan.jpg',
    description: '正定古城内古典园林，以水景为主，亭台楼阁错落有致，花木掩映，体现江南园林与北方建筑的融合之美。',

  },
  {
    id: 'poi_yuanboyuan',
    index: 28,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '园博园',
    categories: ['scenic'],
    x: 0.82,
    y: 0.56,
    coverImage: URL_Head + '/main/yuanboyuan.jpg',
    description: '位于正定新城，集各地园林精华于一体，有多个城市展园、标志性景观塔，是展示园林艺术与城市文化的大型园区。',

  },
  {
    id: 'poi_xingzhengfuwuzhongxin',
    index: 29,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '行政服务中心',
    categories: ['public'],
    x: 0.84,
    y: 0.62,
    coverImage: URL_Head + '/main/xingzhengfuwuzhongxin.jpg',
    description: '正定新区现代化政务服务建筑，外观简洁大气，集中办理各类行政业务，是古城便民服务的重要窗口。',

  },
  {
    id: 'poi_guojiapingpangqiujidi',
    index: 30,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '国家乒乓球基地',
    categories: ['public'],
    x: 0.52,
    y: 0.4,
    coverImage: URL_Head + '/main/guojiapingpangqiujidi.jpg',
    description: '正定著名体育训练基地，培养众多乒乓国手，场馆设施专业，是乒乓球运动的重要摇篮与参观景点。',

  },
  {
    id: 'poi_youkezhongxin',
    index: 31,
    poi: 0,
    arrived: 0,//0无法导航；1可导航，不可到达； 2可导航
    name: '游客中心',
    categories: ['public'],
    x: 0.36,
    y: 0.7,
    coverImage: URL_Head + '/main/youkezhongxin.jpg',
    description: '正定游客中心位于正定河北大道与成德南街交汇处东南方向，占地9000平方米，分为南厅、北厅和休闲广场三大区域',

  },
  {
    id: 'poi_dimiantingchechang',
    index: 32,
    poi: 73272,
    arrived: 2,//0无法导航；1可导航，不可到达； 2可导航
    name: '地面停车场',
    categories: ['public'],
    x: 0,
    y: 0,
    coverImage: URL_Head + '/main/dimiantingchechang.jpg',
    description: '开元寺东门入口旁的停车场',

  },
  {
    id: 'poi_zhongguogongshangyinhang',
    index: 33,
    poi: 73280,
    arrived: 2,//0无法导航；1可导航，不可到达； 2可导航
    name: '中国工商银行',
    categories: ['business'],
    x: 0,
    y: 0,
    coverImage: URL_Head + '/main/zhongguogongshangyinhang.jpg',
    description: '中国工商银行',

  },
  {
    id: 'poi_zhongguoyouzhengyinhang',
    index: 34,
    poi: 73279,
    arrived: 2,//0无法导航；1可导航，不可到达； 2可导航
    name: '中国邮政储蓄银行',
    categories: ['business'],
    x: 0,
    y: 0,
    coverImage: URL_Head + '/main/zhongguoyouzhengyinhang.jpg',
    description: '中国邮政储蓄银行',

  },
  {
    id: 'poi_sanmenlou',
    index: 101,
    poi: 73269,
    arrived: 2,//0无法导航；1可导航，不可到达； 2可导航
    name: '三门楼遗址',
    arannotationId: '7a9c5be6-fc8f-4c57-8e94-879e929691bb',
    modelUrl:'https://tiny-app.gindxrstu.com/Sanmenlou/tinyapp.json',
    categories: ['description'],
    descriptionAudio: 'https://shanghai-mashu-wxapp.oss-cn-shanghai.aliyuncs.com/audio/zhengding/%E4%B8%89%E9%97%A8%E6%A5%BC.MP3',
    description: '位于开元寺最南端，初建于唐如意年间（692 年）。原建筑单檐歇山顶，面阔五间，进深两间，檐柱、中柱均为石质，柱间仅施石质阑额连接，体现盛唐建筑风格。石柱上镌刻有佛经、佛像等，具有较高历史、艺术价值。新中国成立前后颓坏倒塌，2008 年按原址修复，重立残存石柱。',

  },
  {
    id: 'poi_fachuandian',
    index: 102,
    poi: 73268,
    arrived: 2,//0无法导航；1可导航，不可到达； 2可导航
    name: '法船殿遗址',
    arannotationId: '3bc588de-d1c4-4da1-b43d-f36f34947f17',
    modelUrl:'https://tiny-app.gindxrstu.com/Fachuandian/tinyapp.json',
    categories: ['description'],
    descriptionAudio: 'https://shanghai-mashu-wxapp.oss-cn-shanghai.aliyuncs.com/audio/zhengding/%E6%B3%95%E8%88%B9%E6%AE%BF.MP3',
    description: '法船殿原为开元寺主殿，位于钟楼和须弥塔中间后侧。该殿为二层歇山顶楼阁，面阔五间，进深四间，采用金厢斗底槽柱网布置。殿名源于 “法船” 普度众生之意，体现佛家渡世思想。1966 年，法船殿被毁，仅存殿基础遗址，遗址地表可见 15 个完整方形柱础，反映了佛教建筑由以塔为中心向以殿阁为中心的过渡特征。',

  },
  {
    id: 'poi_xumita',
    index: 103,
    poi: 73266,
    arrived: 2,//0无法导航；1可导航，不可到达； 2可导航
    name: '须弥塔',
    arannotationId: 'f5259275-80df-4a55-a9cc-5b0afff6c197',
    modelUrl:'https://tiny-app.gindxrstu.com/Yanta/tinyapp.json',
    categories: ['description'],
    descriptionAudio: 'https://shanghai-mashu-wxapp.oss-cn-shanghai.aliyuncs.com/audio/zhengding/%E9%A1%BB%E5%BC%A5%E5%A1%94.MP3',
    description: '开元寺须弥塔，又称雁塔，位于法船殿遗址前西侧，始建于唐贞观十年（636年），比西安大雁塔还要早16年。塔身建在正方形砖砌台基上，平面为正方形，密檐九级，通高约 39.5 米。第一层较高，下部砌石陡板，各面两端浮雕力士像。正面辟石券门，门框刻花瓶等图案，门楣浮雕二龙戏珠，门楣上端石匾刻 “须弥峭立”。塔内呈空筒式，内壁垂直。其造型简洁疏朗，古朴无华，是叠涩出檐塔的典型作品。',

  },
  {
    id: 'poi_bixi',
    index: 104,
    poi: 73265,
    arrived: 2,//0无法导航；1可导航，不可到达； 2可导航
    name: '赑屃碑座',
    arannotationId: 'ec5e5cd6-4168-4c2d-8364-47cc3bb80967',
    modelUrl:'https://tiny-app.gindxrstu.com/Bixi/tinyapp.json',
    categories: ['description'],
    descriptionAudio: 'https://shanghai-mashu-wxapp.oss-cn-shanghai.aliyuncs.com/audio/zhengding/%E8%B5%91%E5%B1%83%E7%9F%B3%E7%A2%91.MP3',
    description: '赑屃石碑为五代时期遗物，是成德军节度使安重荣德政碑残件。2000 年 6 月出土于正定县府前街，同年 8 月移至开元寺。青石质赑屃碑座残长 8.4 米，宽 3.2 米，高 2.6 米，重 107 吨，体量为全国同类石刻之首。同时出土的还有 5 块残碑首和 13 块带字残碑，碑文清晰，字迹飘逸清秀，是研究后唐五代时期历史的珍贵实物资料。',

  },
  {
    id: 'poi_zhonglou',
    index: 105,
    poi: 73267,
    arrived: 2,//0无法导航；1可导航，不可到达； 2可导航
    name: '开元寺钟楼',
    arannotationId: 'cc718064-7a32-425b-a32f-da9b6105d61c',
    modelUrl:'https://tiny-app.gindxrstu.com/Zhonglou/tinyapp.json',
    categories: ['description'],
    descriptionAudio: 'https://shanghai-mashu-wxapp.oss-cn-shanghai.aliyuncs.com/audio/zhengding/%E9%92%9F%E6%A5%BC.MP3',
    description: '开元寺钟楼与开元寺须弥塔相对而立，是一座平面呈正方形歇山顶式二层楼阁建筑，面阔进深皆为三间，高14米，砖木结构。一层正中有圆井，与二楼悬挂的钟口相对。二楼为木结构，四面各有门与四周木栏环台相通，楼上通风透光。四周有台明环绕，在结构上保持着早期建筑古朴庄重的风格，是中国现存唯一的一座唐代开元寺钟楼。开元寺钟楼上悬钟一口，开元寺钟楼上层被清代改建，下层木构件仍为晚唐遗存。开元寺钟楼下层地面中心偏东北的位置有地宫一座。',

  },
];

module.exports = {
  POI_LIST
};
