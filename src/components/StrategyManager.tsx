import React, { useState } from "react";
import { StrategyConfig } from "../types";
import { Check, Settings, ShieldAlert, Plus, ToggleLeft, ToggleRight, Trash2, Sliders, FileSpreadsheet, Eye, HelpCircle } from "lucide-react";

interface StrategyManagerProps {
  strategies: StrategyConfig[];
  onUpdateStrategy: (id: string, updated: Partial<StrategyConfig>) => void;
  onCreateCustomStrategy: (newStrategy: StrategyConfig) => void;
  onDeleteCustomStrategy: (id: string) => void;
}

const PARAM_TRANSLATIONS: { [key: string]: string } = {
  // 涨停双向动量主策略
  limit_up_percent: "起板/涨停最低幅度 (%)",
  volume_ratio_limit: "起板限制最低量比 (量比阀值)",
  trend_days_lookback: "趋势回归观察周期 (天)",
  score_threshold: "策略综合评分通过门槛下限",

  // 稳健短线首板策略 / 低市值超跌首板微调
  turnover_rate_max: "最高换手率上限限制 (%)",
  turnover_rate_min: "最低换手率开仓限制 (%)",
  circ_mv_max_billion: "最大流通市值过滤上限 (亿元)",
  circ_mv_min_billion: "最低流通安全市值下限 (亿元)",
  volume_ratio_max: "最大温和放量比阈值",

  // 缠论底分型与笔买卖点策略
  strict_bi_rule: "启用严格缠论「笔」构筑标准",
  pen_min_bars: "构成单笔最低 K 线数量 (根)",
  fractal_threshold: "底分型确认波幅警戒阈值 (%)",
  macd_cross_validate: "MACD日线零轴金叉交叉二次校验",

  // 多维度量化加权基准模型
  trend_weight: "结构趋势分项评分权重比",
  volume_weight: "成交流动承接地量分权重比",
  fund_weight: "主力大单单峰筹码分权重比",
  risk_weight: "主观风控防御分项权重比",
};

