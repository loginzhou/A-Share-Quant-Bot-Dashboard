import React, { useState } from "react";
import { MOCK_CONTEXT_NEWS } from "../mockData";
import { ExternalContext } from "../types";
import { Filter, Calendar, BookOpen, Trash2, ArrowUpRight, Search, FileX, RefreshCw } from "lucide-react";

export const ContextPanel: React.FC = () => {
  const [news, setNews] = useState<ExternalContext[]>(MOCK_CONTEXT_NEWS);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [cleanResult, setCleanResult] = useState<string>("");

  const handleCleanContext = () => {
    setIsCleaning(true);
    setCleanResult("");

    setTimeout(() => {
      // Filter out news with uncaught code "000000.SZ" (unmatched)
      const validNews = news.filter((item) => item.ts_code !== "000000.SZ" && item.relevance_score >= 50);
      const cleanedCount = news.length - validNews.length;

      setNews(validNews);
      setIsCleaning(false);
      setCleanResult(`成功删除 ${cleanedCount} 条无匹配股票或无关资讯缓存，保持 SQLite 资讯层纯净度。`);
    }, 1200);
  };

  const getCategoryTheme = (category: string) => {
    if (category === "风险公告") return "bg-rose-950/50 text-rose-450 border-rose-900";
    if (category === "利好待证实") return "bg-emerald-950/60 text-emerald-400 border-emerald-900";
    if (category === "普通资讯") return "bg-indigo-950/50 text-indigo-400 border-indigo-900";
    return "bg-slate-950 text-slate-400 border-slate-900";
  };

  const filteredNews = news.filter((item) => {
    const matchesCategory = filter === "all" ? true : item.category === filter;
    const matchesSearch =
      item.stock_name.includes(search) ||
      item.ts_code.includes(search) ||
      item.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6" id="context-panel-component">
      {/* Search Header Row */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Text Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜索股票、代码或研判标题..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-full"
            />
          </div>

          {/* Category Select */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-xs font-mono">
            {[
              { id: "all", label: "全部" },
              { id: "利好待证实", label: "利好" },
              { id: "普通资讯", label: "常规" },
              { id: "风险公告", label: "风险" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  filter === cat.id ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Context Button */}
        <button
          onClick={handleCleanContext}
          disabled={isCleaning}
          className="w-full md:w-auto px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 disabled:opacity-40 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          {isCleaning ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          ) : (
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          )}
          清理无关资讯(Clean Context)
        </button>
      </div>

      {cleanResult && (
        <div className="bg-emerald-950/60 border border-emerald-900 text-emerald-400 p-3 rounded-lg text-xs font-medium font-sans">
          {cleanResult}
        </div>
      )}

      {/* Scraped context details list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.length === 0 ? (
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-12 text-center rounded-xl text-slate-600 flex flex-col items-center justify-center space-y-2">
            <FileX className="w-8 h-8 text-slate-700" />
            <p className="text-xs">无当前资讯或因刚才已被匹配过滤干掉。</p>
          </div>
        ) : (
          filteredNews.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-4 hover:border-slate-700 transition duration-250"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-slate-200">{item.stock_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.ts_code}</span>
                    </div>
                    {/* Relevance badge */}
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                      <span>{item.source}</span>
                      <span>·</span>
                      <span className="text-indigo-400">相关置信度 {item.relevance_score}%</span>
                    </div>
                  </div>
                  {/* Category badg */}
                  <span className={`text-[10px] border px-2 py-0.5 rounded-full font-mono ${getCategoryTheme(item.category)}`}>
                    {item.category}
                  </span>
                </div>

                {/* Article title */}
                <h4 className="text-xs font-bold text-slate-100 flex items-start gap-1 justify-between leading-snug">
                  <span>{item.title}</span>
                  <a
                    href={item.url}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="text-slate-500 hover:text-indigo-400 shrink-0 mt-0.5"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </h4>

                {/* Scraped summary */}
                <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                  {item.summary}
                </p>
              </div>

              {/* Timestamp footer code */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-3 border-t border-slate-800/40">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>采集时间: {item.date}</span>
                </div>
                <span>低权重资讯依据</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
