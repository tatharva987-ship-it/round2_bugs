"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../lib/api";

type Bug = {
  id: number;
  title: string;
  description: string;
  severity: string;
  priority: string;
  category: string;
  status: string;
  created_at: string;
};

export default function BugsPage() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  async function loadBugs() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/bugs`);

      if (!response.ok) {
        throw new Error("Failed to fetch bugs");
      }

      const data = await response.json();
      setBugs(data);
    } catch (err) {
      console.error(err);
      setError("Could not load bugs from the BugMind backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBugs();
  }, []);

  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        bug.title.toLowerCase().includes(query) ||
        bug.description.toLowerCase().includes(query) ||
        bug.category.toLowerCase().includes(query);

      const matchesSeverity =
        severityFilter === "ALL" ||
        bug.severity.toUpperCase() === severityFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        bug.status.toUpperCase() === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [bugs, search, severityFilter, statusFilter]);

  return (
    <main className="min-h-screen bg-black text-[#f5f5e8] flex font-mono">

      {/* SIDEBAR */}
      <aside className="w-64 min-h-screen bg-[#080808] border-r border-green-500/20 p-6 relative">

        <div>
          <Link href="/" className="text-2xl font-black italic tracking-tight">
            BUGMIND<span className="text-[#39ff14]"> AI</span>
          </Link>

          <p className="text-[10px] mt-2 tracking-[0.25em] text-zinc-600">
            ISSUE INTELLIGENCE
          </p>
        </div>

        <nav className="mt-12 space-y-3">

          <Link
            href="/"
            className="block px-4 py-3 rounded-lg text-zinc-400 hover:text-[#39ff14] hover:bg-[#39ff14]/5 transition"
          >
            DASHBOARD
          </Link>

          <Link
            href="/report"
            className="block px-4 py-3 rounded-lg text-zinc-400 hover:text-[#39ff14] hover:bg-[#39ff14]/5 transition"
          >
            REPORT BUG
          </Link>

          <div className="bg-[#39ff14]/10 border border-[#39ff14]/30 text-[#39ff14] px-4 py-3 rounded-lg font-bold">
            ALL BUGS
          </div>

          <div className="px-4 py-3 rounded-lg text-zinc-400">
            AI INSIGHTS
          </div>

        </nav>

        <div className="absolute bottom-8">
          <p className="text-[10px] tracking-widest text-zinc-600">
            CLONEFEST 2.0
          </p>

          <p className="text-[10px] text-[#39ff14] mt-2">
            ● SYSTEM ONLINE
          </p>
        </div>

      </aside>

      {/* MAIN */}
      <section className="flex-1 p-10">

        <div className="flex justify-between items-start mb-10">

          <div>
            <p className="text-[11px] tracking-[0.3em] text-zinc-600">
              WORKSPACE / ISSUES
            </p>

            <h1 className="text-4xl font-black italic mt-2">
              ALL BUGS<span className="text-[#39ff14]">_</span>
            </h1>

            <p className="text-sm text-zinc-600 mt-3">
              Browse, filter and investigate reported issues.
            </p>
          </div>

          <Link
            href="/report"
            className="bg-[#39ff14] text-black font-black px-6 py-3 rounded-lg hover:bg-[#70ff59] transition"
          >
            + REPORT BUG
          </Link>

        </div>

        {/* FILTER BAR */}
        <div className="bg-[#0d0f10] border border-white/10 rounded-xl p-5 mb-6">

          <div className="grid grid-cols-3 gap-4">

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bugs..."
              className="
                bg-black
                border
                border-white/10
                rounded-lg
                px-4
                py-3
                text-sm
                outline-none
                focus:border-[#39ff14]
              "
            />

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="
                bg-black
                border
                border-white/10
                rounded-lg
                px-4
                py-3
                text-sm
                outline-none
                focus:border-[#39ff14]
              "
            >
              <option value="ALL">ALL SEVERITIES</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="
                bg-black
                border
                border-white/10
                rounded-lg
                px-4
                py-3
                text-sm
                outline-none
                focus:border-[#39ff14]
              "
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="REPORTED">REPORTED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="TESTING">TESTING</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>

          </div>

        </div>

        {/* RESULTS */}
        <div className="bg-[#0d0f10] border border-white/10 rounded-xl overflow-hidden">

          <div className="px-6 py-5 border-b border-white/10 flex justify-between">
            <div>
              <h2 className="font-black italic tracking-wide">
                ISSUES
              </h2>

              <p className="text-xs text-zinc-600 mt-1">
                {filteredBugs.length} MATCHING BUGS
              </p>
            </div>

            <button
              onClick={loadBugs}
              className="text-xs text-[#39ff14] font-bold hover:text-white"
            >
              ↻ REFRESH
            </button>
          </div>

          {loading ? (
            <div className="p-16 text-center text-zinc-600">
              LOADING BUGS...
            </div>
          ) : error ? (
            <div className="p-16 text-center text-[#ff2929]">
              {error}
            </div>
          ) : filteredBugs.length === 0 ? (
            <div className="p-16 text-center text-zinc-600">
              NO BUGS MATCH YOUR FILTERS.
            </div>
          ) : (
            <div>
              {filteredBugs.map((bug) => (
                <Link
                  key={bug.id}
                  href={`/bugs/${bug.id}`}
                  className="
                    block
                    px-6
                    py-5
                    border-b
                    border-white/5
                    hover:bg-white/[0.03]
                    transition
                  "
                >

                  <div className="flex items-center justify-between gap-6">

                    <div className="min-w-0">

                      <div className="flex items-center gap-3">

                        <span className="text-[10px] text-zinc-600 tracking-widest">
                          BUG-{String(bug.id).padStart(3, "0")}
                        </span>

                        <span className="text-[10px] text-zinc-700">
                          •
                        </span>

                        <span className="text-[10px] text-zinc-500">
                          {bug.category}
                        </span>

                      </div>

                      <h3 className="text-sm font-bold mt-2">
                        {bug.title}
                      </h3>

                      <p className="text-xs text-zinc-600 mt-2 truncate max-w-2xl">
                        {bug.description}
                      </p>

                    </div>

                    <div className="flex items-center gap-4 shrink-0">

                      <span
                        className={`text-[10px] font-black ${
                          bug.severity.toLowerCase() === "critical"
                            ? "text-[#ff2929]"
                            : bug.severity.toLowerCase() === "high"
                            ? "text-orange-400"
                            : bug.severity.toLowerCase() === "medium"
                            ? "text-yellow-300"
                            : "text-zinc-400"
                        }`}
                      >
                        {bug.severity.toUpperCase()}
                      </span>

                      <span className="text-[10px] px-3 py-1 rounded-full border border-white/10 text-zinc-300">
                        {bug.status.toUpperCase()}
                      </span>

                      <span className="text-[10px] text-zinc-500">
                        {bug.priority}
                      </span>

                      <span className="text-zinc-600">
                        →
                      </span>

                    </div>

                  </div>

                </Link>
              ))}
            </div>
          )}

        </div>

      </section>

    </main>
  );
}

