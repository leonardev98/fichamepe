"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle, Search, UserRound } from "lucide-react";
import { SITE_TAGLINES } from "@/lib/constants";

const DISCOVERY_EXAMPLES = [
  "Alguien que te arme tu CV y te consiga chamba",
  "Un editor que te vuelva viral",
  "Un animador que levante tu fiesta",
  "Un fotógrafo que te haga ver pro",
  "Alguien que te ayude con una cita",
  "Un crack que te arme tu negocio",
  "Clases rápidas para aprender algo hoy",
  "Alguien que te resuelva un problema urgente",
  "Un creativo que te diseñe todo",
  "Un especialista que te saque de apuros",
] as const;

const STEPS = [
  {
    title: "Buscas lo que necesitas (aunque sea raro).",
    Icon: Search,
  },
  {
    title: "Encuentras a alguien que lo hace.",
    Icon: UserRound,
  },
  {
    title: "Le escribes directo y lo resuelves.",
    Icon: MessageCircle,
  },
] as const;

function useMotionSafe() {
  const reduce = useReducedMotion();
  return {
    fadeUp: reduce
      ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
      : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
    stagger: reduce ? 0 : 0.1,
    duration: reduce ? 0 : 0.45,
  };
}

export function ComoFuncionaContent() {
  const { fadeUp, stagger, duration } = useMotionSafe();

  return (
    <main className="flex-1 overflow-x-hidden">
      {/* Hero + pasos */}
      <section className="relative fp-gradient-bg border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden
        >
          <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:pb-20 sm:pt-16">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: stagger, delayChildren: 0.05 },
              },
            }}
          >
            <motion.h1
              variants={fadeUp}
              transition={{ duration }}
              className="font-heading text-[clamp(1.5rem,4vw,2.35rem)] font-extrabold leading-tight tracking-tight text-foreground"
            >
              Cómo funciona (spoiler: es ridículamente fácil)
            </motion.h1>
          </motion.div>

          <motion.div
            className="mx-auto mt-12 grid max-w-6xl gap-4 sm:gap-5 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: stagger + 0.04, delayChildren: 0.12 },
              },
            }}
          >
            {STEPS.map(({ title, Icon }, i) => (
              <motion.div
                key={title}
                variants={fadeUp}
                transition={{ duration }}
                className="group flex flex-col rounded-2xl border border-border/80 bg-surface/90 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:border-primary/25 hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-heading text-lg font-bold text-primary transition-colors group-hover:bg-primary/15">
                    {i + 1}
                  </span>
                  <Icon
                    className="size-8 text-primary/80 transition-transform duration-300 group-hover:scale-110"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </div>
                <p className="text-left text-[15px] font-medium leading-relaxed text-foreground">
                  {title}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mx-auto mt-12 max-w-xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration }}
          >
            <p className="text-sm font-semibold text-primary">
              {SITE_TAGLINES[4]} {SITE_TAGLINES[5]}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Sin agencias. Sin vueltas. Sin perder el tiempo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Marca */}
      <section className="relative border-y border-border/60 bg-[var(--fp-bg-section)] py-14 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(108,58,237,0.12),transparent)]"
          aria-hidden
        />
        <motion.div
          className="relative mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-12 lg:gap-12 lg:items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: stagger, delayChildren: 0.06 },
            },
          }}
        >
          <motion.div variants={fadeUp} transition={{ duration }} className="lg:col-span-5">
            <p className="font-heading text-lg font-bold leading-snug text-foreground sm:text-xl">
              No somos una bolsa de trabajo.
              <br />
              No somos una agencia.
            </p>
          </motion.div>
          <motion.div
            variants={fadeUp}
            transition={{ duration }}
            className="lg:col-span-7 lg:border-l lg:border-border/70 lg:pl-12"
          >
            <p className="text-[15px] leading-relaxed text-muted sm:text-base">
              Somos el lugar donde encuentras a la persona exacta para lo que necesitas.
            </p>
            <p className="mt-5 text-sm font-semibold text-primary sm:text-[15px]">
              Rápido. Directo. Sin intermediarios.
            </p>
            <p className="mt-2 text-sm text-muted">{SITE_TAGLINES[6]}</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Ejemplos */}
      <section className="relative py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: stagger },
              },
            }}
          >
            <motion.h2
              variants={fadeUp}
              transition={{ duration }}
              className="font-heading text-xl font-bold text-foreground sm:text-2xl"
            >
              Cosas que podrías contratar hoy (y no sabías)
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration }}
              className="mt-3 text-[15px] text-muted"
            >
              {SITE_TAGLINES[0]} {SITE_TAGLINES[2]}
            </motion.p>
          </motion.div>

          <motion.ul
            className="mx-auto mt-10 list-none columns-1 gap-3 sm:columns-2 lg:columns-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05, delayChildren: 0.08 },
              },
            }}
            aria-label="Ejemplos de servicios"
          >
            {DISCOVERY_EXAMPLES.map((line) => (
              <motion.li
                key={line}
                variants={fadeUp}
                transition={{ duration: duration * 0.85 }}
                className="mb-3 break-inside-avoid"
              >
                <span className="block rounded-xl border border-border/80 bg-surface px-4 py-3 text-left text-[14px] leading-snug text-foreground shadow-sm transition hover:border-primary/30 hover:shadow-md">
                  {line}
                </span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div
            className="mx-auto mt-10 max-w-xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration }}
          >
            <p className="text-sm font-medium text-primary">Y sí… hay más raros todavía.</p>
            <p className="mt-2 text-sm text-muted">{SITE_TAGLINES[8]}</p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
