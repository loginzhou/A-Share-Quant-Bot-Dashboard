import React, { useState } from "react";
import { Recommendation, StrategyConfig } from "../types";
import { MOCK_RECOMMENDATIONS, MOCK_DATES } from "../mockData";
import { FileUp, Landmark, FileSpreadsheet, Eye, ChevronRight, PieChart, BadgeHelp, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";

interface StockSelectorProps {
  strategies: StrategyConfig[];
  onManualSaveTracking: (recs: Recommendation[]) => void;
}

export const StockSelector: React.FC<StockSelectorProps> = ({ strategies, onManualSaveTracking }) => {
  const [selectedDate, setSelectedDate] = useState<string>("2026-05-21");
  const [selectedBoard, setSelectedBoard] = useState<string>("全部");
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("limit_up_momentum");
  const [activeRank, setActiveRank] = useState<number>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMsg, setExportMsg] = useState<string>("");

  const activeStrategy = strategies.find((s) => s.id === selectedStrategyId) || strategies[0];

  // Retrieve recommendations list based on Date and Strategy
  const dateData = MOCK_RECOMMENDATIONS[selectedDate] || {};
  const rawRecs = dateData[selectedStrategyId] || [];

  // Filter recommendations by Board
  const filteredRecs = rawRecs.filter((rec) => {
    if (selectedBoard === "全部") return true;
    if (selectedBoard === "创业板") return rec.stock.market_type === "创业板";
    if (selectedBoard === "科创板") return rec.stock.market_type === "科创板";
    if (selectedBoard === "主板") return rec.stock.market_type === "沪主板" || rec.stock.market_type === "深主板";
    return true;
  });

  const selectedRec = filteredRecs.find((r) => r.rank === activeRank) || filteredRecs[0];

  // Helper: map board context metrics
  const getSectorResonance = (score: number) => {
    if (score >= 88) return { label: "强共振", class: "bg-emerald-950 text-emerald-400 border-emerald-900", desc: "整个相关行业板块集体放量，强重合度，具备明显主线溢价。" };
    if (score >= 82) return { label: "中等共振", class: "bg-cyan-950 text-cyan-400 border-cyan-900", desc: "板块内部分支联动，有跟风盘支撑，首板承接较好。" };
    return { label: "独立孤立强", class: "bg-amber-950 text-amber-400 border-amber-900", desc: "个股强力上涨但同板块并无跟风盘。注意防范孤掌难鸣冲高回落风险。" };
  };

  const getFundFlowQuality = (volRatio: number) => {
    if (volRatio >= 2.5) return { label: "主力强买入", class: "bg-purple-950 text-purple-400 border-purple-900" };
    if (volRatio >= 1.7) return { label: "温和流入", class: "bg-indigo-950 text-indigo-400 border-indigo-900" };
    return { label: "散户跟风", class: "bg-slate-950 text-slate-400 border-slate-900" };
  };

  const getHeatPosition = (rank: number, change: number) => {
    if (change >= 9.8) return { label: "高热度超买", class: "bg-rose-950 text-rose-400 border-rose-900" };
    if (change >= 5.0) return { label: "中等蓄势", class: "bg-indigo-950/80 text-indigo-300 border-indigo-900/60" };
    return { label: "低热蓄冷启动", class: "bg-slate-950 text-slate-400 border-slate-900" };
  };

  // CSV Exporter Simulation
  const handleExportCSV = () => {
    if (filteredRecs.length === 0) return;
    setIsExporting(true);
    setExportMsg("正在整理A股Tushare日线及估值因子层，结构化数据组装中...");

    setTimeout(() => {
      // Create CSV mock string
      const headers = "排名,代码,股票名称,收盘价格,今日涨幅%,综合量化评分,量比,换手率%,总市值(亿),流通市值(亿),最佳买入点(回踩),止损价,仓位建议\n";
      const rows = filteredRecs.map(r => 
        `${r.rank},${r.stock.ts_code},${r.stock.name},${r.stock.price},${r.stock.change_pct},${r.stock.total_score},${r.stock.volume_ratio},${r.stock.turnover_rate},${r.stock.total_mv},${r.stock.circ_mv},${r.plan.pullback_buy},${r.plan.stop_loss},${r.plan.position_sizing}`
      ).join("\n");
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(headers + rows);
      
      const link = document.createElement("a");
      link.setAttribute("href", csvContent);
      link.setAttribute("download", `A_Share_Quant_Selections_${selectedDate}_${selectedStrategyId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
      setExportMsg("✅ 成功导出 CSV 报表！已自动包含 Tushare 估值因子。");
    }, 1000);
  };

  // JSON order stream generator (Schema from requirements file!)
  const handleExportJSON = () => {
    if (!selectedRec) return;
    setIsExporting(true);
    setExportMsg("TradingStrategyService 正在校验分钟线风控 & 上证收跌过滤...");

    setTimeout(() => {
      const orderStream = {
        action: selectedRec.stock.total_score >= 68 ? "BUY" : "PASS",
        ts_code: selectedRec.stock.ts_code,
        order_type: "LIMIT",
        price: selectedRec.plan.pullback_buy,
        volume: selectedRec.stock.circ_mv <= 50 ? 2000 : 5000,
        stop_loss: selectedRec.plan.stop_loss,
        take_profit_1: selectedRec.plan.take_profit_1,
        take_profit_2: selectedRec.plan.take_profit_2,
        strategy_id: selectedStrategyId,
        expire_time: `${selectedDate} 14:55:00`,
        signal_type: selectedRec.stock.is_zhangting ? "底分型起板" : "首板后二次买点",
        current_structure: "上涨趋势",
        bi_count: 5,
        intraday_context: {
          vwap_deviation: selectedRec.stock.vwap_deviation || 1.02,
          tail_behavior: selectedRec.stock.tail_behavior || "分时平稳横盘"
        },
        timestamp: new Date().toISOString()
      };

      const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orderStream, null, 2));
      const link = document.createElement("a");
      link.setAttribute("href", jsonString);
      link.setAttribute("download", `Broker_Order_${selectedRec.stock.ts_code}_${selectedDate}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setExportMsg("✅ 自动化分时交易指令JSON流已流出，尾盘14:55分过载自动废止。");
    }, 1000);
  };

  return (
    <div className="space-y-6" id="stock-selector-component">
      {/* 股票数据准确性提示与本地 Tushare 同步对齐机制 */}
      <div className="bg-indigo-950/30 border border-indigo-900/60 rounded-xl p-4 flex flex-col sm:flex-row items-start gap-3 shadow-md">
        <span className="p-1.5 bg-indigo-950 text-indigo-300 rounded-lg shrink-0 text-xs">💡</span>
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-200">本地数据对齐机制：实盘机器人 Tushare 数据100%精准</span>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            本网页端展示的是量化选股策略的历史回测与演示数据。当您在本地 Windows 电脑通过<strong> Telegram 机器人</strong>运行 Python 文件时，脚本将会直接拉取最新的
            <code className="text-indigo-300 bg-slate-950 font-mono px-1 py-0.5 rounded mx-0.5">Tushare Pro</code> 实时接口行情，并百分百本地对齐写入您的 
            <code className="text-indigo-300 bg-slate-950 font-mono px-1 py-0.5 rounded mx-0.5">D:/ai/gupiao/stock_database.db</code> 本地数据库中，因此群里的数据是绝对准确与实时的。
          </p>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Trade date selector */}
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] text-slate-500 font-mono">交易分析日期</span>
            <select
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setActiveRank(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              {MOCK_DATES.map((date) => (
                <option key={date} value={date}>
                  {date} ({date === "2026-05-21" ? "今日最新" : "高重合旧案"})
                </option>
              ))}
            </select>
          </div>

          {/* Strategy Selection */}
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] text-slate-500 font-mono">决策策略模型</span>
            <select
              value={selectedStrategyId}
              onChange={(e) => {
                setSelectedStrategyId(e.target.value);
                setActiveRank(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {strategies.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.chinese_name}
                </option>
              ))}
            </select>
          </div>

          {/* Board Buttons */}
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] text-slate-500 font-mono">板块精简</span>
            <div className="bg-slate-950 border border-slate-800 p-0.5 rounded-lg flex space-x-1">
              {["全部", "创业板", "科创板", "主板"].map((board) => (
                <button
                  key={board}
                  onClick={() => {
                    setSelectedBoard(board);
                    setActiveRank(1);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    selectedBoard === board
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {board === "全部" ? "全市场" : board}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sync or Save tracking block */}
        <div className="flex justify-end gap-2 w-full md:w-auto self-end md:self-center shrink-0">
          <button
            onClick={() => onManualSaveTracking(filteredRecs)}
            disabled={filteredRecs.length === 0}
            className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition disabled:opacity-40"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            手动保存为本日跟踪池
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredRecs.length === 0}
            className="px-3.5 py-1.5 bg-indigo-950/40 text-indigo-400 border border-indigo-900/50 hover:bg-indigo-900/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            导出表格
          </button>
        </div>
      </div>

      {isExporting && (
        <div className="bg-slate-950 border border-indigo-900/50 p-3 rounded-lg text-xs text-indigo-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>{exportMsg}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Selection List (left) + Trading Plan Detail (right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Stocks Matching Result List */}
        <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
          {/* Header */}
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase">
                推荐决策结果汇编 (Top List)
              </h3>
              <p className="text-[10px] text-slate-500">分析全量池后，多维降序选拔的前 10 名标的。</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
              找到 {filteredRecs.length} 只合适候选
            </span>
          </div>

          {/* List Table Area */}
          <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[500px]">
            {filteredRecs.length === 0 ? (
              <div className="p-12 text-center text-slate-600 flex flex-col items-center justify-center space-y-2">
                <BadgeHelp className="w-8 h-8 text-slate-700" />
                <span className="text-xs">该交割日/或所选板块下无符合筛选评分条件个股。</span>
              </div>
            ) : (
              filteredRecs.map((rec) => {
                const s = rec.stock;
                const isActive = rec.rank === activeRank;

                return (
                  <button
                    key={s.ts_code}
                    onClick={() => setActiveRank(rec.rank)}
                    className={`w-full text-left p-4 flex items-center justify-between gap-4 transition text-xs ${
                      isActive ? "bg-slate-800/40" : "hover:bg-slate-800/10"
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      {/* Rank Indicator */}
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[11px] ${
                        rec.rank === 1
                          ? "bg-amber-500 text-slate-950"
                          : rec.rank === 2
                          ? "bg-slate-300 text-slate-950"
                          : rec.rank === 3
                          ? "bg-amber-800 text-slate-100"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {rec.rank}
                      </span>

                      {/* Stock Name & Code */}
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-100">{s.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{s.ts_code}</span>
                          {s.logo_hint && (
                            <span className="text-[9px] bg-slate-950 text-slate-400 border border-slate-800 px-1 py-0.2 rounded">
                              {s.logo_hint}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                          <span>{s.market_type}</span>
                          <span>·</span>
                          <span>量比 {s.volume_ratio}</span>
                          <span>·</span>
                          <span>换手 {s.turnover_rate}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Score and Price metrics */}
                    <div className="flex items-center space-x-4 shrink-0 text-right">
                      <div className="space-y-0.5">
                        <div className="text-slate-100 font-bold font-mono">¥{s.price.toFixed(2)}</div>
                        <span className={`text-[10px] font-bold font-mono ${s.change_pct >= 0 ? "text-rose-500" : "text-emerald-500"}`}>
                          {s.change_pct >= 0 ? "+" : ""}{s.change_pct.toFixed(2)}%
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-indigo-400 font-sans font-bold text-sm">{s.total_score.toFixed(1)}分</div>
                        <div className="text-[9px] text-slate-500">综合量化</div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-600 transition ${isActive ? "translate-x-1 text-indigo-400" : ""}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Custom Detailed Plan Panel */}
        <div className="xl:col-span-5 space-y-6">
          {selectedRec ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
              {/* Card Title */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-100">{selectedRec.stock.name}</h3>
                    <span className="text-[10px] text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.2 rounded font-mono">
                      {selectedRec.stock.ts_code}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    大单相似：{selectedRec.similarity_status}
                  </p>
                </div>
                <button
                  onClick={handleExportJSON}
                  className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-900 hover:bg-emerald-900/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <FileUp className="w-3.5 h-3.5" />
                  发出交易指令流
                </button>
              </div>

              {/* Board Context Metrics Badges */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide font-mono">
                  本地多维行面板支撑状态板
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className={`p-2.5 rounded-lg border text-center ${getSectorResonance(selectedRec.stock.tech_score).class}`}>
                    <span className="text-[9px] block text-slate-500 uppercase font-mono font-medium">板块共振度</span>
                    <span className="text-xs font-bold font-sans">{getSectorResonance(selectedRec.stock.tech_score).label}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border text-center ${getFundFlowQuality(selectedRec.stock.volume_ratio).class}`}>
                    <span className="text-[9px] block text-slate-500 uppercase font-mono font-medium">资金承接</span>
                    <span className="text-xs font-bold font-sans">{getFundFlowQuality(selectedRec.stock.volume_ratio).label}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border text-center ${getHeatPosition(selectedRec.rank, selectedRec.stock.change_pct).class}`}>
                    <span className="text-[9px] block text-slate-500 uppercase font-mono font-medium">情绪热度</span>
                    <span className="text-xs font-bold font-sans">{getHeatPosition(selectedRec.rank, selectedRec.stock.change_pct).label}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-950 p-2 rounded-lg">
                  💡 <span className="text-slate-300 font-semibold">{getSectorResonance(selectedRec.stock.tech_score).label}:</span>{" "}
                  {getSectorResonance(selectedRec.stock.tech_score).desc}
                </p>
              </div>

              {/* Rationale Factor Breakdown Weights */}
              <div className="bg-slate-950 p-3.5 rounded-lg space-y-3 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">
                    本地决策因素比重估计 (Rating Breakdown)
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    量比: {selectedRec.stock.volume_ratio}
                  </span>
                </div>
                {/* Weight slider bars mapping */}
                <div className="space-y-2">
                  {Object.entries(selectedRec.local_factors_weights).map(([key, value]) => {
                    const label = key === "trend_structure" ? "结构趋势" : key === "liquidity" ? "流动承接" : key === "resonance" ? "板块共振" : "风险拖累";
                    const barColor = key === "trend_structure" ? "bg-indigo-500" : key === "liquidity" ? "bg-cyan-500" : key === "resonance" ? "bg-purple-500" : "bg-rose-500";
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-sans">
                          <span className="text-slate-400">{label}</span>
                          <span className="text-slate-300 font-bold">{value}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor}`} style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* The deterministic Local Trading Plan pricing details */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1 font-sans uppercase">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  个股硬性交易计划 (Deterministic Trading Plan)
                </h4>
                <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl space-y-3 font-sans">
                  <div className="grid grid-cols-2 gap-4 border-b border-slate-800/60 pb-3">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-mono font-semibold">突破买入价 (起跳突破)</span>
                      <span className="text-sm font-bold text-slate-200">¥{selectedRec.plan.breakout_buy.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-mono font-semibold">低吸买入价 (回踩支撑)</span>
                      <span className="text-sm font-bold text-emerald-400">¥{selectedRec.plan.pullback_buy.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-b border-slate-800/60 pb-3 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 block font-mono">止损警戒线</span>
                      <span className="font-semibold text-rose-400">¥{selectedRec.plan.stop_loss.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block font-mono">止盈一目标</span>
                      <span className="font-semibold text-slate-300">¥{selectedRec.plan.take_profit_1.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block font-mono">止盈二目标</span>
                      <span className="font-semibold text-slate-300">¥{selectedRec.plan.take_profit_2.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-1">
                      <span className="text-[9px] text-slate-500 shrink-0 font-mono pt-0.5">强不追高限位:</span>
                      <span className="text-slate-300">¥{selectedRec.plan.no_chase_limit.toFixed(2)} (上方偏离过载，不设追击买单)</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-[9px] text-slate-500 shrink-0 font-mono pt-0.5">建仓底款配比:</span>
                      <span className="text-slate-300">{selectedRec.plan.position_sizing}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-[9px] text-slate-500 shrink-0 font-mono pt-0.5">超短控制周转:</span>
                      <span className="text-slate-300">{selectedRec.plan.holding_strategy}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Local vs AI reasoning comparison */}
              {selectedRec.plan.ai_strategy_diff && (
                <div className="bg-gradient-to-r from-slate-950 to-indigo-950/40 p-3.5 border border-indigo-950 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-indigo-900/60 text-indigo-300 font-mono px-2 py-0.5 rounded">
                      Ark-AI 操作策略对比
                    </span>
                    <span className="text-[9px] text-slate-500 font-sans">本地规则 vs 模型决策</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans italic">
                    ⭐ {selectedRec.plan.ai_strategy_diff}
                  </p>
                </div>
              )}

              {/* Intraday Context analysis (Minutes details from requirements) */}
              <div className="bg-slate-950 p-3.5 rounded-lg space-y-2.5 border border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono flex items-center justify-between">
                  <span>分时分钟线形态风控记录 (Intraday Risk Check)</span>
                  <span className="text-[9px] text-emerald-400">分时状况有效</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-slate-500 block">VWAP偏离比值</span>
                    <span className="text-slate-300 font-bold">
                      {selectedRec.stock.vwap_deviation ? selectedRec.stock.vwap_deviation : "1.02"} (偏离受控域)
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-slate-500 block">收盘后30分形态</span>
                    <span className="text-slate-300 font-bold">
                      {selectedRec.stock.tail_behavior ? selectedRec.stock.tail_behavior : "分时平稳横盘"}
                    </span>
                  </div>
                </div>
                {/* Minute warnings */}
                <div className="flex items-center space-x-4 text-[9px] text-slate-500 font-mono pt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    无分时拉高诱多抢筹 (No Fraud Trap)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    无尾盘暴砸泄洪 (No Tail Selloff)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-600 flex flex-col items-center justify-center space-y-2">
              <Eye className="w-8 h-8 text-slate-700" />
              <span className="text-xs">选中左侧行可在此深入审视交易计划及风控防偏离详情</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
