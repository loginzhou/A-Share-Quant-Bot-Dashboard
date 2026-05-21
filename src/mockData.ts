import { Recommendation, StrategyConfig, BacktestResult, ExternalContext, SystemStatus } from "./types";

export const MOCK_SYSTEM_STATUS: SystemStatus = {
  latest_trade_date: "2026-05-20",
  total_stocks: 5497,
  daily_data_records: 358651,
  daily_basic_records: 339661,
  sync_attempts_today: 4,
  sync_success_rate: 100,
  last_sync_time: "2026-05-21 18:20:13",
  is_bot_online: true,
  bot_pings_success: true,
  watchdog_alert: false,
  llm_provider: "Ark Coding Plan (ark-code-latest)",
  llm_status: "online"
};

export const MOCK_STRATEGIES: StrategyConfig[] = [
  {
    id: "limit_up_momentum",
    name: "limit_up_momentum",
    chinese_name: "涨停双向动量主策略",
    description: "全市场涨停板与动量连续性追踪扫描，侧重于寻找龙头、一字板洗盘、和强承接下的突破机会。",
    enabled: true,
    is_custom: false,
    params: {
      limit_up_percent: 9.5,
      volume_ratio_limit: 1.5,
      trend_days_lookback: 20,
      score_threshold: 70
    },
    manual_factors: [
      { id: "man_1", factor_name: "非次新低位首板", grade: "strong", description: "上市超1年，处于近半年绝对低位区间的第一个涨停板，常有高承接力。", enabled: true },
      { id: "man_2", factor_name: "超大型概念板块共振", grade: "observe", description: "属于近阶段最火热的科技或大宗商品题材核心，承接买盘极强。", enabled: true }
    ]
  },
  {
    id: "stable_short_term",
    name: "stable_short_term",
    chinese_name: "稳健短线首板策略",
    description: "专为稳健型短线打造，排除高位死接力，优选低位、非极致缩量、温和量比、中等流通盘的健康重合首板。",
    enabled: true,
    is_custom: false,
    params: {
      limit_up_percent: 9.5,
      turnover_rate_max: 12.0,
      turnover_rate_min: 2.5,
      circ_mv_max_billion: 100.0,
      circ_mv_min_billion: 15.0,
      volume_ratio_max: 3.5
    },
    manual_factors: [
      { id: "man_3", factor_name: "成本偏离度低", grade: "strong", description: "近5日吸筹均价与最新收盘价格相差在5%以内，防冲高崩塌。", enabled: true },
      { id: "man_4", factor_name: "前期底部分型支撑", grade: "strong", description: "在密集支撑均线（如20日、30日线）上方不远处确认首板，回踩风险极小。", enabled: true }
    ]
  },
  {
    id: "chan_theory",
    name: "chan_theory",
    chinese_name: "缠论底分型与笔买卖点策略",
    description: "严格根据缠论底分型配合笔成型、线段突破及MACD指标共振在零轴上的第三买点，做稳健的波段反转交易。",
    enabled: true,
    is_custom: false,
    params: {
      strict_bi_rule: true,
      pen_min_bars: 5,
      fractal_threshold: 0.03,
      macd_cross_validate: true
    },
    manual_factors: [
      { id: "man_5", factor_name: "第三买点(零轴上笔回踩确认)", grade: "strong", description: "笔回踩不破前中枢上轨，在零轴上方形成MACD二次金叉，强买入信号。", enabled: true },
      { id: "man_6", factor_name: "日线大级别底分型", grade: "observe", description: "中等时间跨度（60日）下跌趋势末端出现的首个强底分型结构。", enabled: true }
    ]
  },
  {
    id: "default_quant",
    name: "default_quant",
    chinese_name: "多维度量化加权基准模型",
    description: "多维度加权经典评分，整合筹码、情绪、市值、换手率的传统主观全市场定量扫描模型。",
    enabled: true,
    is_custom: false,
    params: {
      trend_weight: 0.35,
      volume_weight: 0.25,
      fund_weight: 0.25,
      risk_weight: 0.15
    },
    manual_factors: []
  },
  {
    id: "custom_low_mkt_first",
    name: "custom_low_mkt_first",
    chinese_name: "低市值超跌首板微调 (克隆)",
    description: "克隆自‘稳健短线首板策略’，额外增设流通市值需小于35亿，量比小于2.5的极致限制，寻找超级弹性标的。",
    enabled: true,
    is_custom: true,
    base_strategy: "stable_short_term",
    params: {
      circ_mv_max_billion: 35.0,
      volume_ratio_max: 2.5,
      limit_up_percent: 9.8
    },
    manual_factors: [
      { id: "man_7", factor_name: "游资重仓印记", grade: "observe", description: "历史龙虎榜中频现活跃知名游资席位，弹性高极易连板。", enabled: true }
    ]
  }
];

