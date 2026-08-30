"use client";

import Link from "next/link";
import { useState } from "react";
import { API_BASE_URL } from "../../lib/api";

type DuplicateBug = {
  id: number;
  title: string;
  severity: string;
  priority: string;
  status: string;
  similarity: number;
};

type Analysis = {
  id: number;
  title: string;
  description: string;
  expected: string;
  actual: string;
  severity: string;
  priority: string;
  category: string;

  reproduction_steps: string[];
  root_cause: string;
  suggested_fix: string;
  test_cases: string[];

  status: string;
  created_at: string;

  possible_duplicates: DuplicateBug[];
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
      const response = await fetch(
        `${API_BASE_URL}/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description,
            expected,
            actual,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Backend request failed"
        );
      }

      const data = await response.json();

      setAnalysis({
        ...data,
        possible_duplicates:
          data.possible_duplicates || [],
        reproduction_steps:
          data.reproduction_steps || [],
        test_cases:
          data.test_cases || [],
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to BugMind backend."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-10 font-mono">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
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

          {/* ==================================================
              BUG FORM
              ================================================== */}
          <div className="bg-[#0d0f10] border border-white/10 rounded-xl p-7">

            <label className="text-xs text-zinc-500">
              DESCRIBE THE BUG
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: Checkout crashes when address is empty..."
              className="
                w-full
                h-36
                mt-3
                bg-black
                border
                border-white/10
                rounded-lg
                p-4
                outline-none
                focus:border-[#39ff14]
                resize-none
              "
            />

            <label className="block text-xs text-zinc-500 mt-6">
              EXPECTED RESULT
            </label>

            <input
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              placeholder="What should have happened?"
              className="
                w-full
                mt-3
                bg-black
                border
                border-white/10
                rounded-lg
                p-4
                outline-none
                focus:border-[#39ff14]
              "
            />

            <label className="block text-xs text-zinc-500 mt-6">
              ACTUAL RESULT
            </label>

            <input
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="What actually happened?"
              className="
                w-full
                mt-3
                bg-black
                border
                border-white/10
                rounded-lg
                p-4
                outline-none
                focus:border-[#ff2929]
              "
            />

            <label className="block text-xs text-zinc-500 mt-6">
              SCREENSHOT
            </label>

            <input
              type="file"
              className="mt-3 text-xs text-zinc-400"
            />

            {error && (
              <div className="
                mt-5
                border
                border-[#ff2929]/30
                bg-[#ff2929]/5
                rounded-lg
                p-4
              ">
                <p className="text-[#ff2929] text-xs">
                  {error}
                </p>
              </div>
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

            {analysis && (
              <div className="
                mt-5
                text-[10px]
                text-zinc-600
                flex
                justify-between
              ">
                <span>
                  BUG-{String(analysis.id).padStart(3, "0")}
                </span>

                <span>
                  SAVED TO DATABASE
                </span>
              </div>
            )}

          </div>


          {/* ==================================================
              AI ANALYSIS
              ================================================== */}
          <div className="bg-[#0d0f10] border border-[#39ff14]/20 rounded-xl p-7">

            <p className="text-[#39ff14] text-2xl">
              ✦
            </p>

            <h2 className="font-black italic text-xl mt-3">
              AI ANALYSIS
            </h2>

            {!analysis ? (

              <div className="h-[500px] flex items-center justify-center text-center">

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

              <div className="mt-8 space-y-6">

                {/* BASIC TRIAGE */}
                <Result
                  label="TITLE"
                  value={analysis.title}
                />

                <Result
                  label="SEVERITY"
                  value={analysis.severity}
                  red={
                    analysis.severity.toLowerCase() === "critical" ||
                    analysis.severity.toLowerCase() === "high"
                  }
                />

                <Result
                  label="PRIORITY"
                  value={analysis.priority}
                />

                <Result
                  label="CATEGORY"
                  value={analysis.category}
                />

                {/* ROOT CAUSE */}
                <Result
                  label="POSSIBLE ROOT CAUSE"
                  value={analysis.root_cause}
                />

                {/* SUGGESTED FIX */}
                <Result
                  label="SUGGESTED FIX"
                  value={
                    analysis.suggested_fix ||
                    "No suggested fix available."
                  }
                />

                {/* REPRODUCTION STEPS */}
                <ListResult
                  label="REPRODUCTION STEPS"
                  items={analysis.reproduction_steps}
                />

                {/* TEST CASES */}
                <ListResult
                  label="AI-GENERATED TEST CASES"
                  items={analysis.test_cases}
                />

                {/* DUPLICATES */}
                <DuplicateSection
                  duplicates={analysis.possible_duplicates}
                />

              </div>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}


/* ============================================================
   TEXT RESULT
   ============================================================ */

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
    <div className="border-b border-white/5 pb-5">

      <p className="text-[10px] tracking-widest text-zinc-600">
        {label}
      </p>

      <p
        className={`text-sm font-bold mt-2 leading-6 ${
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


/* ============================================================
   LIST RESULT
   ============================================================ */

function ListResult({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <div className="border-b border-white/5 pb-5">

      <p className="text-[10px] tracking-widest text-zinc-600">
        {label}
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-600 mt-3">
          No information available.
        </p>
      ) : (
        <div className="mt-3 space-y-3">

          {items.map((item, index) => (
            <div
              key={index}
              className="flex gap-3"
            >
              <span className="text-[#39ff14] text-xs font-black">
                {index + 1}.
              </span>

              <p className="text-sm text-zinc-300 leading-6">
                {item}
              </p>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}


/* ============================================================
   DUPLICATE DETECTION
   ============================================================ */

function DuplicateSection({
  duplicates,
}: {
  duplicates: DuplicateBug[];
}) {
  if (duplicates.length === 0) {
    return (
      <div className="
        border
        border-[#39ff14]/20
        bg-[#39ff14]/5
        rounded-lg
        p-5
      ">

        <p className="text-[10px] tracking-widest text-[#39ff14]">
          DUPLICATE CHECK
        </p>

        <p className="text-sm font-bold mt-2">
          ✓ NO LIKELY DUPLICATES FOUND
        </p>

        <p className="text-xs text-zinc-600 mt-2">
          No existing issues passed the similarity threshold.
        </p>

      </div>
    );
  }

  return (
    <div className="
      border
      border-yellow-400/30
      bg-yellow-400/5
      rounded-lg
      p-5
    ">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-[10px] tracking-widest text-yellow-400">
            ⚠ POSSIBLE DUPLICATES
          </p>

          <p className="text-sm font-black mt-2">
            EXISTING ISSUES MAY MATCH THIS BUG
          </p>
        </div>

        <span className="text-yellow-400 text-xl">
          !
        </span>

      </div>

      <div className="mt-5 space-y-3">

        {duplicates.map((duplicate) => (
          <Link
            key={duplicate.id}
            href={`/bugs/${duplicate.id}`}
            className="
              block
              bg-black/40
              border
              border-white/5
              rounded-lg
              p-4
              hover:border-yellow-400/30
              transition
            "
          >

            <div className="flex justify-between gap-4">

              <div>
                <p className="text-[10px] text-zinc-600 tracking-widest">
                  BUG-{String(duplicate.id).padStart(3, "0")}
                </p>

                <p className="text-sm font-bold mt-1">
                  {duplicate.title}
                </p>
              </div>

              <div className="text-right shrink-0">

                <p className="text-yellow-400 font-black text-sm">
                  {duplicate.similarity}%
                </p>

                <p className="text-[9px] text-zinc-600">
                  SIMILAR
                </p>

              </div>

            </div>

            <div className="flex gap-4 mt-3 text-[10px]">

              <span className="text-zinc-500">
                {duplicate.severity.toUpperCase()}
              </span>

              <span className="text-zinc-500">
                {duplicate.priority}
              </span>

              <span className="text-zinc-500">
                {duplicate.status.toUpperCase()}
              </span>

            </div>

          </Link>
        ))}

      </div>

    </div>
  );
}