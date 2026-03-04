"use client";

import { motion } from "motion/react";

type StackCard = {
  title: string;
  description: string;
  tags: string[];
  border: string;
  orb: string;
  badge: string;
};

const STACK_CARDS: StackCard[] = [
  {
    title: "Languages",
    description:
      "Primary programming languages I use to build cool things",
    tags: ["TypeScript", "JavaScript", "Python", "Java"],
    border: "border-sky-300/30",
    orb: "from-sky-400/35 to-cyan-300/5",
    badge: "bg-sky-300/15 text-sky-100",
  },
  {
    title: "Frontend",
    description:
      "Frontend frameworks and UI tooling for making websites, usually website",
    tags: ["React", "Next.js", "Vue", "Nuxt", "Tailwind CSS", "Motion.dev",],
    border: "border-violet-300/30",
    orb: "from-violet-400/35 to-fuchsia-300/5",
    badge: "bg-violet-300/15 text-violet-100",
  },
  {
    title: "Tools",
    description:
      "To ship, monitor, and run my code, also databases, for some reason",
    tags: ["Node.js", "Docker", "GitHub Actions", "CircleCI", "MongoDB", "SQLite"],
    border: "border-emerald-300/30",
    orb: "from-emerald-400/35 to-lime-300/5",
    badge: "bg-emerald-300/15 text-emerald-100",
  },
];

export default function LanguagesToolsSection() {
  return (
    <section
      id="languages-tools"
      className="relative overflow-hidden bg-[#040915] text-slate-100 "
    >
      <div
        className="absolute top-0 h-[80px] w-screen bg-linear-to-b from-[#03050d] to-transparent z-50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(56,189,248,0.2),transparent_42%),radial-gradient(circle_at_84%_68%,rgba(99,102,241,0.2),transparent_44%),linear-gradient(to_bottom,rgba(4,9,21,0.08),#02040a)]"
      />


      <div className="relative mx-auto max-w-6xl z-20 px-6 py-24 sm:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <h2 className="text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
            Languages and Tools
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-slate-300/85 sm:text-base">
            What I use to make things.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {STACK_CARDS.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 34, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
              className={`group relative overflow-hidden rounded-2xl border ${card.border} bg-slate-950/55 p-6 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-white/45 hover:bg-slate-900/70`}
            >
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-linear-to-br ${card.orb} opacity-75 blur-3xl transition-opacity duration-500 group-hover:opacity-100`}
              />

              <h3 className="text-2xl font-semibold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300/85">{card.description}</p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <li
                    key={tag}
                    className={`rounded-full ${card.badge} border border-white/15 px-3 py-1 text-xs font-medium`}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
