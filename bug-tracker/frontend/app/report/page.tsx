"use client";

import Link from "next/link";
import { useState } from "react";

type Analysis = {
  title: string;
  severity: string;
  priority: string;
  category: string;
  root_cause: string;
  suggested_test: string;
};

export default function ReportBug() {
  const [description, setDescription] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeBug() {
    if (!description.trim()) {
      setError("Please describe the bug first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          description,
          expected,
          actual,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      setAnalysis(data);
    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to BugMind backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-10 font-mono">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] text-zinc-600">
              BUGMIND / NEW ISSUE
            </p>

            <h1 className="text-4xl font-black italic mt-2">
              REPORT BUG
              <span className="text-[#39ff14]">_</span>
            </h1>
          </div>

          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-[#39ff14]"
          >
            ← DASHBOARD
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-8">

          {/* BUG FORM */}
          <div className="bg-[#0d0f10] border border-white/10 rounded-xl p-7">

            <label className="text-xs text-zinc-500">
              DESCRIBE THE BUG
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: Checkout crashes when address is empty..."
              className="w-full h-36 mt-3 bg-black border border-white/10 rounded-lg p-4 outline-none focus:border-[#39ff14] resize-none"
            />

            <label className="block text-xs text-zinc-500 mt-6">
              EXPECTED RESULT
            </label>

            <input
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              placeholder="What should have happened?"
              className="w-full mt-3 bg-black border border-white/10 rounded-lg p-4 outline-none focus:border-[#39ff14]"
            />

            <label className="block text-xs text-zinc-500 mt-6">
              ACTUAL RESULT
            </label>

            <input
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="What actually happened?"
              className="w-full mt-3 bg-black border border-white/10 rounded-lg p-4 outline-none focus:border-[#ff2929]"
            />

            <label className="block text-xs text-zinc-500 mt-6">
              SCREENSHOT
            </label>

            <input
              type="file"
              className="mt-3 text-xs text-zinc-400"
            />

            {error && (
              <p className="text-[#ff2929] text-xs mt-5">
                {error}
              </p>
            )}

            <button
              onClick={analyzeBug}
              disabled={loading}
              className="
                w-full
                mt-8
                bg-[#39ff14]
                text-black
                font-black
                py-4
                rounded-lg
                hover:bg-[#70ff59]
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition
              "
            >
              {loading
                ? "ANALYZING..."
                : "✦ ANALYZE WITH AI"}
            </button>

          </div>

          {/* AI PANEL */}
          <div className="bg-[#0d0f10] border border-[#39ff14]/20 rounded-xl p-7">

            <p className="text-[#39ff14] text-2xl">
              ✦
            </p>

            <h2 className="font-black italic text-xl mt-3">
              AI ANALYSIS
            </h2>

            {!analysis ? (
              <div className="h-80 flex items-center justify-center text-center">

                <div>
                  <p className="text-zinc-600">
                    {loading
                      ? "ANALYZING BUG..."
                      : "WAITING FOR BUG DATA..."}
                  </p>

                  <p className="text-zinc-700 text-xs mt-2">
                    BugMind will structure and analyze your issue.
                  </p>
                </div>

              </div>
            ) : (
              <div className="mt-8 space-y-5">

                <Result
                  label="TITLE"
                  value={analysis.title}
                />

                <Result
                  label="SEVERITY"
                  value={analysis.severity}
                  red
                />

                <Result
                  label="PRIORITY"
                  value={analysis.priority}
                />

                <Result
                  label="CATEGORY"
                  value={analysis.category}
                />

                <Result
                  label="POSSIBLE ROOT CAUSE"
                  value={analysis.root_cause}
                />

                <Result
                  label="SUGGESTED TEST"
                  value={analysis.suggested_test}
                />

              </div>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}

function Result({
  label,
  value,
  red = false,
}: {
  label: string;
  value: string;
  red?: boolean;
}) {
  return (
    <div className="border-b border-white/5 pb-4">

      <p className="text-[10px] tracking-widest text-zinc-600">
        {label}
      </p>

      <p
        className={`text-sm font-bold mt-2 ${
          red
            ? "text-[#ff2929]"
            : "text-[#39ff14]"
        }`}
      >
        {value}
      </p>

    </div>
  );
}