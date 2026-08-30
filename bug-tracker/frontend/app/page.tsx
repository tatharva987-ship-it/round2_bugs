"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

export default function Home() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBugs() {
      try {
        const response = await fetch("http://127.0.0.1:8000/bugs");

        if (!response.ok) {
          throw new Error("Failed to fetch bugs");
        }

        const data = await response.json();
        setBugs(data);
      } catch (err) {
        console.error(err);
        setError("Could not load bugs from BugMind backend.");
      } finally {
        setLoading(false);
      }
    }

    loadBugs();
  }, []);

  const totalBugs = bugs.length;

  const openBugs = useMemo(
    () =>
      bugs.filter(
        (bug) =>
          bug.status.toLowerCase() !== "resolved" &&
          bug.status.toLowerCase() !== "closed"
      ).length,
    [bugs]
  );

  const criticalBugs = useMemo(
    () =>
      bugs.filter(
        (bug) => bug.severity.toLowerCase() === "critical"
      ).length,
    [bugs]
  );

  const resolvedBugs = useMemo(
    () =>
      bugs.filter(
        (bug) =>
          bug.status.toLowerCase() === "resolved" ||
          bug.status.toLowerCase() === "closed"
      ).length,
    [bugs]
  );

  const stats = [
    {
      title: "TOTAL BUGS",
      value: totalBugs,
      info: "FROM DATABASE",
      color: "green",
    },
    {
      title: "OPEN BUGS",
      value: openBugs,
      info: "NEEDS ATTENTION",
      color: "green",
    },
    {
      title: "CRITICAL",
      value: criticalBugs,
      info: "IMMEDIATE ACTION",
      color: "red",
    },
    {
      title: "RESOLVED",
      value: resolvedBugs,
      info: "COMPLETED ISSUES",
      color: "green",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-[#f5f5e8] flex font-mono">

      {/* SIDEBAR */}
      <aside className="w-64 min-h-screen bg-[#080808] border-r border-green-500/20 p-6 relative">

        <div>
          <h1 className="text-2xl font-black italic tracking-tight">
            BUGMIND
            <span className="text-[#39ff14]"> AI</span>
          </h1>

          <p className="text-[10px] mt-2 tracking-[0.25em] text-zinc-600">
            ISSUE INTELLIGENCE
          </p>
        </div>

        <nav className="mt-12 space-y-3">

          <div className="bg-[#39ff14]/10 border border-[#39ff14]/30 text-[#39ff14] px-4 py-3 rounded-lg font-bold">
            DASHBOARD
          </div>

          <Link
            href="/report"
            className="block px-4 py-3 rounded-lg text-zinc-400 hover:text-[#39ff14] hover:bg-[#39ff14]/5 transition"
          >
            REPORT BUG
          </Link>

          <div className="px-4 py-3 rounded-lg text-zinc-400 hover:text-white cursor-pointer">
            ALL BUGS
          </div>

          <div className="px-4 py-3 rounded-lg text-zinc-400 hover:text-white cursor-pointer">
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

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">

          <div>
            <p className="text-[11px] tracking-[0.3em] text-zinc-600">
              WORKSPACE / OVERVIEW
            </p>

            <h2 className="text-4xl font-black italic mt-2 tracking-tight">
              DASHBOARD<span className="text-[#39ff14]">_</span>
            </h2>
          </div>

          <Link
            href="/report"
            className="
              bg-[#39ff14]
              text-black
              font-black
              px-6
              py-3
              rounded-lg
              hover:bg-[#73ff59]
              transition
              shadow-[0_0_25px_rgba(57,255,20,0.2)]
            "
          >
            + REPORT BUG
          </Link>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-5">

          {stats.map((stat) => (
            <div
              key={stat.title}
              className="
                bg-[#0d0f10]
                border
                border-white/10
                rounded-xl
                p-6
                hover:border-[#39ff14]/30
                transition
              "
            >

              <p className="text-[11px] tracking-[0.2em] text-zinc-500">
                {stat.title}
              </p>

              <p
                className={`
                  text-5xl
                  font-black
                  italic
                  mt-3
                  ${
                    stat.color === "red"
                      ? "text-[#ff2929] drop-shadow-[0_0_10px_rgba(255,41,41,0.4)]"
                      : "text-[#39ff14] drop-shadow-[0_0_10px_rgba(57,255,20,0.35)]"
                  }
                `}
              >
                {stat.value}
              </p>

              <p className="text-[10px] text-zinc-600 mt-4 tracking-wide">
                {stat.info}
              </p>

            </div>
          ))}

        </div>

        {/* LOWER SECTION */}
        <div className="grid grid-cols-3 gap-6 mt-8">

          {/* RECENT BUGS */}
          <div className="col-span-2 bg-[#0d0f10] border border-white/10 rounded-xl p-7">

            <div className="flex justify-between items-center mb-7">

              <div>
                <h3 className="font-black italic tracking-wider">
                  RECENT BUGS
                </h3>

                <p className="text-xs text-zinc-600 mt-1">
                  LATEST REPORTED ISSUES
                </p>
              </div>

              <Link
                href="/bugs"
                className="text-xs text-[#39ff14] font-bold"
              >
                VIEW ALL →
              </Link>

            </div>

            {loading ? (
              <div className="py-12 text-center text-zinc-600 text-sm">
                LOADING BUGS...
              </div>
            ) : error ? (
              <div className="py-12 text-center text-[#ff2929] text-sm">
                {error}
              </div>
            ) : bugs.length === 0 ? (
              <div className="py-12 text-center text-zinc-600 text-sm">
                NO BUGS REPORTED YET.
              </div>
            ) : (
              <div className="space-y-2">

                {bugs.slice(0, 5).map((bug) => (
                  <div
                    key={bug.id}
                    className="
                      flex
                      items-center
                      justify-between
                      p-4
                      rounded-lg
                      hover:bg-white/[0.03]
                      border
                      border-transparent
                      hover:border-white/5
                      transition
                    "
                  >

                    <div>
                      <p className="text-[10px] text-zinc-600 tracking-widest">
                        BUG-{String(bug.id).padStart(3, "0")}
                      </p>

                      <p className="text-sm mt-1 font-semibold">
                        {bug.title}
                      </p>
                    </div>

                    <div className="flex gap-4 items-center">

                      <span
                        className={`text-[10px] font-black tracking-wider ${
                          bug.severity.toLowerCase() === "critical"
                            ? "text-[#ff2929]"
                            : bug.severity.toLowerCase() === "high"
                            ? "text-orange-400"
                            : "text-yellow-300"
                        }`}
                      >
                        {bug.severity.toUpperCase()}
                      </span>

                      <span className="text-[10px] px-3 py-1 rounded-full border border-white/10 text-zinc-300 bg-white/5">
                        {bug.status.toUpperCase()}
                      </span>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

          {/* AI INSIGHTS */}
          <div className="
            bg-[#0d0f10]
            border
            border-[#39ff14]/25
            rounded-xl
            p-7
            relative
            overflow-hidden
          ">

            <div className="absolute w-40 h-40 bg-[#39ff14]/5 blur-3xl -top-20 -right-20 rounded-full" />

            <div className="text-[#39ff14] text-2xl mb-4">
              ✦
            </div>

            <h3 className="font-black italic tracking-wide">
              AI INSIGHTS
            </h3>

            <p className="text-xs text-zinc-600 mt-2">
              BUGMIND ANALYZED CURRENT ISSUES
            </p>

            <div className="mt-7 space-y-5">

              <Insight
                title={`${criticalBugs} CRITICAL BUGS`}
                text="Issues requiring immediate attention."
                color="red"
              />

              <Insight
                title={`${openBugs} OPEN BUGS`}
                text="Active issues still awaiting resolution."
                color="green"
              />

              <Insight
                title={`${resolvedBugs} RESOLVED BUGS`}
                text="Issues that have been successfully completed."
                color="green"
              />

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

function Insight({
  title,
  text,
  color,
}: {
  title: string;
  text: string;
  color: "green" | "red";
}) {
  return (
    <div className="border-b border-white/5 pb-5">

      <p
        className={`text-xs font-bold ${
          color === "red"
            ? "text-[#ff2929]"
            : "text-[#39ff14]"
        }`}
      >
        {title}
      </p>

      <p className="text-[11px] text-zinc-600 mt-2">
        {text}
      </p>

    </div>
  );
}