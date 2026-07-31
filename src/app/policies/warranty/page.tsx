import PolicyLayout from "@/components/PolicyLayout";

export default function WarrantyPage() {
  return (
    <PolicyLayout 
      title="Warranty Guarantee Policy" 
      subtitle="Details regarding coverage terms for repaired devices and purchased products."
      lastUpdated="July 2026"
    >
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">1. Repair Coverage Period</h2>
        <p className="text-mist">
          All hardware repairs performed by our technicians come with a standard 90-day limited warranty covering replaced parts and workmanship from the date of collection.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">2. Exclusions & Exclusions</h2>
        <p className="text-mist">The warranty is strictly void under the following conditions:</p>
        <ul className="list-disc pl-5 space-y-1 text-mist">
          <li>Accidental drops, physical impact, or screen cracks post-repair.</li>
          <li>Liquid ingress or exposure to moisture.</li>
          <li>Unauthorized third-party tampering or software modification (jailbreaking/rooting).</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">3. How to File a Claim</h2>
        <p className="text-mist">
          Navigate to your account dashboard, select your repair record under the warranty claim tab, and submit a ticket. Devices must be brought in for diagnostic verification.
        </p>
      </section>
    </PolicyLayout>
  );
}