export const StrategyManager: React.FC<StrategyManagerProps> = ({
  strategies,
  onUpdateStrategy,
  onCreateCustomStrategy,
  onDeleteCustomStrategy,
}) => {
  const [selectedId, setSelectedId] = useState<string>("limit_up_momentum");
  const [cloneName, setCloneName] = useState<string>("");
  const [newFactorName, setNewFactorName] = useState<string>("");
  const [newFactorDesc, setNewFactorDesc] = useState<string>("");
  const [newFactorGrade, setNewFactorGrade] = useState<"observe" | "strong" | "risk">("observe");

  const selectedStrategy = strategies.find((s) => s.id === selectedId) || strategies[0];

  const handleParamChange = (paramKey: string, val: number | string | boolean) => {
    const updatedParams = { ...selectedStrategy.params, [paramKey]: val };
    onUpdateStrategy(selectedStrategy.id, { params: updatedParams });
  };

  const handleUpdateStatus = () => {
    onUpdateStrategy(selectedStrategy.id, { enabled: !selectedStrategy.enabled });
  };

  // Add manual factor experience
  const handleAddFactor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactorName.trim()) return;

    const newFactorItem = {
      id: "factor_" + Date.now(),
      factor_name: newFactorName,
      grade: newFactorGrade,
      description: newFactorDesc || "用户添加的主观判断要点说明。",
      enabled: true,
    };

    const updatedFactors = [...selectedStrategy.manual_factors, newFactorItem];
    onUpdateStrategy(selectedStrategy.id, { manual_factors: updatedFactors });

    // reset fields
    setNewFactorName("");
    setNewFactorDesc("");
  };

  const handleToggleFactor = (factorId: string) => {
    const updatedFactors = selectedStrategy.manual_factors.map((f) =>
      f.id === factorId ? { ...f, enabled: !f.enabled } : f
    );
    onUpdateStrategy(selectedStrategy.id, { manual_factors: updatedFactors });
  };

  const handleDeleteFactor = (factorId: string) => {
    const updatedFactors = selectedStrategy.manual_factors.filter((f) => f.id !== factorId);
    onUpdateStrategy(selectedStrategy.id, { manual_factors: updatedFactors });
  };

  // Clone strategy
  const handleCloneStrategy = () => {
    if (!cloneName.trim()) return;
    const cleanId = "custom_" + cloneName.toLowerCase().replace(/\s+/g, "_").substring(0, 20);

    const newConfig: StrategyConfig = {
      id: cleanId,
      name: cleanId,
      chinese_name: `${selectedStrategy.chinese_name} - ${cloneName}微调`,
      description: `基于内置 [${selectedStrategy.chinese_name}] 派生的自定义微调实例。`,
      enabled: true,
      is_custom: true,
      base_strategy: selectedStrategy.id,
      params: { ...selectedStrategy.params },
      manual_factors: [...selectedStrategy.manual_factors],
    };

    onCreateCustomStrategy(newConfig);
    setSelectedId(cleanId);
    setCloneName("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="strategy-manager-component">
      {/* Sidebar: Strategy Selector List */}
      <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
          量化及精选策略家族
        </h3>
        <div className="space-y-2">
          {strategies.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => setSelectedId(strategy.id)}
              className={`w-full text-left p-3.5 rounded-lg border transition duration-200 flex flex-col space-y-1 ${
                selectedStrategy.id === strategy.id
                  ? "bg-slate-800/80 border-indigo-500 text-indigo-400"
                  : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/20 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-sans font-semibold text-xs text-slate-100">
                  {strategy.chinese_name}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    strategy.enabled ? "bg-emerald-950 text-emerald-400" : "bg-rose-950/40 text-rose-400"
                  }`}
                >
                  {strategy.enabled ? "开启" : "暂停"}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {strategy.is_custom ? `自定义自定义 · 派生自 ${strategy.base_strategy}` : `内置策略 · ${strategy.name}`}
              </span>
            </button>
          ))}
        </div>

        {/* Clone Section */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-400">派生新建微调实例</h4>
            <p className="text-[10px] text-slate-500">
              您可以复制当前主流策略，在右侧为您的参数设置微调，生成新的筛选。
            </p>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="如: 低位锁仓超短"
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleCloneStrategy}
              disabled={!cloneName.trim()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold"
            >
              复制
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Parameter Config & Manual Factors */}
      <div className="lg:col-span-8 space-y-6">
        {/* Strategy Meta & Quick Switch Toggle */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-200">{selectedStrategy.chinese_name}</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
                  {selectedStrategy.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">{selectedStrategy.description}</p>
            </div>
            <button
              onClick={handleUpdateStatus}
              className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-800 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs font-medium text-slate-300 self-start sm:self-center transition"
            >
              {selectedStrategy.enabled ? (
                <>
                  <ToggleRight className="w-5 h-5 text-emerald-400" />
                  <span>已启用</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-slate-500" />
                  <span>已禁用</span>
                </>
              )}
            </button>
          </div>

          {/* Parameters Form grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase font-mono">
              <Sliders className="w-4 h-4 text-indigo-400" />
              策略因子权重与参数阈值微调
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(selectedStrategy.params).map(([key, val]) => {
                const isBoolean = typeof val === "boolean";
                const isNumber = typeof val === "number";
                const chineseLabel = PARAM_TRANSLATIONS[key] || key;

                return (
                  <div key={key} className="bg-slate-950 border border-slate-800/60 p-3 rounded-lg flex flex-col space-y-2">
                    <div className="flex flex-col space-y-0.5">
                      <span className="text-xs font-semibold text-slate-200">{chineseLabel}</span>
                      <span className="text-[10px] font-mono text-slate-500">{key}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-900 pt-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-500 font-mono">当前数值</span>
                      <span className="text-xs font-mono text-indigo-400 font-bold">
                        {isBoolean ? (val ? "是 (True)" : "否 (False)") : val}
                      </span>
                    </div>

                    {isBoolean ? (
                      <button
                        onClick={() => handleParamChange(key, !val)}
                        className="w-full py-1 text-center bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300 font-medium hover:bg-slate-800"
                      >
                        双击切换逻辑 (点击切换)
                      </button>
                    ) : isNumber ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min={key.includes("weight") ? 0 : key.includes("ratio") || key.includes("threshold") ? 1 : 0}
                          max={key.includes("weight") ? 1 : key.includes("pct") || key.includes("percent") || key.includes("days") ? 100 : 50}
                          step={key.includes("weight") ? 0.05 : 0.1}
                          value={val as number}
                          onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
                          className="flex-1 accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          step={key.includes("weight") ? 0.05 : 1}
                          value={val as number}
                          onChange={(e) => handleParamChange(key, parseFloat(e.target.value) || 0)}
                          className="w-14 bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-[10px] text-center text-slate-200 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={val as string}
                        onChange={(e) => handleParamChange(key, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-indigo-400 animate-none"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {selectedStrategy.is_custom && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => onDeleteCustomStrategy(selectedStrategy.id)}
                  className="px-3 py-1.5 bg-rose-950/40 text-rose-400 hover:bg-rose-900/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-rose-900/40 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除自定义派生策略
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Manual Experience Factors Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase font-mono">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                人工经验防错因子与主观风控 (SQLite)
              </h4>
              <p className="text-[10px] text-slate-500">
                这些因子不参与前N名回测的数理公式指标，专属于对主策略输出做重叠的人性经验防范、题材研判提示。
              </p>
            </div>
          </div>

          {/* Current Manual Factors List */}
          <div className="space-y-2">
            {selectedStrategy.manual_factors.length === 0 ? (
              <div className="text-center py-6 text-slate-600 border border-dashed border-slate-800 rounded-lg text-xs">
                当前策略暂无外部关联的人工经验因子
              </div>
            ) : (
              selectedStrategy.manual_factors.map((factor) => (
                <div
                  key={factor.id}
                  className={`border p-3 rounded-lg flex items-start justify-between gap-3 ${
                    factor.enabled
                      ? "bg-slate-950/60 border-slate-800"
                      : "bg-slate-950/20 border-slate-900 text-slate-600"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[9px] font-sans px-1.5 py-0.5 rounded font-bold uppercase ${
                        factor.grade === "strong"
                          ? "bg-emerald-950 text-emerald-400"
                          : factor.grade === "risk"
                          ? "bg-rose-950/50 text-rose-400"
                          : "bg-cyan-950/50 text-cyan-400"
                      }`}>
                        {factor.grade === "strong" ? "强多因子" : factor.grade === "risk" ? "风控防御" : "常规观察"}
                      </span>
                      <span className={`text-xs font-semibold ${factor.enabled ? "text-slate-200" : "text-slate-600"}`}>
                        {factor.factor_name}
                      </span>
                    </div>
                    <p className={`text-[10px] ${factor.enabled ? "text-slate-400" : "text-slate-600"}`}>
                      {factor.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleToggleFactor(factor.id)}
                      className="text-slate-400 hover:text-slate-200 transition"
                      title={factor.enabled ? "点击停用" : "点击启动"}
                    >
                      {factor.enabled ? (
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteFactor(factor.id)}
                      className="text-slate-500 hover:text-rose-400 transition"
                      title="删除因子"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form: Add New Manual Factor */}
          <form onSubmit={handleAddFactor} className="bg-slate-950 border border-slate-800/80 p-4 rounded-lg space-y-3">
            <h5 className="text-xs font-bold text-slate-300 font-mono">添加人工经验约束因子</h5>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5 space-y-1">
                <label className="text-[10px] text-slate-400">因子名称 (建议中文简短)</label>
                <input
                  type="text"
                  placeholder="如: 高位爆量防高开低走"
                  value={newFactorName}
                  onChange={(e) => setNewFactorName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3 space-y-1">
                <label className="text-[10px] text-slate-400">分类归口</label>
                <select
                  value={newFactorGrade}
                  onChange={(e: any) => setNewFactorGrade(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="strong">强多因子 (加分)</option>
                  <option value="observe">常规观察 (中性)</option>
                  <option value="risk">风控防御 (防大面)</option>
                </select>
              </div>
              <div className="sm:col-span-4 space-y-1">
                <label className="text-[10px] text-slate-400">操作</label>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                >
                  <Plus className="w-4 h-4" />
                  保存至 sqlite
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-mono">因子作用机制与现象复盘描述</label>
              <textarea
                placeholder="例如：当龙头高位换手过载，次日如果竞价直接高开超过6%，但委买盘口不足前一日均值的0.5倍，必须拒绝追大连板。"
                value={newFactorDesc}
                onChange={(e) => setNewFactorDesc(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