// Target Selection Dates Options
export const MOCK_DATES = ["2026-05-21", "2026-03-11"];

export const MOCK_RECOMMENDATIONS: { [date: string]: { [strategyId: string]: Recommendation[] } } = {
  "2026-05-21": {
    "limit_up_momentum": [
      {
        rank: 1,
        stock: {
          ts_code: "300629.SZ",
          name: "新劲刚",
          price: 28.91,
          change_pct: 20.0,
          total_score: 91.5,
          tech_score: 95.0,
          fund_score: 92.0,
          cap_score: 88.0,
          risk_score: 90.0,
          market_type: "创业板",
          logo_hint: "军工 & 芯片",
          is_zhangting: true,
          volume_ratio: 2.8,
          turnover_rate: 8.4,
          pe_ttm: 35.6,
          total_mv: 71.5,
          circ_mv: 61.2,
          vwap_deviation: 1.02,
          tail_behavior: "分时稳健横盘",
          fraud_trap: false,
          rapid_tail_selloff: false
        },
        plan: {
          pullback_buy: 27.20,
          breakout_buy: 29.50,
          no_chase_limit: 30.20,
          stop_loss: 26.10,
          take_profit_1: 32.50,
          take_profit_2: 35.00,
          weak_exit: 26.90,
          position_sizing: "15% - 20% 仓位底仓分批",
          holding_strategy: "5日极限短线持有；若T+1承接不畅尾盘退出",
          risk_notes: "盘中波动率极高，需防止缩量高开后巨量砸盘。",
          ai_strategy_diff: "AI估算其有军工板块大事件催化，相比本地设定的回踩27.20，AI认为今日强势开盘可直接在竞价低吸进场10%仓位，上攻突破29.50再行回补。"
        },
        explanation: "由于近期有大宗采购与半导体替代等多重催化，新劲刚走出强势的底分型并今日大单完美20%停板，大单锁力量比2.8倍，筹码呈现非常清晰的低位单峰。这不仅符合涨停断裂点，也拥有极高的成交活跃度。",
        selection_date: "2026-05-21",
        matched_factors: ["高自由换手承接", "同花顺题材丰富", "小流通市值活跃", "高换手回封"],
        risk_factors: ["成本偏离过高风险"],
        similarity_status: "接近成功样本",
        local_factors_weights: { trend_structure: 35, liquidity: 35, resonance: 20, risk_drag: 10 }
      },
      {
        rank: 2,
        stock: {
          ts_code: "301176.SZ",
          name: "逸豪新材",
          price: 28.97,
          change_pct: 15.0,
          total_score: 87.2,
          tech_score: 89.0,
          fund_score: 87.0,
          cap_score: 82.0,
          risk_score: 93.0,
          market_type: "创业板",
          logo_hint: "PCB铜箔 & AI概念",
          is_zhangting: false,
          volume_ratio: 1.9,
          turnover_rate: 11.2,
          pe_ttm: 48.2,
          total_mv: 42.5,
          circ_mv: 32.1,
          vwap_deviation: 1.05,
          tail_behavior: "尾盘轻捷收回",
          fraud_trap: false,
          rapid_tail_selloff: false
        },
        plan: {
          pullback_buy: 26.80,
          breakout_buy: 29.80,
          no_chase_limit: 31.00,
          stop_loss: 25.40,
          take_profit_1: 33.00,
          take_profit_2: 36.50,
          weak_exit: 26.20,
          position_sizing: "10% 头仓，观察承接",
          holding_strategy: "短线3-5天，首板不封后震荡整理期持有",
          risk_notes: "换手率在11.2%偏高位，震荡洗盘概率大。",
          ai_strategy_diff: "由于PCB全行业景气，AI判断可能存在一波长趋势。建议将本地的短线3天持仓周期宽限至10日，重点防守25.40而不急于在小波动中下车。"
        },
        explanation: "作为覆铜板与AI上游，最新换手率极其活跃，虽然今日未能20%封死，但尾盘买盘坚决抢筹。大单资金流入占比排在板块全天前三，单峰筹码无套牢盘压力，大概率走反包或弱转强路线。",
        selection_date: "2026-05-21",
        matched_factors: ["高自由换手承接", "同花顺题材丰富", "小流通市值活跃"],
        risk_factors: ["成本偏离过高风险"],
        similarity_status: "部分接近",
        local_factors_weights: { trend_structure: 30, liquidity: 40, resonance: 20, risk_drag: 10 }
      },
      {
        rank: 3,
        stock: {
          ts_code: "601868.SH",
          name: "中国能建",
          price: 3.14,
          change_pct: 6.8,
          total_score: 84.1,
          tech_score: 82.0,
          fund_score: 88.0,
          cap_score: 85.0,
          risk_score: 75.0,
          market_type: "沪主板",
          logo_hint: "特高压 & 核电",
          is_zhangting: false,
          volume_ratio: 2.1,
          turnover_rate: 1.8,
          pe_ttm: 11.2,
          total_mv: 1308.0,
          circ_mv: 850.5,
          vwap_deviation: 1.01,
          tail_behavior: "大单垫盘稳定",
          fraud_trap: false,
          rapid_tail_selloff: false
        },
        plan: {
          pullback_buy: 2.98,
          breakout_buy: 3.22,
          no_chase_limit: 3.30,
          stop_loss: 2.85,
          take_profit_1: 3.50,
          take_profit_2: 3.82,
          weak_exit: 2.94,
          position_sizing: "30% 仓位中线防御",
          holding_strategy: "中线趋势持有20天，跌破20日线退出",
          risk_notes: "大市值权重股，适合护大盘时发力，缺乏急速连板弹性。",
          ai_strategy_diff: "AI完全赞同本地计划。核电、绿色电力为国企重估重点，本地设定的低风险大仓位配置非常合理，不需要高频短线倒差价。"
        },
        explanation: "中国能建为大型央企，近期突破底部震荡箱体，量比达到2.1倍且今日机构席位大笔扫货。由于体量巨大，换手率1.8%属于极度温和，适合防守型大仓位操作。",
        selection_date: "2026-05-21",
        matched_factors: ["低PB首板", "机构持仓背景", "低上方压力筹码"],
        risk_factors: [],
        similarity_status: "部分接近",
        local_factors_weights: { trend_structure: 40, liquidity: 20, resonance: 40, risk_drag: 0 }
      }
    ],
    "stable_short_term": [
      {
        rank: 1,
        stock: {
          ts_code: "603779.SH",
          name: "阿尔特",
          price: 15.42,
          change_pct: 9.9,
          total_score: 83.2,
          tech_score: 84.0,
          fund_score: 82.0,
          cap_score: 80.0,
          risk_score: 95.0,
          market_type: "沪主板",
          logo_hint: "汽车智能设计",
          is_zhangting: true,
          volume_ratio: 1.6,
          turnover_rate: 4.2,
          pe_ttm: 28.5,
          total_mv: 68.2,
          circ_mv: 52.4,
          vwap_deviation: 1.01,
          tail_behavior: "封板稳定不抖",
          fraud_trap: false,
          rapid_tail_selloff: false
        },
        plan: {
          pullback_buy: 14.80,
          breakout_buy: 15.65,
          no_chase_limit: 16.00,
          stop_loss: 14.10,
          take_profit_1: 17.50,
          take_profit_2: 19.00,
          weak_exit: 14.60,
          position_sizing: "15% 首板温和配置",
          holding_strategy: "首板高承接观察。分1-3日轻度吸纳",
          risk_notes: "主力锁仓较高，注意次日若低于-2%开盘则表明弱转弱，放弃吸纳。",
          ai_strategy_diff: "AI指出智能驾驶和飞行汽车技术外包有爆发迹象，建议将止盈目标一提高到18.00（上调3%），因其具有极佳题材独特性。"
        },
        explanation: "符合稳健短线的极致配伍！价格位于近120日低点15%波动区内，缩量横盘超过9天后，首个健康反包板。量比1.6倍完全不爆量，换手率4.2%筹码流动处于蜜月点。",
        selection_date: "2026-05-21",
        matched_factors: ["低上方压力筹码", "同花顺题材丰富", "小流通市值活跃"],
        risk_factors: [],
        similarity_status: "接近成功样本",
        local_factors_weights: { trend_structure: 35, liquidity: 35, resonance: 20, risk_drag: 10 }
      }
    ]
  },
  "2026-03-11": {
    "limit_up_momentum": [
      {
        rank: 1,
        stock: {
          ts_code: "300328.SZ",
          name: "宜安科技",
          price: 19.92,
          change_pct: 10.3,
          total_score: 90.0,
          tech_score: 92.0,
          fund_score: 91.0,
          cap_score: 88.0,
          risk_score: 85.0,
          market_type: "创业板",
          logo_hint: "液态金属 & 医疗",
          is_zhangting: true,
          volume_ratio: 3.2,
          turnover_rate: 9.3,
          pe_ttm: 55.4,
          total_mv: 137.4,
          circ_mv: 136.5,
          vwap_deviation: 1.04,
          tail_behavior: "尾盘封板极牢"
        },
        plan: {
          pullback_buy: 18.20,
          breakout_buy: 21.00,
          no_chase_limit: 22.10,
          stop_loss: 17.50,
          take_profit_1: 24.50,
          take_profit_2: 27.00,
          weak_exit: 18.00,
          position_sizing: "15% 核心头仓",
          holding_strategy: "短线持有5~10日，博弈第一板向上动能续航",
          risk_notes: "估值偏高，若大盘出现流动性踩踏其可能率先退潮。"
        },
        explanation: "液态金属概念龙头。近期经过深回撤后放量回封，筹码大单比率创近90天新高，底分型确立，技术面综合得分90。属于优质的超跌后多维度爆发模板。",
        selection_date: "2026-03-11",
        matched_factors: ["高自由换手承接", "五日底分型企稳", "同花顺题材丰富", "高换手回封"],
        risk_factors: ["成本偏离过高风险"],
        similarity_status: "接近成功样本",
        local_factors_weights: { trend_structure: 35, liquidity: 35, resonance: 20, risk_drag: 10 }
      },
      {
        rank: 2,
        stock: {
          ts_code: "601868.SH",
          name: "中国能建",
          price: 3.14,
          change_pct: 6.8,
          total_score: 86.0,
          tech_score: 84.0,
          fund_score: 89.0,
          cap_score: 82.0,
          risk_score: 70.0,
          market_type: "沪主板",
          logo_hint: "央企老牌重估",
          is_zhangting: false,
          volume_ratio: 1.7,
          turnover_rate: 1.5,
          pe_ttm: 11.2,
          total_mv: 1308.0,
          circ_mv: 850.5
        },
        plan: {
          pullback_buy: 2.95,
          breakout_buy: 3.25,
          no_chase_limit: 3.32,
          stop_loss: 2.82,
          take_profit_1: 3.48,
          take_profit_2: 3.75,
          weak_exit: 2.92,
          position_sizing: "25% 重兵低吸",
          holding_strategy: "10日以上，跟随主力中线资金缓配特高压利好带来的重拾升轨",
          risk_notes: "注意权重拖累，如果上证跌破3000点强退保护。"
        },
        explanation: "电力建设核心标的，在3月11日出现主力温和承接。筹码非常干净地分布在低位，压力极低。即使大盘暴跌能建也极易作为避险中流砥柱。",
        selection_date: "2026-03-11",
        matched_factors: ["低PB首板", "低上方压力筹码"],
        risk_factors: [],
        similarity_status: "接近成功样本",
        local_factors_weights: { trend_structure: 40, liquidity: 20, resonance: 40, risk_drag: 0 }
      }
    ]
  }
};

