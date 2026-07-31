import PolicyLayout from "@/components/PolicyLayout";

export default function ReturnsPage() {
  return (
    <PolicyLayout 
      title="Returns & Refunds Policy" 
      subtitle="Guidelines on returning merchandise and obtaining refunds or exchanges."
      lastUpdated="July 2026"
    >
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">1. Return Window</h2>
        <p className="text-mist">
          Unused store products in their original packaging may be returned within 14 days of receipt for a full refund or exchange.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">2. Non-Returnable Items</h2>
        <ul className="list-disc pl-5 space-y-1 text-mist">
          <li>Completed labor costs for diagnostic or repair work.</li>
          <li>Opened software, digital licenses, or consumable accessories.</li>
          <li>Items damaged due to customer misuse.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">3. Refund Processing</h2>
        <p className="text-mist">
          Approved refunds are processed back to the original payment method within 5–7 business days after inspection of the returned merchandise.
        </p>
      </section>
    </PolicyLayout>
  );
}