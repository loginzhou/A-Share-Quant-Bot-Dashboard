import React, { useState } from "react";
import { MOCK_BACKTEST_SUMMARY, MOCK_BACKTEST_CURVES } from "../mockData";
import { BacktestResult, StrategyConfig } from "../types";
import { LineChart, PlayCircle, BarChart3, HelpCircle, Activity, Award, ShieldClose, TrendingUp, Sparkles, FileSpreadsheet } from "lucide-react";

interface BacktestPanelProps {
  strategies: StrategyConfig[];
}

export const BacktestPanel: React.FC<BacktestPanelProps> = ({ strategies }) => {
  const [selectedStratId, setSelectedStratId] = useState<string>("limit_up_momentum");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progMsg, setProgMsg] = useState<string>("");
  const [backtestStats, setBacktestStats] = useState<{ [stratId: string]: BacktestResult }>(MOCK_BACKTEST_SUMMARY);

  const activeStrategy = strategies.find(s => s.id === selectedStratId) || strategies[0];
  const summary = backtestStats[selectedStratId] || MOCK_BACKTEST_SUMMARY["limit_up_momentum"];
  const curveData = MOCK_BACKTEST_CURVES[selectedStratId] || MOCK_BACKTEST_CURVES["limit_up_momentum"];

  // SVG dimensions for pure custom return curves
  const width = 600;
  const height = 180;
  const padding = { top: 15, right: 15, bottom: 20, left: 35 };

  // Calculate coordinates
  const returns = curveData.map(c => c.strategy_return);
  const benchReturns = curveData.map(c => c.benchmark_return);
  const allReturns = [...returns, ...benchReturns];
  const minVal = Math.min(...allReturns, -5);
  const maxVal = Math.max(...allReturns, 30);

  const getX = (index: number) => padding.left + (index / (curveData.length - 1)) * (width - padding.left - padding.right);
  const getY = (value: number) => {
    const scale = (height - padding.top - padding.bottom) / (maxVal - minVal);
    return height - padding.bottom - (value - minVal) * scale;
  };

  const stratPoints = curveData.map((c, i) => `${getX(i).toFixed(1)},${getY(c.strategy_return).toFixed(1)}`).join(" ");
  const benchPoints = curveData.map((c, i) => `${getX(i).toFixed(1)},${getY(c.benchmark_return).toFixed(1)}`).join(" ");

  // Trigger interactive backtest simulation
  const handleRunBacktest = () => {
    if (isRunning) return;
    setIsRunning(true);
    setProgress(10);
    setProgMsg("正在连接 D:/ai/gupiao 检查数据层，对准 trade_date_minute_status...");

    const steps = [
      { p: 30, m: "正在加载过去30日行情数据流，排除ST/停牌一字板..." },
      { p: 60, m: "正在计算策略中笔分型、承接重心、成交量因子双线对齐..." },
      { p: 85, m: "正在执行 5/10/20日 阻力/支撑 归属，对准 T+1 触发限值..." },
      { p: 100, m: "回测运行成功！重新聚拢 30日 因素占比及路径特征。" }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setProgress(step.p);
        setProgMsg(step.m);
        if (step.p === 100) {
          setIsRunning(false);
          // Slightly fluctuate stats to simulate live recalculated edge optimization
          setBacktestStats((prev) => {
            const current = prev[selectedStratId];
            if (!current) return prev;
            return {
              ...prev,
              [selectedStratId]: {
                ...current,
                win_rate: parseFloat((current.win_rate + (Math.random() * 1.5 - 0.5)).toFixed(1)),
                avg_return: parseFloat((current.avg_return + (Math.random() * 0.8 - 0.2)).toFixed(1)),
                total_samples: current.total_samples + 1
              }
            };
          });
        }
      }, (idx + 1) * 800);
    });
  };

  return (
    <div className="space-y-6" id="backtest-panel-component">
      {/* Selection row + Action Trigger button */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 shrink-0 font-mono">回测分析策略架:</span>
          <select
            value={selectedStratId}
            onChange={(e) => setSelectedStratId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 flex-1 md:w-64"
          >
            {strategies.map(s => (
              <option key={s.id} value={s.id}>{s.chinese_name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <button
            onClick={handleRunBacktest}
            disabled={isRunning}
            className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-sans text-xs font-bold rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition"
          >
            <PlayCircle className="w-4 h-4" />
            重算回测与逻辑验证
          </button>
        </div>
      </div>

      {isRunning && (
        <div className="bg-slate-950 border border-emerald-900/60 p-4 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-emerald-400 font-mono font-semibold">{progMsg}</span>
            <span className="text-slate-400 font-mono">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full duration-300 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Stats Bento Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Win rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3 shadow-lg">
          <div className="p-3 rounded-lg bg-emerald-950 text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 font-mono block">回测胜率 (Win Rate)</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-sans tracking-tight text-slate-100">{summary.win_rate}%</span>
              <span className="text-[10px] text-emerald-400 font-mono">胜一超额</span>
            </div>
          </div>
        </div>

        {/* Avg yield return */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3 shadow-lg">
          <div className="p-3 rounded-lg bg-indigo-950 text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 font-mono block">持仓平均退出涨幅</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-sans tracking-tight text-slate-100">+{summary.avg_return}%</span>
              <span className="text-[10px] text-indigo-400 font-mono">周转极限度</span>
            </div>
          </div>
        </div>

        {/* Max drawdown / Max runup */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3 shadow-lg">
          <div className="p-3 rounded-lg bg-rose-950 text-rose-400">
            <ShieldClose className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 w-full">
            <span className="text-[10px] text-slate-500 font-mono block">回撤及向上空间</span>
            <div className="flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-500 font-mono block">极限回撤</span>
                <span className="font-bold text-rose-400 font-mono">{summary.max_drawdown}%</span>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-[9px] text-slate-500 font-mono block">最大上涨</span>
                <span className="font-bold text-emerald-400 font-mono">+{summary.max_runup}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Compound profit curve graph */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-250 font-mono uppercase">
                复利净值收益路径 (30日对照曲线)
              </h4>
              <p className="text-[10px] text-slate-500">
                以最近30日全量A股仿真复合收益作为主轴，与基准指数进行严密追踪。
              </p>
            </div>
            {/* Chart Legend */}
            <div className="flex items-center space-x-3 text-[9px] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-indigo-400 inline-block" />
                策略收益 ({curveData[curveData.length-1].strategy_return.toFixed(1)}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-slate-600 inline-block" />
                沪深300 ({curveData[curveData.length-1].benchmark_return.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Pure Custom SVG Area Graph */}
          <div className="relative py-2">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
              {/* Grid Lines */}
              <line x1={padding.left} y1={getY(25)} x2={width - padding.right} y2={getY(25)} stroke="#334155" strokeDasharray="2,3" />
              <line x1={padding.left} y1={getY(15)} x2={width - padding.right} y2={getY(15)} stroke="#334155" strokeDasharray="2,3" />
              <line x1={padding.left} y1={getY(5)} x2={width - padding.right} y2={getY(5)} stroke="#334155" strokeDasharray="2,3" />
              <line x1={padding.left} y1={getY(0)} x2={width - padding.right} y2={getY(0)} stroke="#475569" strokeWidth={1} />
              <line x1={padding.left} y1={getY(-5)} x2={width - padding.right} y2={getY(-5)} stroke="#334155" strokeDasharray="2,3" />

              {/* Y Axis Labels */}
              <text x={padding.left - 6} y={getY(25) + 3} textAnchor="end" className="fill-slate-500 font-mono text-[9px]">25%</text>
              <text x={padding.left - 6} y={getY(15) + 3} textAnchor="end" className="fill-slate-500 font-mono text-[9px]">15%</text>
              <text x={padding.left - 6} y={getY(5) + 3} textAnchor="end" className="fill-slate-500 font-mono text-[9px]">5%</text>
              <text x={padding.left - 6} y={getY(0) + 3} textAnchor="end" className="fill-slate-400 font-mono text-[9px]">0%</text>
              <text x={padding.left - 6} y={getY(-5) + 3} textAnchor="end" className="fill-slate-500 font-mono text-[9px]">-5%</text>

              {/* Benchmark Curve Line */}
              <polyline points={benchPoints} fill="none" stroke="#64748b" strokeWidth={1.5} strokeLinecap="round" />

              {/* Strategy Yield Curve Line */}
              <polyline points={stratPoints} fill="none" stroke="#818cf8" strokeWidth={2.5} strokeLinecap="round" />

              {/* Data Node Dots */}
              {curveData.map((c, i) => (
                <circle
                  key={i}
                  cx={getX(i)}
                  cy={getY(c.strategy_return)}
                  r={i === curveData.length - 1 ? 4 : 2}
                  className="fill-indigo-400 stroke-slate-900"
                  strokeWidth={1}
                />
              ))}

              {/* Dates Labels */}
              {curveData.map((c, i) => {
                if (i % 2 === 0 || i === curveData.length - 1) {
                  return (
                    <text
                      key={i}
                      x={getX(i)}
                      y={height - 2}
                      textAnchor="middle"
                      className="fill-slate-500 font-mono text-[8px]"
                    >
                      {c.date}
                    </text>
                  );
                }
                return null;
              })}
            </svg>
          </div>
        </div>

        {/* Right Column: Path & No-Entry Analysis */}
        <div className="lg:col-span-5 space-y-6">
          {/* Path behavior breakdown chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h4 className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              追踪周期路径特征画像 (Path Profile)
            </h4>
            <span className="text-[10px] text-slate-500 block leading-normal">
              分类观察在 5/10/20日 追踪期限里行情的主导运行画像，用于辅助回滚排除亏损根源。
            </span>

            {/* Path item lists percentage horizontal bars */}
            <div className="space-y-3 pt-2">
              {[
                { name: "强势直接上攻", value: summary.path_distribution.strong_up, barColor: "bg-emerald-500", desc: "介入后直接拉高或一字连板，最完美套利路线。" },
                { name: "深洗盘后修复", value: summary.path_distribution.deep_wash, barColor: "bg-indigo-500", desc: "入场后先遭大幅回调5-10%，再在均线企稳反攻。" },
                { name: "冲高回落套牢", value: summary.path_distribution.spike_fade, barColor: "bg-amber-500", desc: "早盘诱多高开超过8%后急速泄洪，尾盘回吐套死。" },
                { name: "持续疲软走弱", value: summary.path_distribution.weak_damp, barColor: "bg-rose-500", desc: "缺乏游资和主力承接，一路阴跌跌穿止损警戒。" },
                { name: "横盘低效震荡", value: summary.path_distribution.sideways, barColor: "bg-slate-600", desc: "每天波幅极微小，不涨不跌，时间损耗型成本。" }
              ].map((p, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-300 font-semibold">{p.name} ({p.value}%)</span>
                    <span className="text-slate-500 text-[9px] font-sans truncate max-w-[200px]">{p.desc}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className={`h-full ${p.barColor}`} style={{ width: `${p.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* No Entry triggers breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h4 className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              “未触发入场”精细化拆分 (No-Entry Breakdown)
            </h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              统计所有“高得分高排名但未进入硬性买点”的可控交易，判断是否达成合理的胜率防御策略优化。
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { label: "真该放弃", value: summary.no_entry_breakdown.avoid_abandon, c: "text-emerald-400 bg-emerald-950/40 border-emerald-900/40", d: "未入买点后股价崩盘" },
                { label: "节奏没等到", value: summary.no_entry_breakdown.timing_pending, c: "text-indigo-455 bg-indigo-950/40 border-indigo-900/40", d: "开盘直接冲，拉空" },
                { label: "继续观察", value: summary.no_entry_breakdown.keep_observing, c: "text-slate-400 bg-slate-950 border-slate-800", d: "股价横向沉闷不触发" }
              ].map((b, i) => (
                <div key={i} className={`p-2.5 rounded-lg border text-center flex flex-col justify-between ${b.c}`}>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold block">{b.label}</span>
                    <span className="text-sm font-extrabold font-mono">{b.value}%</span>
                  </div>
                  <span className="text-[8px] text-slate-500 block font-sans pt-1 mt-1 border-t border-slate-800/60 leading-tight">
                    {b.d}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