// Past 30 Days Factor Stats (Statistical Data)
export const MOCK_FACTOR_STATS = {
  "limit_up_momentum": [
    { factor_name: "高自由换手承接", sample_count: 42, win_rate: 76.2, avg_return: 8.4, max_drawdown: -4.2, grade: "strong", observation_score: 88, desc: "最近自由换手在5-9%之间盘整后首板，是市场主力洗盘极其充分最爱的启动承接窗。" },
    { factor_name: "同花顺题材丰富", sample_count: 85, win_rate: 68.5, avg_return: 5.2, max_drawdown: -3.8, grade: "observe", observation_score: 75, desc: "标签中包含新基建、大科技或算力共振板块，能够有效吸引游资高频扫单。" },
    { factor_name: "小流通市值活跃", sample_count: 61, win_rate: 72.1, avg_return: 9.8, max_drawdown: -6.5, grade: "strong", observation_score: 82, desc: "流通市值小于50亿的主干票，弹性充沛。单日大单买入额与流通市值之比极高。" },
    { factor_name: "高换手回封", sample_count: 18, win_rate: 58.3, avg_return: 4.1, max_drawdown: -9.2, grade: "observe", observation_score: 61, desc: "日内多次开板且伴随换手率暴增至15%以上最终尾盘回封，分歧极大，需要次日确认。" },
    { factor_name: "成本偏离过高风险", sample_count: 31, win_rate: 41.2, avg_return: -2.4, max_drawdown: -14.5, grade: "risk", observation_score: 28, desc: "价格相比五日主力持仓成本均价高出12%以上。次日往往在获利大单出货下崩盘暴跌。" }
  ],
  "stable_short_term": [
    { factor_name: "低上方压力筹码", sample_count: 28, win_rate: 81.3, avg_return: 7.9, max_drawdown: -2.8, grade: "strong", observation_score: 92, desc: "上方密集筹码单峰占当前套牢盘比例小于5%，处于完全无重压起跳状态。" },
    { factor_name: "成本偏离度低", sample_count: 36, win_rate: 79.2, avg_return: 6.8, max_drawdown: -3.1, grade: "strong", observation_score: 89, desc: "吸筹重心紧贴当前价格，无前期重仓大庄抛压，即使遇到大盘踩踏也具有抗跌防守属性。" },
    { factor_name: "低PB首板", sample_count: 15, win_rate: 66.7, avg_return: 3.5, max_drawdown: -2.1, grade: "observe", observation_score: 70, desc: "破净或靠近1.5倍PB以下重资产股，通常为基建国企，重估安全，但进攻弹性也相对平缓。" }
  ]
};

