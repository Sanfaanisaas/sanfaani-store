const props = [
  { title: "Condition transparency", desc: "Real inspection notes and grading before you pay." },
  { title: "Quote before work", desc: "Every repair needs your explicit approval first." },
  { title: "Tracked handover", desc: "Receipts, photos and work logs at every stage." },
];

export default function TrustBand() {
  return (
    <section className="bg-navy-900 py-20 text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 divide-y divide-paper/10 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {props.map((p) => (
          <div key={p.title} className="pt-8 first:pt-0 sm:px-8 sm:pt-0 sm:first:pl-0">
            <h3 className="font-display text-lg font-semibold text-gold">{p.title}</h3>
            <p className="mt-2 text-sm text-paper/70">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}