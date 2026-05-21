import React, { useState } from "react";
import { StrategyConfig } from "../types";
import { Terminal, Copy, Check, ShieldAlert, Cpu, HeartHandshake, Database, HelpCircle, HardDrive } from "lucide-react";

interface BotSetupProps {
  strategies: StrategyConfig[];
}

export const BotSetup: React.FC<BotSetupProps> = ({ strategies }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getSyncJson = () => {
    const configExport: any = {};
    strategies.forEach((strat) => {
      configExport[strat.id] = {
        enabled: strat.enabled,
        params: strat.params,
        manual_factors_count: strat.manual_factors.length,
      };
    });
    return JSON.stringify({ system_sync_configs: configExport }, null, 2);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="bot-setup-component">
      {/* Script Copy Command Center */}
      <div className="xl:col-span-8 space-y-6">
        {/* CLI copy scripts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
              本量化工程核心控制台指令 (A-Share CLI commands)
            </h3>
          </div>
          <p className="text-[11px] text-slate-400">
            当您在本地 Windows 环境调试机器人时，请使用以下已经过P0安全强固检验的 PowerShell 脚本或 Python 入口。
          </p>

          <div className="space-y-3.5">
            {[
              {
                title: "1. 运行全市场量化大选股 (发送至 Telegram)",
                cmd: "python final_all_markets_analysis.py --send",
                desc: "运行多维度大选股并生成本地JSON和Markdown，随后递送给 Long Big 唯一 ID 群。"
              },
              {
                title: "2. 校验本地 SQLite 行情及补齐情况",
                cmd: "python scripts\\sync_data.py --status",
                desc: "显示最新日线、估值、分红权重(adj_factor)以及主力资金(moneyflow)的断点空缺列表。"
              },
              {
                title: "3. 手动强制补齐特定交易日行情 (如2026/05/20)",
                cmd: "python scripts\\sync_data.py --fill-date 20260520",
                desc: "将自动判断缺失字段数并拉取 Tushare Pro 增量合并，保障 SQLite 日线主行情单向注入。"
              },
              {
                title: "4. 进行高回撤相似因素深度优化回测",
                cmd: "python scripts\\backtest_recommendations.py --strategy limit_up_momentum --trade-date 20260401 --top 10",
                desc: "执行单日前 10 名持股期分层追踪，分类统计并输出 rule_patch_candidates."
              }
            ].map((shell, ix) => (
              <div key={ix} className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-350">{shell.title}</span>
                  <button
                    onClick={() => handleCopy(shell.cmd, `shell_${ix}`)}
                    className="p-1 text-slate-500 hover:text-slate-300 transition"
                    title="复制指令"
                  >
                    {copiedId === `shell_${ix}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto select-all">
                  {shell.cmd}
                </div>
                <div className="text-[10px] text-slate-500 font-sans leading-relaxed">{shell.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Windows startup and backup schedulers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
              Windows 守护进程与 SQLite 自动多世代备份
            </h3>
          </div>
          <p className="text-[11px] text-slate-400">
            配合您的 NSSM 服务及任务计划程序，您可以利用以下已经通过测试的 PowerShell 脚本组件，将机器人设为 Windows 启动常开，且每日凌晨两点做容灾热备份。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Startup script */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-2.5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-200">A. 进程断线自重启守护</span>
                  <p className="text-[9px] text-slate-500">start_telegram_bot.ps1</p>
                </div>
                <button
                  onClick={() => handleCopy(`powershell -ExecutionPolicy Bypass -File scripts\\windows\\start_telegram_bot.ps1`, "w_startup")}
                  className="p-1 text-slate-500 hover:text-slate-300 transition"
                >
                  {copiedId === "w_startup" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                当 httpx 或 SSL 发生断线时，通过检测 Telegram 挂起状态，在10分钟未收到心跳的情况下自杀重启，保证24/7运作。
              </p>
              <div className="bg-slate-900 p-2 rounded text-[10px] font-mono text-indigo-300 overflow-x-auto truncate">
                powershell -ExecutionPolicy Bypass -File scripts\windows\start_telegram_bot.ps1
              </div>
            </div>

            {/* Backup script */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-2.5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-200">B. 数据库 02:30 多世代备份</span>
                  <p className="text-[9px] text-slate-500">backup_sqlite.ps1</p>
                </div>
                <button
                  onClick={() => handleCopy(`powershell -ExecutionPolicy Bypass -File scripts\\windows\\backup_sqlite.ps1`, "w_backup")}
                  className="p-1 text-slate-500 hover:text-slate-200 transition"
                >
                  {copiedId === "w_backup" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                每天非交易日自动将 `stock_database.db` 拷贝并加盖时间戳后存档于 `D:/ai/gu_backups`，保证数据不被误写和崩溃。
              </p>
              <div className="bg-slate-900 p-2 rounded text-[10px] font-mono text-indigo-300 overflow-x-auto truncate">
                powershell -ExecutionPolicy Bypass -File scripts\windows\backup_sqlite.ps1
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyable strategy JSON config sync sidebar (right) */}
      <div className="xl:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Database className="w-5 h-5 text-indigo-400" />
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase">
                参数对齐同步池 (Config.json)
              </h3>
              <p className="text-[9px] text-slate-500">可同步拷贝到本地配置文件。</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            当您在此控制台修改了策略的高、低低段阀值及因子偏重，该窗口能够直接将改动动态渲染成标准的 JSON
            格式。您可以点击“全选复制”，覆盖您在本地 Windows 的 `config.json` 即可直接将同步带入机器人后续的大规模选股！
          </p>

          <pre className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-[10px] font-mono text-indigo-300 overflow-x-auto max-h-80 select-all leading-normal">
            {getSyncJson()}
          </pre>
        </div>

        <button
          onClick={() => handleCopy(getSyncJson(), "json_config_sync")}
          className="w-full py-2 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow"
        >
          {copiedId === "json_config_sync" ? (
            <>
              <Check className="w-4 h-4 text-emerald-400 animate-pulse" />
              已复制到系统剪切板！
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              全选复制配置 JSON 码
            </>
          )}
        </button>
      </div>
    </div>
  );
};