// 30-Day Dual-Factor Combination Statistics (strategy_combo_stats)
export const MOCK_COMBO_STATS = [
  { combo_name: "高自由换手承接 + 低上方压力筹码", sample_count: 18, win_rate: 88.9, avg_return: 12.4, max_drawdown: -3.1, max_runup: 18.5, grade: "强组合", obs_score: 95 },
  { combo_name: "同花顺题材丰富 + 机构持仓背景", sample_count: 24, win_rate: 75.0, avg_return: 6.2, max_drawdown: -2.2, max_runup: 9.8, grade: "强组合", obs_score: 84 },
  { combo_name: "小流通市值活跃 + 成本偏离过高风险", sample_count: 12, win_rate: 33.3, avg_return: -4.8, max_drawdown: -18.2, max_runup: 5.4, grade: "风险组合", obs_score: 15 },
  { combo_name: "高自由换手承接 + 成本偏离度低", sample_count: 14, win_rate: 85.7, avg_return: 9.2, max_drawdown: -2.9, max_runup: 14.1, grade: "强组合", obs_score: 90 }
];

// Replay return curve details (Backtesting Curves)
export const MOCK_BACKTEST_CURVES: { [strategyId: string]: { date: string; strategy_return: number; benchmark_return: number; mdd: number }[] } = {
  "limit_up_momentum": [
    { date: "04-20", strategy_return: 0.0, benchmark_return: 0.0, mdd: 0.0 },
    { date: "04-22", strategy_return: 2.5, benchmark_return: -0.5, mdd: -0.1 },
    { date: "04-24", strategy_return: 5.8, benchmark_return: -1.2, mdd: -0.3 },
    { date: "04-28", strategy_return: 4.2, benchmark_return: -0.8, mdd: -1.8 },
    { date: "04-30", strategy_return: 9.3, benchmark_return: 0.2, mdd: -1.8 },
    { date: "05-04", strategy_return: 11.1, benchmark_return: -0.5, mdd: -0.2 },
    { date: "05-06", strategy_return: 14.8, benchmark_return: -1.8, mdd: -0.5 },
    { date: "05-08", strategy_return: 13.2, benchmark_return: -2.3, mdd: -2.1 },
    { date: "05-12", strategy_return: 18.4, benchmark_return: -1.5, mdd: -2.1 },
    { date: "05-14", strategy_return: 21.0, benchmark_return: -2.4, mdd: -0.8 },
    { date: "05-18", strategy_return: 19.5, benchmark_return: -3.1, mdd: -2.5 },
    { date: "05-20", strategy_return: 25.6, benchmark_return: -2.8, mdd: -2.5 }
  ],
  "stable_short_term": [
    { date: "04-20", strategy_return: 0.0, benchmark_return: 0.0, mdd: 0.0 },
    { date: "04-22", strategy_return: 1.2, benchmark_return: -0.5, mdd: 0.0 },
    { date: "04-24", strategy_return: 3.1, benchmark_return: -1.2, mdd: -0.1 },
    { date: "04-28", strategy_return: 2.8, benchmark_return: -0.8, mdd: -0.5 },
    { date: "04-30", strategy_return: 5.4, benchmark_return: 0.2, mdd: -0.5 },
    { date: "05-04", strategy_return: 6.9, benchmark_return: -0.5, mdd: -0.1 },
    { date: "05-06", strategy_return: 8.2, benchmark_return: -1.8, mdd: -0.2 },
    { date: "05-08", strategy_return: 8.5, benchmark_return: -2.3, mdd: -0.8 },
    { date: "05-12", strategy_return: 11.2, benchmark_return: -1.5, mdd: -0.8 },
    { date: "05-14", strategy_return: 12.8, benchmark_return: -2.4, mdd: -0.4 },
    { date: "05-18", strategy_return: 13.5, benchmark_return: -3.1, mdd: -1.1 },
    { date: "05-20", strategy_return: 15.2, benchmark_return: -2.8, mdd: -1.1 }
  ]
};

