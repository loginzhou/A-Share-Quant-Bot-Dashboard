export interface StockItem {
  ts_code: string;
  name: string;
  price: number;
  change_pct: number;
  total_score: number;
  tech_score: number;
  fund_score: number;
  cap_score: number;
  risk_score: number;
  market_type: "创业板" | "科创板" | "深主板" | "沪主板" | "北交所";
  logo_hint?: string;
  is_zhangting: boolean;
  volume_ratio: number;
  turnover_rate: number;
  pe_ttm: number;
  total_mv: number; // 亿元
  circ_mv: number; // 亿元
  
  // Chan specific
  signal_type?: string;
  current_structure?: string;
  bi_count?: number;
  fractal_low_price?: number;
  
  // Intraday
  vwap_deviation?: number;
  tail_behavior?: string;
  fraud_trap?: boolean;
  rapid_tail_selloff?: boolean;
}

export interface TradingPlan {
  pullback_buy: number;
  breakout_buy: number;
  no_chase_limit: number;
  stop_loss: number;
  take_profit_1: number;
  take_profit_2: number;
  weak_exit: number;
  position_sizing: string;
  holding_strategy: string;
  risk_notes: string;
  ai_strategy_diff?: string; // Local vs LLM strategy diff
}

export interface Recommendation {
  rank: number;
  stock: StockItem;
  plan: TradingPlan;
  explanation: string;
  selection_date: string;
  matched_factors: string[];
  risk_factors: string[];
  similarity_status: "接近成功样本" | "部分接近" | "偏离成功样本" | "样本不足";
  local_factors_weights: {
    trend_structure: number; // 结构趋势%
    liquidity: number; // 流动承接%
    resonance: number; // 共振确认%
    risk_drag: number; // 风险拖累%
  };
}

export interface StrategyConfig {
  id: string;
  name: string;
  chinese_name: string;
  description: string;
  enabled: boolean;
  is_custom: boolean;
  base_strategy?: string;
  params: {
    [key: string]: number | string | boolean;
  };
  manual_factors: {
    id: string;
    factor_name: string;
    grade: "observe" | "strong" | "risk";
    description: string;
    enabled: boolean;
  }[];
}

export interface BacktestResult {
  trade_date: string;
  strategy_id: string;
  total_samples: number;
  win_rate: number;
  avg_return: number;
  max_drawdown: number;
  max_runup: number;
  path_distribution: {
    strong_up: number;   // 强势直接上攻
    deep_wash: number;   // 深洗后修复
    spike_fade: number;  // 冲高回落
    weak_damp: number;   // 持续走弱
    sideways: number;    // 横盘无效
  };
  no_entry_breakdown: {
    avoid_abandon: number;    // 真该放弃
    timing_pending: number;   // 节奏没等到
    keep_observing: number;   // 继续观察
  };
}

export interface ExternalContext {
  id: string;
  ts_code: string;
  stock_name: string;
  title: string;
  source: string;
  date: string;
  url: string;
  category: "无有效信息" | "普通资讯" | "利好待证实" | "风险公告";
  summary: string;
  relevance_score: number; // 0-100
}

export interface SystemStatus {
  latest_trade_date: string;
  total_stocks: number;
  daily_data_records: number;
  daily_basic_records: number;
  sync_attempts_today: number;
  sync_success_rate: number;
  last_sync_time: string;
  is_bot_online: boolean;
  bot_pings_success: boolean;
  watchdog_alert: boolean;
  llm_provider: string;
  llm_status: "online" | "offline" | "disabled";
}
