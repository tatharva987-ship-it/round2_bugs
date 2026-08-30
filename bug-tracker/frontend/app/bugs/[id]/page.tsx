"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Bug = {
  id: number;
  title: string;
  description: string;
  expected: string;
  actual: string;
  severity: string;
  priority: string;
  category: string;
  reproduction_steps: string[] | null;
  root_cause: string;
  suggested_fix: string | null;
  test_cases: string[] | null;
  status: string;
  assignee: string | null;
  created_at: string;
};

type HistoryEvent = {
  id: number;
  actor: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
};

const STATUSES = [
  "Reported",
  "Assigned",
  "In Progress",
  "Testing",
  "Resolved",
  "Closed",
];

export default function BugDetails() {
  const params = useParams();
  const id = params.id;

  const [bug, setBug] = useState<Bug | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [status, setStatus] = useState("");
  const [assignee, setAssignee] = useState("");

  async function loadBug() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/bugs/${id}`
      );

      if (!response.ok) {
        throw new Error("Failed to load bug");
      }

      const data = await response.json();

      setBug(data);
      setStatus(data.status || "Reported");
      setAssignee(data.assignee || "");
    } catch (err) {
      console.error(err);
      setError("Could not load this bug.");
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/bugs/${id}/history`
      );

      if (!response.ok) {
        throw new Error("Failed to load history");
      }

      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (id) {
      loadBug();
      loadHistory();
    }
  }, [id]);

  async function saveChanges() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://127.0.0.1:8000/bugs/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            assignee,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Failed to update bug."
        );
      }

      setSuccess("BUG UPDATED SUCCESSFULLY");

      await loadBug();
      await loadHistory();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not update bug."
      );
    } finally {
      setSaving(false);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <p className="text-zinc-600">LOADING BUG...</p>
      </main>
    );
  }

  if (error || !bug) {
    return (
      <main className="min-h-screen bg-black text-white p-10 font-mono">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/bugs"
            className="text-sm text-[#39ff14] hover:text-white"
          >
            ← ALL BUGS
          </Link>

          <div className="mt-10 text-[#ff2929]">
            {error || "Bug not found."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-[#f5f5e8] p-10 font-mono">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-10">

          <div>
            <Link
              href="/bugs"
              className="text-xs text-zinc-500 hover:text-[#39ff14]"
            >
              ← ALL BUGS
            </Link>

            <p className="text-[11px] tracking-[0.3em] text-zinc-600 mt-6">
              BUG-{String(bug.id).padStart(3, "0")}
            </p>

            <h1 className="text-4xl font-black italic mt-2">
              {bug.title}
              <span className="text-[#39ff14]">_</span>
            </h1>

            <p className="text-xs text-zinc-600 mt-3">
              CREATED {new Date(bug.created_at).toLocaleString()}
            </p>
          </div>

          <Link
            href="/report"
            className="bg-[#39ff14] text-black font-black px-6 py-3 rounded-lg hover:bg-[#70ff59] transition"
          >
            + REPORT BUG
          </Link>

        </div>

        {/* ERROR / SUCCESS */}
        {error && (
          <div className="mb-6 border border-[#ff2929]/30 bg-[#ff2929]/5 rounded-lg p-4 text-[#ff2929] text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 border border-[#39ff14]/30 bg-[#39ff14]/5 rounded-lg p-4 text-[#39ff14] text-xs">
            ✓ {success}
          </div>
        )}

        {/* STATUS BAR */}
        <div className="grid grid-cols-4 gap-4 mb-8">

          <Meta
            label="STATUS"
            value={bug.status}
          />

          <Meta
            label="SEVERITY"
            value={bug.severity}
            red={
              bug.severity.toLowerCase() === "critical" ||
              bug.severity.toLowerCase() === "high"
            }
          />

          <Meta
            label="PRIORITY"
            value={bug.priority}
          />

          <Meta
            label="CATEGORY"
            value={bug.category}
          />

        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* ==================================================
              LEFT
              ================================================== */}
          <div className="col-span-2 space-y-6">

            <Section
              title="DESCRIPTION"
              content={bug.description}
            />

            <Section
              title="EXPECTED RESULT"
              content={bug.expected || "Not provided."}
            />

            <Section
              title="ACTUAL RESULT"
              content={bug.actual || "Not provided."}
              danger
            />

            {/* REPRODUCTION */}
            <div className="bg-[#0d0f10] border border-white/10 rounded-xl p-6">

              <p className="text-[10px] text-zinc-600 tracking-widest">
                REPRODUCTION STEPS
              </p>

              {bug.reproduction_steps &&
              bug.reproduction_steps.length > 0 ? (
                <ol className="mt-4 space-y-3">

                  {bug.reproduction_steps.map(
                    (step, index) => (
                      <li
                        key={index}
                        className="flex gap-4 text-sm text-zinc-300"
                      >
                        <span className="text-[#39ff14] font-black min-w-6">
                          {index + 1}.
                        </span>

                        <span className="leading-6">
                          {step}
                        </span>
                      </li>
                    )
                  )}

                </ol>
              ) : (
                <p className="text-sm text-zinc-600 mt-4">
                  No reproduction steps available.
                </p>
              )}

            </div>

            <Section
              title="POSSIBLE ROOT CAUSE"
              content={
                bug.root_cause ||
                "No root-cause analysis available."
              }
              green
            />

            <Section
              title="SUGGESTED FIX"
              content={
                bug.suggested_fix ||
                "No suggested fix available."
              }
              green
            />

            {/* TEST CASES */}
            <div className="bg-[#0d0f10] border border-[#39ff14]/20 rounded-xl p-6">

              <p className="text-[10px] text-zinc-600 tracking-widest">
                AI-GENERATED TEST CASES
              </p>

              {bug.test_cases &&
              bug.test_cases.length > 0 ? (
                <div className="mt-4 space-y-3">

                  {bug.test_cases.map(
                    (test, index) => (
                      <div
                        key={index}
                        className="flex gap-4 bg-white/[0.02] border border-white/5 rounded-lg p-4"
                      >
                        <span className="text-[#39ff14] font-black shrink-0">
                          TC-{String(index + 1).padStart(2, "0")}
                        </span>

                        <p className="text-sm text-zinc-300 leading-6">
                          {test}
                        </p>
                      </div>
                    )
                  )}

                </div>
              ) : (
                <p className="text-sm text-zinc-600 mt-4">
                  No test cases available.
                </p>
              )}

            </div>

            {/* ACTIVITY HISTORY */}
            <div className="bg-[#0d0f10] border border-white/10 rounded-xl p-6">

              <p className="text-[10px] text-zinc-600 tracking-widest">
                ACTIVITY HISTORY
              </p>

              {history.length === 0 ? (
                <p className="text-sm text-zinc-600 mt-5">
                  No activity recorded yet.
                </p>
              ) : (
                <div className="mt-6 relative">

                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />

                  <div className="space-y-6">

                    {history.map((event) => (
                      <div
                        key={event.id}
                        className="relative pl-7"
                      >

                        <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.5)]" />

                        <div className="flex justify-between gap-4">

                          <div>
                            <p className="text-xs font-bold text-zinc-300">
                              {formatAction(event)}
                            </p>

                            <p className="text-[10px] text-zinc-600 mt-1">
                              BY {event.actor.toUpperCase()}
                            </p>
                          </div>

                          <p className="text-[10px] text-zinc-700 shrink-0">
                            {new Date(
                              event.created_at
                            ).toLocaleString()}
                          </p>

                        </div>

                      </div>
                    ))}

                  </div>

                </div>
              )}

            </div>

          </div>

          {/* ==================================================
              RIGHT
              ================================================== */}
          <div className="space-y-6">

            {/* MANAGEMENT */}
            <div className="bg-[#0d0f10] border border-[#39ff14]/25 rounded-xl p-6">

              <p className="text-[#39ff14] text-xl">
                ⚙
              </p>

              <h2 className="font-black italic mt-3">
                ISSUE MANAGEMENT
              </h2>

              <p className="text-xs text-zinc-600 mt-2">
                UPDATE WORKFLOW STATE
              </p>

              {/* STATUS */}
              <div className="mt-7">

                <label className="text-[10px] tracking-widest text-zinc-600">
                  STATUS
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="w-full mt-2 bg-black border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#39ff14]"
                >
                  {STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

              </div>

              {/* ASSIGNEE */}
              <div className="mt-5">

                <label className="text-[10px] tracking-widest text-zinc-600">
                  ASSIGNEE
                </label>

                <input
                  value={assignee}
                  onChange={(e) =>
                    setAssignee(e.target.value)
                  }
                  placeholder="Developer name"
                  className="w-full mt-2 bg-black border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#39ff14]"
                />

              </div>

              <button
                onClick={saveChanges}
                disabled={saving}
                className="w-full mt-6 bg-[#39ff14] text-black font-black py-3 rounded-lg hover:bg-[#70ff59] disabled:opacity-50 transition"
              >
                {saving ? "SAVING..." : "SAVE CHANGES"}
              </button>

            </div>

            {/* AI ANALYSIS */}
            <div className="bg-[#0d0f10] border border-[#39ff14]/20 rounded-xl p-6">

              <p className="text-[#39ff14] text-2xl">
                ✦
              </p>

              <h2 className="font-black italic mt-3">
                AI ANALYSIS
              </h2>

              <p className="text-xs text-zinc-600 mt-2">
                STRUCTURED BUG INTELLIGENCE
              </p>

              <div className="mt-7 space-y-5">

                <AIField
                  label="SEVERITY"
                  value={bug.severity}
                  red={
                    bug.severity.toLowerCase() === "critical" ||
                    bug.severity.toLowerCase() === "high"
                  }
                />

                <AIField
                  label="PRIORITY"
                  value={bug.priority}
                />

                <AIField
                  label="CATEGORY"
                  value={bug.category}
                />

                <AIField
                  label="STATUS"
                  value={bug.status}
                />

                <AIField
                  label="ASSIGNEE"
                  value={bug.assignee || "Unassigned"}
                />

              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}


/* ============================================================
   HELPERS
   ============================================================ */

function Meta({
  label,
  value,
  red = false,
}: {
  label: string;
  value: string;
  red?: boolean;
}) {
  return (
    <div className="bg-[#0d0f10] border border-white/10 rounded-xl p-5">

      <p className="text-[10px] text-zinc-600 tracking-widest">
        {label}
      </p>

      <p
        className={`text-sm font-black mt-2 ${
          red
            ? "text-[#ff2929]"
            : "text-[#39ff14]"
        }`}
      >
        {value.toUpperCase()}
      </p>

    </div>
  );
}


function AIField({
  label,
  value,
  red = false,
}: {
  label: string;
  value: string;
  red?: boolean;
}) {
  return (
    <div>

      <p className="text-[10px] text-zinc-600 tracking-widest">
        {label}
      </p>

      <p
        className={`text-sm font-bold mt-2 ${
          red
            ? "text-[#ff2929]"
            : "text-zinc-200"
        }`}
      >
        {value}
      </p>

    </div>
  );
}


function Section({
  title,
  content,
  green = false,
  danger = false,
}: {
  title: string;
  content: string;
  green?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={`bg-[#0d0f10] border rounded-xl p-6 ${
        danger
          ? "border-[#ff2929]/20"
          : green
          ? "border-[#39ff14]/20"
          : "border-white/10"
      }`}
    >

      <p className="text-[10px] text-zinc-600 tracking-widest">
        {title}
      </p>

      <p
        className={`text-sm leading-7 mt-4 ${
          danger
            ? "text-zinc-300"
            : green
            ? "text-[#39ff14]"
            : "text-zinc-300"
        }`}
      >
        {content}
      </p>

    </div>
  );
}


function formatAction(event: HistoryEvent) {
  switch (event.action) {
    case "BUG_CREATED":
      return "Bug created";

    case "STATUS_CHANGED":
      return `Status changed: ${event.old_value} → ${event.new_value}`;

    case "ASSIGNEE_CHANGED":
      if (!event.new_value) {
        return "Bug unassigned";
      }

      return `Assigned to ${event.new_value}`;

    default:
      return event.action.replaceAll("_", " ");
  }
}