// Summary metrics (Backtest results)
export const MOCK_BACKTEST_SUMMARY: { [strategyId: string]: BacktestResult } = {
  "limit_up_momentum": {
    trade_date: "2026-05-20",
    strategy_id: "limit_up_momentum",
    total_samples: 84,
    win_rate: 73.8,
    avg_return: 18.25,
    max_drawdown: -6.4,
    max_runup: 28.3,
    path_distribution: {
      strong_up: 45, // 强势直接上攻%
      deep_wash: 25, // 深洗后修复%
      spike_fade: 15, // 冲高回落%
      weak_damp: 10, // 持续走弱%
      sideways: 5    // 横盘无效%
    },
    no_entry_breakdown: {
      avoid_abandon: 60, // 真该放弃%
      timing_pending: 25, // 节奏没等到%
      keep_observing: 15  // 继续观察%
    }
  },
  "stable_short_term": {
    trade_date: "2026-05-20",
    strategy_id: "stable_short_term",
    total_samples: 48,
    win_rate: 81.2,
    avg_return: 12.40,
    max_drawdown: -3.1,
    max_runup: 16.8,
    path_distribution: {
      strong_up: 52,
      deep_wash: 30,
      spike_fade: 8,
      weak_damp: 5,
      sideways: 5
    },
    no_entry_breakdown: {
      avoid_abandon: 70,
      timing_pending: 20,
      keep_observing: 10
    }
  }
};

