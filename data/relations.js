/* 《红楼梦》人物关系边
   layer : lineage世系 | marriage联姻 | faction派系 | service主仆 | love情感 | fate命运
   type  : blood血缘 | marry姻亲 | serve主仆 | ally同盟 | rival敌对 | love情感 | patron靠山
   dir   : 1 有向(a→b, 如父→子、主→仆)  0 无向
*/
var HLM = window.HLM || {};

HLM.relations = [

/* ---------- 世系：宁国府 ---------- */
{a:'jiayan',b:'jiadaihua',t:'blood',l:'父子',layer:'lineage',dir:1},
{a:'jiadaihua',b:'jiajing',t:'blood',l:'父子',layer:'lineage',dir:1},
{a:'jiajing',b:'jiazhen',t:'blood',l:'父子',layer:'lineage',dir:1},
{a:'jiajing',b:'jiaxichun',t:'blood',l:'父女',layer:'lineage',dir:1},
{a:'jiazhen',b:'jiarong',t:'blood',l:'父子',layer:'lineage',dir:1},

/* ---------- 世系：荣国府 ---------- */
{a:'jiayuan',b:'jiadaishan',t:'blood',l:'父子',layer:'lineage',dir:1},
{a:'jiadaishan',b:'jiashe',t:'blood',l:'父子',layer:'lineage',dir:1},
{a:'jiadaishan',b:'jiazheng',t:'blood',l:'父子',layer:'lineage',dir:1},
{a:'jiadaishan',b:'jiamin',t:'blood',l:'父女',layer:'lineage',dir:1},
{a:'jiamu',b:'jiashe',t:'blood',l:'母子',layer:'lineage',dir:1},
{a:'jiamu',b:'jiazheng',t:'blood',l:'母子',layer:'lineage',dir:1},
{a:'jiamu',b:'jiamin',t:'blood',l:'母女',layer:'lineage',dir:1},
{a:'jiashe',b:'jialian',t:'blood',l:'父子',layer:'lineage',dir:1},
{a:'jiashe',b:'jiayingchun',t:'blood',l:'父女·庶出',layer:'lineage',dir:1},
{a:'jiazheng',b:'jiazhu',t:'blood',l:'父子·嫡长',layer:'lineage',dir:1},
{a:'jiazheng',b:'jiayuanchun',t:'blood',l:'父女·嫡',layer:'lineage',dir:1},
{a:'jiazheng',b:'jiabaoyu',t:'blood',l:'父子·嫡',layer:'lineage',dir:1},
{a:'jiazheng',b:'jiatanchun',t:'blood',l:'父女·庶出',layer:'lineage',dir:1},
{a:'jiazheng',b:'jiahuan',t:'blood',l:'父子·庶出',layer:'lineage',dir:1},
{a:'wangfuren',b:'jiazhu',t:'blood',l:'母子',layer:'lineage',dir:1},
{a:'wangfuren',b:'jiayuanchun',t:'blood',l:'母女',layer:'lineage',dir:1},
{a:'wangfuren',b:'jiabaoyu',t:'blood',l:'母子',layer:'lineage',dir:1},
{a:'zhaoyiniang',b:'jiatanchun',t:'blood',l:'生母·不被认',layer:'lineage',dir:1},
{a:'zhaoyiniang',b:'jiahuan',t:'blood',l:'母子',layer:'lineage',dir:1},
{a:'jialian',b:'qiaojie',t:'blood',l:'父女',layer:'lineage',dir:1},
{a:'wangxifeng',b:'qiaojie',t:'blood',l:'母女',layer:'lineage',dir:1},
{a:'jiazhu',b:'jialan',t:'blood',l:'父子',layer:'lineage',dir:1},
{a:'lihuan',b:'jialan',t:'blood',l:'母子',layer:'lineage',dir:1},
{a:'jiamin',b:'linaiyu',t:'blood',l:'母女',layer:'lineage',dir:1},
{a:'linruhai',b:'linaiyu',t:'blood',l:'父女',layer:'lineage',dir:1},
{a:'jiadairu',b:'jiarui',t:'blood',l:'祖孙',layer:'lineage',dir:1},
{a:'xueyima',b:'xuepan',t:'blood',l:'母子',layer:'lineage',dir:1},
{a:'xueyima',b:'xuebaochai',t:'blood',l:'母女',layer:'lineage',dir:1},
{a:'zhenshiyin',b:'xiangling',t:'blood',l:'父女·五岁失散',layer:'lineage',dir:1},
{a:'qinkeqing',b:'qinzhong',t:'blood',l:'姐弟',layer:'lineage',dir:0},

/* ---------- 联姻：四大家族 ---------- */
{a:'jiadaishan',b:'jiamu',t:'marry',l:'夫妻·史侯家女',layer:'marriage',dir:0},
{a:'jiashe',b:'xingfuren',t:'marry',l:'继室',layer:'marriage',dir:0},
{a:'jiazheng',b:'wangfuren',t:'marry',l:'夫妻·王家女',layer:'marriage',dir:0},
{a:'jiazheng',b:'zhaoyiniang',t:'marry',l:'妾·家生奴出身',layer:'marriage',dir:0},
{a:'jialian',b:'wangxifeng',t:'marry',l:'夫妻·王家女',layer:'marriage',dir:0},
{a:'jialian',b:'pinger',t:'marry',l:'妾·凤姐陪嫁',layer:'marriage',dir:0},
{a:'jialian',b:'youerjie',t:'marry',l:'偷娶二房',layer:'marriage',dir:0},
{a:'jialian',b:'qiutong',t:'marry',l:'妾·贾赦所赐',layer:'marriage',dir:0},
{a:'jiazhu',b:'lihuan',t:'marry',l:'夫妻',layer:'marriage',dir:0},
{a:'jiazhen',b:'youshi',t:'marry',l:'继室',layer:'marriage',dir:0},
{a:'jiarong',b:'qinkeqing',t:'marry',l:'夫妻',layer:'marriage',dir:0},
{a:'linruhai',b:'jiamin',t:'marry',l:'夫妻',layer:'marriage',dir:0},
{a:'xuepan',b:'xiajingui',t:'marry',l:'夫妻',layer:'marriage',dir:0},
{a:'xuepan',b:'xiangling',t:'marry',l:'妾·强买',layer:'marriage',dir:0},
{a:'jiayingchun',b:'sunshaozu',t:'marry',l:'五千两抵债',layer:'marriage',dir:0},
{a:'jiabaoyu',b:'xuebaochai',t:'marry',l:'金玉良缘·掉包',layer:'marriage',dir:0},
{a:'xiren',b:'jiangyuhan',t:'marry',l:'终局所嫁',layer:'marriage',dir:0},
{a:'wangziteng',b:'wangfuren',t:'blood',l:'兄妹',layer:'marriage',dir:0},
{a:'wangziteng',b:'xueyima',t:'blood',l:'兄妹',layer:'marriage',dir:0},
{a:'wangziteng',b:'wangxifeng',t:'blood',l:'叔侄',layer:'marriage',dir:0},
{a:'wangfuren',b:'xueyima',t:'blood',l:'姐妹',layer:'marriage',dir:0},
{a:'wangfuren',b:'wangxifeng',t:'blood',l:'姑侄',layer:'marriage',dir:0},
{a:'jiamu',b:'shixiangyun',t:'blood',l:'侄孙女',layer:'marriage',dir:0},
{a:'wangren',b:'wangxifeng',t:'blood',l:'兄妹',layer:'marriage',dir:0},

/* ---------- 派系：贾母核心圈 ---------- */
{a:'jiamu',b:'jiabaoyu',t:'ally',l:'心尖上的人',layer:'faction',dir:1},
{a:'jiamu',b:'linaiyu',t:'patron',l:'唯一的靠山',layer:'faction',dir:1},
{a:'jiamu',b:'yuanyang',t:'ally',l:'离不开的臂膀',layer:'faction',dir:1},
{a:'jiamu',b:'wangxifeng',t:'ally',l:'宠爱·凤丫头',layer:'faction',dir:1},
{a:'jiamu',b:'shixiangyun',t:'patron',l:'娘家侄孙女',layer:'faction',dir:1},
{a:'jiamu',b:'xuebaoqin',t:'ally',l:'溺爱·搅局金玉',layer:'faction',dir:1},

/* ---------- 派系：王夫人—薛家轴（全书最强） ---------- */
{a:'wangfuren',b:'wangxifeng',t:'ally',l:'授权管家',layer:'faction',dir:1},
{a:'wangfuren',b:'xueyima',t:'ally',l:'姐妹同盟',layer:'faction',dir:0},
{a:'wangfuren',b:'xuebaochai',t:'ally',l:'属意的儿媳',layer:'faction',dir:1},
{a:'wangfuren',b:'xiren',t:'ally',l:'暗许姨娘·安插的眼',layer:'faction',dir:1},
{a:'wangfuren',b:'zhouruijia',t:'serve',l:'陪房·执行人',layer:'faction',dir:1},
{a:'wangziteng',b:'wangfuren',t:'patron',l:'娘家军权',layer:'faction',dir:1},
{a:'wangziteng',b:'jiafu_ext',t:'patron',l:'',layer:'skip',dir:1},
{a:'wangfuren',b:'qingwen',t:'rival',l:'厌恶→撵死',layer:'faction',dir:1},
{a:'wangfuren',b:'jinchuan',t:'rival',l:'一巴掌逼死',layer:'faction',dir:1},
{a:'wangfuren',b:'fangguan',t:'rival',l:'撵出为尼',layer:'faction',dir:1},
{a:'xuebaochai',b:'yinger',t:'serve',l:'贴身·金玉配合',layer:'faction',dir:1},

/* ---------- 派系：邢夫人—贾赦轴（有名无实） ---------- */
{a:'jiashe',b:'xingfuren',t:'ally',l:'同盟',layer:'faction',dir:0},
{a:'xingfuren',b:'wangshanbao',t:'serve',l:'陪房·当枪使',layer:'faction',dir:1},
{a:'xingfuren',b:'wangxifeng',t:'rival',l:'名义婆媳·实为对手',layer:'faction',dir:1},
{a:'xingfuren',b:'wangfuren',t:'rival',l:'长房 vs 次房',layer:'faction',dir:0},
{a:'jiashe',b:'jiazheng',t:'rival',l:'袭爵者 vs 掌权者',layer:'faction',dir:0},
{a:'jiashe',b:'yuanyang',t:'rival',l:'强讨不成',layer:'faction',dir:1},
{a:'jiashe',b:'jiayingchun',t:'rival',l:'卖女抵债',layer:'faction',dir:1},

/* ---------- 派系：赵姨娘—贾环（体制外的反扑） ---------- */
{a:'zhaoyiniang',b:'jiahuan',t:'ally',l:'唯一的指望',layer:'faction',dir:0},
{a:'zhaoyiniang',b:'madaopo',t:'ally',l:'买通作法',layer:'faction',dir:1},
{a:'zhaoyiniang',b:'jiabaoyu',t:'rival',l:'魇镇',layer:'faction',dir:1},
{a:'zhaoyiniang',b:'wangxifeng',t:'rival',l:'魇镇',layer:'faction',dir:1},
{a:'zhaoyiniang',b:'jiatanchun',t:'rival',l:'亲女不认母',layer:'faction',dir:0},
{a:'jiahuan',b:'jiabaoyu',t:'rival',l:'烫脸·进谗',layer:'faction',dir:1},
{a:'jiahuan',b:'qiaojie',t:'rival',l:'伙同王仁卖她',layer:'faction',dir:1},
{a:'wangren',b:'qiaojie',t:'rival',l:'舅舅卖外甥女',layer:'faction',dir:1},

/* ---------- 派系：探春的独立尝试 ---------- */
{a:'jiatanchun',b:'lihuan',t:'ally',l:'共同理家',layer:'faction',dir:0},
{a:'jiatanchun',b:'xuebaochai',t:'ally',l:'共同理家',layer:'faction',dir:0},
{a:'jiatanchun',b:'wangshanbao',t:'rival',l:'当众一巴掌',layer:'faction',dir:1},
{a:'jiatanchun',b:'wangfuren',t:'ally',l:'认作正经母亲',layer:'faction',dir:1},

/* ---------- 派系：宁国府 ---------- */
{a:'jiazhen',b:'jiarong',t:'ally',l:'父子同流',layer:'faction',dir:0},
{a:'jiazhen',b:'jiaqiang',t:'patron',l:'抚养·委以戏班',layer:'faction',dir:1},
{a:'jiaoda',b:'jiazhen',t:'rival',l:'醉骂·被塞马粪',layer:'faction',dir:1},
{a:'wangxifeng',b:'youshi',t:'rival',l:'大闹宁国府',layer:'faction',dir:1},
{a:'wangxifeng',b:'youerjie',t:'rival',l:'借剑杀人',layer:'faction',dir:1},
{a:'qiutong',b:'youerjie',t:'rival',l:'被当作剑',layer:'faction',dir:1},

/* ---------- 派系：外部势力 ---------- */
{a:'beijingwang',b:'jiabaoyu',t:'patron',l:'赏识·赠念珠',layer:'faction',dir:1},
{a:'zhongshunwang',b:'jiabaoyu',t:'rival',l:'索琪官·致挨打',layer:'faction',dir:1},
{a:'jiayucun',b:'jiazheng',t:'ally',l:'攀附·由此起复',layer:'faction',dir:1},
{a:'jiayucun',b:'jiashe',t:'ally',l:'夺石呆子扇讨好',layer:'faction',dir:1},
{a:'jiayucun',b:'xuepan',t:'ally',l:'徇私开脱葫芦案',layer:'faction',dir:1},
{a:'jiayucun',b:'zhenshiyin',t:'rival',l:'受恩不报',layer:'faction',dir:1},
{a:'jiayucun',b:'xiangling',t:'rival',l:'明知恩人之女仍不救',layer:'faction',dir:1},
{a:'liulaolao',b:'wangxifeng',t:'ally',l:'打秋风·受二十两',layer:'faction',dir:0},
{a:'liulaolao',b:'qiaojie',t:'ally',l:'取名·终局搭救',layer:'faction',dir:1},
{a:'liulaolao',b:'banr',t:'blood',l:'外祖孙',layer:'faction',dir:1},
{a:'ni2',b:'jiayun',t:'ally',l:'轻财相助',layer:'faction',dir:1},
{a:'jiayun',b:'wangxifeng',t:'ally',l:'送礼求差事',layer:'faction',dir:1},
{a:'laida',b:'jiamu',t:'serve',l:'总管·家生奴',layer:'faction',dir:1},
{a:'jingxu',b:'wangxifeng',t:'ally',l:'铁槛寺说情·三千两',layer:'faction',dir:1},
{a:'lengzixing',b:'jiayucun',t:'ally',l:'酒肆演说荣国府',layer:'faction',dir:1},
{a:'lengzixing',b:'zhouruijia',t:'marry',l:'女婿',layer:'faction',dir:0},

/* ---------- 主仆 ---------- */
{a:'jiabaoyu',b:'xiren',t:'serve',l:'首席大丫鬟',layer:'service',dir:1},
{a:'jiabaoyu',b:'qingwen',t:'serve',l:'针线第一',layer:'service',dir:1},
{a:'jiabaoyu',b:'sheyue',t:'serve',l:'丫鬟',layer:'service',dir:1},
{a:'jiabaoyu',b:'fangguan',t:'serve',l:'戏班解散后归',layer:'service',dir:1},
{a:'jiabaoyu',b:'xiaohong',t:'serve',l:'原怡红院粗使',layer:'service',dir:1},
{a:'linaiyu',b:'zijuan',t:'serve',l:'贾母所赐·情同姐妹',layer:'service',dir:1},
{a:'linaiyu',b:'xueyan',t:'serve',l:'苏州带来',layer:'service',dir:1},
{a:'xuebaochai',b:'yinger',t:'serve',l:'贴身',layer:'service',dir:1},
{a:'jiamu',b:'yuanyang',t:'serve',l:'首席·掌私房',layer:'service',dir:1},
{a:'jiamu',b:'xiren',t:'serve',l:'原为贾母之婢',layer:'service',dir:1},
{a:'jiamu',b:'zijuan',t:'serve',l:'原名鹦哥',layer:'service',dir:1},
{a:'wangfuren',b:'jinchuan',t:'serve',l:'贴身',layer:'service',dir:1},
{a:'wangfuren',b:'yuchuan',t:'serve',l:'金钏之妹',layer:'service',dir:1},
{a:'wangxifeng',b:'pinger',t:'serve',l:'陪嫁·左右手',layer:'service',dir:1},
{a:'wangxifeng',b:'xiaohong',t:'serve',l:'赏识调用',layer:'service',dir:1},
{a:'jiatanchun',b:'shishu',t:'serve',l:'大丫鬟',layer:'service',dir:1},
{a:'jiaxichun',b:'ruhua',t:'serve',l:'丫鬟·被撵',layer:'service',dir:1},
{a:'jiayingchun',b:'yingchunmaid_siqi',t:'serve',l:'大丫鬟',layer:'service',dir:1},
{a:'jiabaoyu',b:'lienshi',t:'serve',l:'乳母',layer:'service',dir:1},
{a:'jiaqiang',b:'lingguan',t:'serve',l:'戏班',layer:'service',dir:1},
{a:'wangshanbao',b:'yingchunmaid_siqi',t:'blood',l:'外祖母·亲手抄出',layer:'service',dir:1},

/* ---------- 情感 ---------- */
{a:'jiabaoyu',b:'linaiyu',t:'love',l:'木石前盟',layer:'love',dir:0},
{a:'jiabaoyu',b:'xuebaochai',t:'love',l:'金玉良缘',layer:'love',dir:0},
{a:'jiabaoyu',b:'xiren',t:'love',l:'初试云雨',layer:'love',dir:0},
{a:'jiabaoyu',b:'qingwen',t:'love',l:'知己·芙蓉女儿诔',layer:'love',dir:0},
{a:'jiabaoyu',b:'jiangyuhan',t:'love',l:'互赠汗巾',layer:'love',dir:0},
{a:'jiabaoyu',b:'qinzhong',t:'love',l:'家塾同窗',layer:'love',dir:0},
{a:'jiabaoyu',b:'miaoyu',t:'love',l:'绿玉斗·槛外人帖',layer:'love',dir:0},
{a:'jiazhen',b:'qinkeqing',t:'love',l:'爬灰·脂批指原稿自缢',layer:'love',dir:0},
{a:'jiazhen',b:'yousanjie',t:'love',l:'纠缠',layer:'love',dir:0},
{a:'jialian',b:'youerjie',t:'love',l:'偷娶',layer:'love',dir:0},
{a:'yousanjie',b:'liuxianglian',t:'love',l:'五年痴等·退婚自刎',layer:'love',dir:0},
{a:'yingchunmaid_siqi',b:'panyouan',t:'love',l:'绣春囊·撞墙而死',layer:'love',dir:0},
{a:'jiaqiang',b:'lingguan',t:'love',l:'划蔷·情有分定',layer:'love',dir:0},
{a:'qinzhong',b:'zhineng',t:'love',l:'馒头庵',layer:'love',dir:0},
{a:'jiarui',b:'wangxifeng',t:'love',l:'单相思·被设局害死',layer:'love',dir:1},
{a:'xiangling',b:'fengyuan_x',t:'love',l:'',layer:'skip',dir:0},

/* ---------- 命运：金陵十二钗 ---------- */
{a:'linaiyu',b:'xuebaochai',t:'ally',l:'正册·判词共用一首',layer:'fate',dir:0},
{a:'xiangling',b:'xiajingui',t:'rival',l:'副册·折磨致死',layer:'fate',dir:1},
{a:'xiren',b:'qingwen',t:'rival',l:'又副册·一存一亡',layer:'fate',dir:0},
{a:'jiayuanchun',b:'jiatanchun',t:'ally',l:'元迎探惜·原应叹息',layer:'fate',dir:0},
{a:'jiatanchun',b:'jiayingchun',t:'ally',l:'元迎探惜',layer:'fate',dir:0},
{a:'jiayingchun',b:'jiaxichun',t:'ally',l:'元迎探惜',layer:'fate',dir:0},
{a:'jiabaoyu',b:'zhenbaoyu',t:'ally',l:'真假对照',layer:'fate',dir:0},
{a:'zhenshiyin',b:'jiayucun',t:'rival',l:'真事隐 / 假语存',layer:'fate',dir:0},
{a:'lanheshang',b:'jiabaoyu',t:'patron',l:'携入红尘·终局度脱',layer:'fate',dir:1},
{a:'lanheshang',b:'xuebaochai',t:'patron',l:'冷香丸·金锁八字',layer:'fate',dir:1},
{a:'lanheshang',b:'linaiyu',t:'patron',l:'三岁化缘不得',layer:'fate',dir:1},
{a:'lanheshang',b:'xiangling',t:'patron',l:'预言"有命无运"',layer:'fate',dir:1},
{a:'boozudaoren',b:'zhenshiyin',t:'patron',l:'好了歌·度脱',layer:'fate',dir:1},
{a:'boozudaoren',b:'jiarui',t:'patron',l:'风月宝鉴',layer:'fate',dir:1},
{a:'boozudaoren',b:'liuxianglian',t:'patron',l:'度脱出家',layer:'fate',dir:1},
{a:'qinkeqing',b:'wangxifeng',t:'ally',l:'托梦示警·唯一预言者',layer:'fate',dir:1}

].filter(function (e) { return e.layer !== 'skip'; });

/* 补两个只在情感层出现的次要节点 */
HLM.extraPeople = [
  {id:'panyouan',name:'潘又安',house:'rong',role:'servant',gen:0,gender:'m',rank:3,debut:71,
   brief:'司棋姑舅表弟，与司棋私会事发后逃走，后归来见司棋已死，随之自尽。'}
];
