import PolicyLayout from "@/components/PolicyLayout";

export default function RepairCustodyPage() {
  return (
    <PolicyLayout 
      title="Repair & Device Custody Agreement" 
      subtitle="Terms regarding hardware drop-off, storage fees, and uncollected devices."
      lastUpdated="July 2026"
    >
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">1. Inspection & Diagnostic Fees</h2>
        <p className="text-mist">
          An initial diagnostic assessment may apply. Diagnostic fees are waived if you proceed with the recommended repair option.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">2. Abandoned Equipment Policy</h2>
        <p className="text-mist">
          Devices left in our custody for over 60 days following completion notice without payment or arrangement will be considered abandoned and disposed of or recycled to recoup storage and repair costs.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">3. Unforeseen Technical Complications</h2>
        <p className="text-mist">
          Pre-existing issues (such as board damage or liquid corrosion) may degrade further during teardown. We are not responsible for pre-existing non-functional components discovered during repair.
        </p>
      </section>
    </PolicyLayout>
  );
}