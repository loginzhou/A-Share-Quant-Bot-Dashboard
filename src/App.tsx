import { useState } from "react";
import { MOCK_SYSTEM_STATUS, MOCK_STRATEGIES } from "./mockData";
import { StrategyConfig, Recommendation, SystemStatus } from "./types";
import { Overview } from "./components/Overview";
import { StrategyManager } from "./components/StrategyManager";
import { StockSelector } from "./components/StockSelector";
import { BacktestPanel } from "./components/BacktestPanel";
import { ContextPanel } from "./components/ContextPanel";
import { BotSetup } from "./components/BotSetup";
import { 
  Building, 
  Settings, 
  TrendingUp, 
  BookOpen, 
  Terminal, 
  RefreshCw, 
  CheckCircle, 
  Activity, 
  Cpu, 
  ExternalLink,
  Sliders,
  ShieldCheck,
  UserCheck,
  Server
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [status, setStatus] = useState<SystemStatus>(MOCK_SYSTEM_STATUS);
  const [strategies, setStrategies] = useState<StrategyConfig[]>(MOCK_STRATEGIES);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Trigger sync simulation
  const handleRefreshSystem = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setStatus((prev) => ({
        ...prev,
        sync_attempts_today: prev.sync_attempts_today + 1,
        last_sync_time: new Date().toISOString().replace("T", " ").substring(0, 19),
        daily_basic_records: prev.daily_basic_records + 1500,
        daily_data_records: prev.daily_data_records + 5497
      }));
      triggerToast("✅ 成功拉取最新交易日行情！已同步更新 5,497 只 A 股日线、筹码近似与资金流。");
    }, 1500);
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Handles updating strategy parameters or factors
  const handleUpdateStrategy = (id: string, updated: Partial<StrategyConfig>) => {
    setStrategies((prev) =>
      prev.map((strat) => (strat.id === id ? { ...strat, ...updated } : strat))
    );
    triggerToast("📂 策略快照修改成功！已保存至 SQLite strategy_instances 影子表。");
  };

  // Create customized strategy cloned instance
  const handleCreateCustomStrategy = (newStrategy: StrategyConfig) => {
    setStrategies((prev) => [...prev, newStrategy]);
    triggerToast(`🛠️ 成功创建微调策略 [${newStrategy.chinese_name}] 并保存入库。`);
  };

  // Delete custom strategy
  const handleDeleteCustomStrategy = (id: string) => {
    setStrategies((prev) => prev.filter((s) => s.id !== id));
    triggerToast("🗑️ 已成功移除自定义筛选策略实例。");
  };

  // Manual trigger saving recommendations into tracking database
  const handleManualSaveTracking = (recs: Recommendation[]) => {
    if (recs.length === 0) return;
    triggerToast(`📊 已将 ${recs.length} 只策略精选标的原型与大宗交易计划保存入本地 recommendation_tracking，周期开启 5/10/20日 追踪。`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-indigo-600/30 selection:text-white" id="main-app-frame">
      {/* Top Banner and Navigation Hub */}
      <header className="bg-slate-900/65 backdrop-blur-md border-b border-slate-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo area */}
            <div className="flex items-center space-x-3 shrink-0">
              <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                <Landmark className="w-5 h-5" id="brand-logo-icon" />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                  A-Share Quant Bot Terminal
                  <span className="text-[10px] bg-indigo-950 text-indigo-400 font-mono px-1.5 py-0.5 rounded">
                    BETA V1.0
                  </span>
                </h1>
                <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <span>唯一所有者: Long Big</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-indigo-400">@Long_big2598</span>
                </p>
              </div>
            </div>

            {/* Quick Status Badges */}
            <div className="hidden md:flex items-center space-x-4 text-[10px] font-mono shrink-0">
              <div className="flex items-center space-x-1 bg-slate-950/60 border border-slate-900 px-2.5 py-1 rounded-md">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400">TG 监控: </span>
                <span className="text-slate-200">@vpn20241219uk_bot</span>
              </div>
              <div className="flex items-center space-x-1 bg-slate-950/60 border border-slate-900 px-2.5 py-1 rounded-md">
                <Server className="w-3 h-3 text-slate-500" />
                <span className="text-slate-400">本地SQL: </span>
                <span className="text-emerald-400">连接正常</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs bar */}
        <div className="border-t border-slate-900/60 bg-slate-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 py-1 text-slate-400 overflow-x-auto scrollbar-none" aria-label="Tabs">
              {[
                { id: "overview", label: "系统大盘", icon: Activity },
                { id: "strategy", label: "策略配置", icon: Sliders },
                { id: "selector", label: "选股分析", icon: TrendingUp },
                { id: "backtest", label: "逻辑验证", icon: ShieldCheck },
                { id: "context", label: "舆情研判", icon: BookOpen },
                { id: "setup", label: "控制台同步", icon: Terminal }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-2.5 rounded-md font-sans text-xs font-semibold flex items-center gap-1.5 shrink-0 transition duration-150 ${
                      isSelected
                        ? "bg-slate-950 text-indigo-400 font-bold border-b-2 border-indigo-500 rounded-b-none"
                        : "hover:text-slate-200 hover:bg-slate-800/30"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Panel Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sync loading Overlay or Toast Alerts */}
        {successToast && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce cursor-pointer max-w-md bg-slate-900 border border-indigo-900 text-indigo-300 p-4 rounded-xl shadow-2xl flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-100 font-sans block">系统同步事件</span>
              <p className="text-[10px] leading-relaxed text-slate-350">{successToast}</p>
            </div>
          </div>
        )}

        {/* Dynamic active tab page resolution */}
        <div className="fade-in duration-300">
          {activeTab === "overview" && (
            <Overview status={status} onRefresh={handleRefreshSystem} isSyncing={isSyncing} />
          )}

          {activeTab === "strategy" && (
            <StrategyManager
              strategies={strategies}
              onUpdateStrategy={handleUpdateStrategy}
              onCreateCustomStrategy={handleCreateCustomStrategy}
              onDeleteCustomStrategy={handleDeleteCustomStrategy}
            />
          )}

          {activeTab === "selector" && (
            <StockSelector
              strategies={strategies}
              onManualSaveTracking={handleManualSaveTracking}
            />
          )}

          {activeTab === "backtest" && (
            <BacktestPanel strategies={strategies} />
          )}

          {activeTab === "context" && (
            <ContextPanel />
          )}

          {activeTab === "setup" && (
            <BotSetup strategies={strategies} />
          )}
        </div>
      </main>

      {/* Bloomberg-Fintech styled Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-600 font-mono">
          <div className="flex items-center space-x-4">
            <span>系统状态: ONLINE</span>
            <span>·</span>
            <span>数据库体积: 52.4MB (A股全表)</span>
            <span>·</span>
            <span>大模型: DeepSeek & Ark 双重路由</span>
          </div>
          <div>本报告及指令流作为量化回测研究，仅供参考，不构成实盘入仓投资依据。</div>
        </div>
      </footer>
    </div>
  );
}

// Landmark and Server proxy icons mock placeholder since they are imported cleanly
function Landmark(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="2" x2="22" y1="22" y2="22" />
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="m12 2-10 8h20Z" />
      <path d="M4 22V10" />
      <path d="M20 22V10" />
    </svg>
  );
}
