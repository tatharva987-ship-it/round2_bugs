import Link from "next/link";

const stats = [
  {
    title: "TOTAL BUGS",
    value: "24",
    info: "+5 THIS WEEK",
    color: "green",
  },
  {
    title: "OPEN BUGS",
    value: "12",
    info: "4 NEED ATTENTION",
    color: "green",
  },
  {
    title: "CRITICAL",
    value: "3",
    info: "IMMEDIATE ACTION",
    color: "red",
  },
  {
    title: "RESOLVED",
    value: "9",
    info: "72% RESOLUTION RATE",
    color: "green",
  },
];

const bugs = [
  {
    id: "BUG-024",
    title: "Checkout crashes when address is empty",
    severity: "CRITICAL",
    status: "OPEN",
  },
  {
    id: "BUG-023",
    title: "Cart displays incorrect total",
    severity: "HIGH",
    status: "IN PROGRESS",
  },
  {
    id: "BUG-022",
    title: "Product image fails to load",
    severity: "MEDIUM",
    status: "RESOLVED",
  },
];

export default function Home() {
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

              <button className="text-xs text-[#39ff14] font-bold">
                VIEW ALL →
              </button>

            </div>


            <div className="space-y-2">

              {bugs.map((bug) => (
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
                      {bug.id}
                    </p>

                    <p className="text-sm mt-1 font-semibold">
                      {bug.title}
                    </p>
                  </div>


                  <div className="flex gap-4 items-center">

                    <span
                      className={`text-[10px] font-black tracking-wider ${
                        bug.severity === "CRITICAL"
                          ? "text-[#ff2929]"
                          : bug.severity === "HIGH"
                          ? "text-orange-400"
                          : "text-yellow-300"
                      }`}
                    >
                      {bug.severity}
                    </span>

                    <span className="text-[10px] px-3 py-1 rounded-full border border-white/10 text-zinc-300 bg-white/5">
                      {bug.status}
                    </span>

                  </div>

                </div>
              ))}

            </div>

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
                title="3 SIMILAR BUGS DETECTED"
                text="Possible duplicate reports found."
                color="green"
              />

              <Insight
                title="CHECKOUT NEEDS ATTENTION"
                text="Highest concentration of critical bugs."
                color="red"
              />

              <Insight
                title="2 RECURRING ROOT CAUSES"
                text="Validation errors appear frequently."
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