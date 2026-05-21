import React, { useState } from "react";
import { MOCK_SYSTEM_STATUS, MOCK_BOT_LOGS } from "../mockData";
import { SystemStatus } from "../types";
import { Server, Terminal, Shield, RefreshCw, Cpu, Activity, Play, AlertTriangle } from "lucide-react";

interface OverviewProps {
  status: SystemStatus;
  onRefresh: () => void;
  isSyncing: boolean;
}

export const Overview: React.FC<OverviewProps> = ({ status, onRefresh, isSyncing }) => {
  const [logs, setLogs] = useState<string[]>(MOCK_BOT_LOGS);
  const [logFilter, setLogFilter] = useState<"all" | "info" | "error" | "warn">("all");

  const filterLogs = (list: string[]) => {
    if (logFilter === "all") return list;
    return list.filter((log) => {
      const lower = log.toLowerCase();
      if (logFilter === "error") return lower.includes("error") || lower.includes("fail") || lower.includes("traceback");
      if (logFilter === "warn") return lower.includes("warning") || lower.includes("skip");
      if (logFilter === "info") return lower.includes("info") && !lower.includes("error") && !lower.includes("warning");
      return true;
    });
  };

  const clearLogsConsole = () => {
    setLogs([]);
  };

  const simulateTriggerSync = () => {
    onRefresh();
    // Simulate prepending a new audit log
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setLogs((prev) => [
      `${now} - core.data_sync_service - INFO - Manual sync triggered from web dashboard. Checking Tushare availability...`,
      `${now} - core.data_sync_service - INFO - Handshake validated. Tushare basic rate limit checked (0.12s loop).`,
      ...prev
    ]);
  };

  return (
    <div className="space-y-6" id="overview-component">
      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Database Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start space-x-3 shadow-lg duration-300 hover:border-slate-700">
          <div className="p-3 rounded-lg bg-emerald-950 text-emerald-400">
            <Server className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">最新交易日</p>
            <h3 className="text-xl font-bold text-slate-100 font-sans tracking-tight">{status.latest_trade_date}</h3>
            <p className="text-[10px] text-slate-500 font-mono">
              包含股票: <span className="text-emerald-400">{status.total_stocks} 只</span>
            </p>
          </div>
        </div>

        {/* Database Rows Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start space-x-3 shadow-lg duration-300 hover:border-slate-700">
          <div className="p-3 rounded-lg bg-indigo-950 text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">本地行情汇总</p>
            <h3 className="text-xl font-bold text-slate-100 font-sans tracking-tight">
              {status.daily_data_records.toLocaleString()} 行
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              估值数据: <span className="text-indigo-400">{status.daily_basic_records.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Sync Audits */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start space-x-3 shadow-lg duration-300 hover:border-slate-700">
          <div className="p-3 rounded-lg bg-cyan-950 text-cyan-400">
            <RefreshCw className={`w-5 h-5 ${isSyncing ? "animate-spin" : ""}`} />
          </div>
          <div className="space-y-1 w-full">
            <p className="text-xs text-slate-400 font-medium">数据轮询尝试</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-bold text-slate-100 font-sans tracking-tight">
                {status.sync_attempts_today} 次/日
              </h3>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 font-mono px-1.5 py-0.5 rounded">
                成功 {status.sync_success_rate}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono truncate">
              最近: {status.last_sync_time.split(" ")[1]}
            </p>
          </div>
        </div>

        {/* LLM Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start space-x-3 shadow-lg duration-300 hover:border-slate-700">
          <div className="p-3 rounded-lg bg-purple-950 text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="space-y-1 w-full">
            <p className="text-xs text-slate-400 font-medium">大模型算力 (Ark)</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-bold text-slate-200 truncate pr-1">ark-code-latest</h3>
              <span className="text-[10px] bg-purple-950 text-purple-300 font-mono px-1 py-0.5 rounded capitalize">
                {status.llm_status}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono truncate">AI备注/时机诊断已就绪</p>
          </div>
        </div>
      </div>

      {/* Bot Watchdog and Supervisors Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              本地守护进程联机正常 (Stable Watchdog Active)
            </h4>
            <p className="text-xs text-slate-400 max-w-2xl">
              守护程序正在监控本地 16:30, 17:30, 19:00 和 20:00 的 Tushare 数据同步和推荐池自检。
              网络证书链 `SSL_VERIFY` 已调和，未消耗挂起队列状态良好。
            </p>
          </div>
        </div>
        <div className="flex space-x-2 w-full md:w-auto shrink-0 justify-end">
          <button
            onClick={simulateTriggerSync}
            disabled={isSyncing}
            className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-sans text-xs font-semibold rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition duration-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            一键同步最新交易日
          </button>
        </div>
      </div>

      {/* Interactive Logs Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Console Header */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-300 font-mono tracking-wide uppercase">
              诊断终端与日志探针 (Watchdog Console)
            </h3>
          </div>
          {/* Logs Filter Filters */}
          <div className="flex items-center space-x-2 self-end">
            <div className="bg-slate-900 border border-slate-800 p-0.5 rounded-lg flex space-x-1 text-[10px] font-mono">
              <button
                onClick={() => setLogFilter("all")}
                className={`px-2 py-0.5 rounded ${logFilter === "all" ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200"}`}
              >
                全部
              </button>
              <button
                onClick={() => setLogFilter("info")}
                className={`px-2 py-0.5 rounded ${logFilter === "info" ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200"}`}
              >
                消息
              </button>
              <button
                onClick={() => setLogFilter("warn")}
                className={`px-2 py-0.5 rounded ${logFilter === "warn" ? "bg-slate-800 text-yellow-400" : "text-slate-400 hover:text-slate-200"}`}
              >
                警告
              </button>
              <button
                onClick={() => setLogFilter("error")}
                className={`px-2 py-0.5 rounded ${logFilter === "error" ? "bg-slate-800 text-red-400" : "text-slate-400 hover:text-slate-200"}`}
              >
                异常
              </button>
            </div>
            <button
              onClick={clearLogsConsole}
              className="text-[10px] text-slate-500 hover:text-slate-300 font-mono px-2 py-1 border border-slate-800 rounded hover:bg-slate-800 transition"
            >
              清空
            </button>
          </div>
        </div>

        {/* Logs Terminal Area */}
        <div className="p-4 bg-slate-950 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950">
          {filterLogs(logs).length === 0 ? (
            <div className="py-8 text-center text-slate-600">控制台日志无当前记录</div>
          ) : (
            filterLogs(logs).map((log, i) => {
              const isError = log.includes("ERROR") || log.includes("Exception") || log.includes("NameError");
              const isWarning = log.includes("WARNING");
              const isAudit = log.includes("background collection finished") || log.includes("daily_market_sync_loop");

              let rowClass = "text-slate-400";
              if (isError) rowClass = "text-rose-400 bg-rose-950/20 px-1 py-0.5 rounded border border-rose-950/40";
              else if (isWarning) rowClass = "text-amber-400 bg-amber-950/10 px-1 py-0.5 rounded";
              else if (isAudit) rowClass = "text-emerald-400 font-semibold";

              return (
                <div key={i} className={`leading-relaxed whitespace-pre-wrap ${rowClass}`}>
                  {log}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