// Multi-strategy cross validation results
export const MOCK_STRATEGY_COMPARISON = [
  { ts_code: "300629.SZ", name: "新劲刚", limit_up_momentum: 91.5, stable_short_term: 71.0, chan_theory: 85.0, default_quant: 88.0, total_hits: 4, comment: "四策略极强共振，买入一致性极强" },
  { ts_code: "301176.SZ", name: "逸豪新材", limit_up_momentum: 87.2, stable_short_term: 65.0, chan_theory: 62.0, default_quant: 74.0, total_hits: 2, comment: "主打超短动量，波段缠论尚未成型" },
  { ts_code: "603779.SH", name: "阿尔特", limit_up_momentum: 81.0, stable_short_term: 83.2, chan_theory: 78.0, default_quant: 80.5, total_hits: 4, comment: "首板高承接共振，阿尔特进入温和主升通道" },
  { ts_code: "601868.SH", name: "中国能建", limit_up_momentum: 84.1, stable_short_term: 58.0, chan_theory: 54.0, default_quant: 85.0, total_hits: 2, comment: "重资产大票，受制于流通盘，稳健派低吸契合" }
];

export const MOCK_CONTEXT_NEWS: ExternalContext[] = [
  {
    id: "news_1",
    ts_code: "300629.SZ",
    stock_name: "新劲刚",
    title: "新劲刚完成第三代半导体毫米波芯片等项目的军工批量定货",
    source: "东方财富财经网",
    date: "2026-05-20",
    url: "https://stock.eastmoney.com/300629.html",
    category: "利好待证实",
    summary: "披露近期公司成功斩获重大批量采购订单。公司在射频微波及宽禁带芯片材料应用方面，打破国外垄断，处于批量供货第一阶段。",
    relevance_score: 98
  },
  {
    id: "news_2",
    ts_code: "301176.SZ",
    stock_name: "逸豪新材",
    title: "铜箔大厂逸豪新材拟投资12亿元扩建高端超薄电子铜箔生产线",
    source: "证券日报",
    date: "2026-05-19",
    url: "https://stock.eastmoney.com/301176.html",
    category: "普通资讯",
    summary: "逸豪新材公告为服务高可靠性PCB和AI服务器，决定新增15000吨高频低粗糙度超薄铜箔及挠性覆铜板产能。前期财务支出可能压低Q2净利润。",
    relevance_score: 95
  },
  {
    id: "news_3",
    ts_code: "603779.SH",
    stock_name: "阿尔特",
    title: "阿尔特签署重组合同：涉及旗下智能网联汽车核心资产重合",
    source: "财联社",
    date: "2026-05-20",
    url: "https://stock.eastmoney.com/603779.html",
    category: "普通资讯",
    summary: "签署汽车研发流程全栈AI大模型服务供应协议，为海外三大主机厂设计下一代新能源平台主力车型。该项目执行期限未定，注意合同兑现风险。",
    relevance_score: 92
  },
  {
    id: "news_4",
    ts_code: "000000.SZ", // Mismatched intentionally for clean simulator testing
    stock_name: "未知代码",
    title: "【无关联】某第三方白皮书提到A股市场未来20日板块轮动速度加速",
    source: "大盘资讯",
    date: "2026-05-18",
    url: "https://stock.eastmoney.com/000000.html",
    category: "无有效信息",
    summary: "不牵涉任何具体精选个股，纯行业分析通稿。由于代码不匹配用户所选的A股目标，将可以通过清理缓存被擦除。",
    relevance_score: 12
  }
];

