import PolicyLayout from "@/components/PolicyLayout";

export default function DeviceDataPage() {
  return (
    <PolicyLayout 
      title="Device-Data Acknowledgment" 
      subtitle="Important information regarding your personal data during hardware repair."
      lastUpdated="July 2026"
    >
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">1. Data Backup Responsibility</h2>
        <p className="text-mist">
          <strong>Customers are solely responsible for backing up all personal data</strong>, photos, and files prior to submitting any device for service. Data loss can occur during routine hardware replacements or logic board diagnostics.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">2. Liability Waiver</h2>
        <p className="text-mist">
          Our repair workshop accepts no liability for loss of data, corrupted operating systems, or confidential file exposure occurring during the servicing process.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">3. Confidentiality Guarantee</h2>
        <p className="text-mist">
          Technicians only access software modules necessary to verify repair success (e.g., camera tests, touch sensitivity). We never browse, copy, or distribute customer files.
        </p>
      </section>
    </PolicyLayout>
  );
}