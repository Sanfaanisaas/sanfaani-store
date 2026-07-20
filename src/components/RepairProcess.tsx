const steps = [
  { n: "01", title: "Request", desc: "Submit your issue and acknowledge our data-privacy terms." },
  { n: "02", title: "Diagnose", desc: "A technician records custody, condition and diagnosis." },
  { n: "03", title: "Approve quote", desc: "You review and approve the exact cost before work starts." },
  { n: "04", title: "Repair & QC", desc: "Work is logged, then verified by a separate quality check." },
  { n: "05", title: "Handover", desc: "You get your device back with warranty activated." },
];

export default function RepairProcess() {
  return (
    <section id="repair" className="bg-navy-900/[0.03] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">How repair works</p>
        <h2 className="mt-2 max-w-lg font-display text-3xl font-semibold text-ink">
          Nothing happens to your device without your sign-off
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s) => (
            <div key={s.n} className="border-t-2 border-navy-900/15 pt-4">
              <span className="font-display text-2xl font-semibold text-gold">{s.n}</span>
              <h3 className="mt-2 font-display text-base font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-mist">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}