// Rich logs for Terminal Simulator that mirrors real errors in REQUIREMENTS
export const MOCK_BOT_LOGS = [
  "2026-05-21 09:42:19,899 - bots.telegram_bot - INFO - Bot initialized for Long Big (@Long_big2598) (ID: 7188384518)",
  "2026-05-21 09:42:19,900 - bots.telegram_bot - INFO - LLM status: enabled=True configured=True model=deepseek-v3.2 enrich_all=True max_items=30",
  "2026-05-21 09:42:19,901 - bots.telegram_bot - INFO - === Stock analysis Telegram bot starting ===",
  "2026-05-21 09:42:19,901 - bots.telegram_bot - INFO - Database: D:/ai/gupiao/stock_database.db",
  "2026-05-21 09:42:19,905 - bots.telegram_bot - WARNING - Telegram SSL verification is disabled by TELEGRAM_VERIFY_SSL=false",
  "2026-05-21 09:42:21,408 - telegram.ext.Application - INFO - Application started",
  "2026-05-21 10:09:08,102 - bots.handlers - INFO - User /start: Long_big2598 (ID: 7188384518)",
  "2026-05-21 10:09:14,608 - bots.handlers - INFO - User callback: Long_big2598 -> track_today_default",
  "2026-05-21 10:09:23,976 - bots.handlers - INFO - User callback: Long_big2598 -> top_stocks",
  "2026-05-21 10:09:29,409 - services.data_service - INFO - Collecting company_profile for 688571...",
  "2026-05-21 10:09:34,081 - scrapers.news_scraper - INFO - Scraping news for 688571 (market: 17, days: 90)",
  "2026-05-21 11:30:41,739 - bots.handlers - ERROR - Queued task failed: 稳健短线 前10名",
  "2026-05-21 11:30:41,739 - bots.handlers - ERROR - Traceback (most recent call last):",
  "  File 'D:\\ai\\gu\\bots\\handlers.py', line 170, in task_worker_loop",
  "    result = await asyncio.to_thread(task.work)",
  "  File 'D:\\ai\\gu\\bots\\telegram_bot.py', line 3627, in build_selection_summary_bundle",
  "    'sector_resonance_groups': sector_resonance_groups,",
  "NameError: name 'sector_resonance_groups' is not defined (HOTFIXED in v1.0.0)",
  "2026-05-21 18:07:03,775 - database.db_manager - INFO - Added stock: 002442 (33)",
  "2026-05-21 18:07:34,223 - scrapers.company_scraper - INFO - Scraping company profile for 300323 (market: 33)",
  "2026-05-21 18:30:21,631 - core.stock_context_service - INFO - External context skipped for 300323.SZ: <urlopen error [WinError 10054] 远程主机强迫关闭了...>",
  "2026-05-21 19:13:45,533 - bots.handlers - WARNING - Markdown send failed; retrying as plain text",
  "2026-05-21 19:13:46,167 - asyncio - ERROR - Task-7 daily_market_sync_loop retry due to: RetryAfter('Flood control exceeded. Retry in 37 seconds')",
  "2026-05-21 19:15:00,000 - core.data_sync_service - INFO - Daily Tushare incremental sync SUCCESS, audited trade date 20260520 written.",
  "2026-05-21 19:16:34,264 - bots.telegram_bot - INFO - THS selected-stock background collection finished: {'collected': 8, 'skipped_cache': 2}",
  "2026-05-21 19:18:40,942 - bots.handlers - INFO - Task worker loop: auto-pick scheduled daily strategy 'limit_up_momentum' Top10 trigger success, auto-saving tracking snapshots and pushing Markdown reports..."
];
