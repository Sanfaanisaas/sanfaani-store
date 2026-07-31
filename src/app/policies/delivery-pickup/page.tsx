import PolicyLayout from "@/components/PolicyLayout";

export default function DeliveryPickupPage() {
  return (
    <PolicyLayout 
      title="Delivery & Pickup Policy" 
      subtitle="Timelines, collection verification, and courier shipping rules."
      lastUpdated="July 2026"
    >
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">1. Store Pickup Option</h2>
        <p className="text-mist">
          Items purchased or repaired for in-store pickup require a valid photo ID along with your order or repair tracking reference code upon collection.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">2. Courier Delivery</h2>
        <p className="text-mist">
          Standard deliveries take 1–3 business days. Estimated arrival dates are calculated upon dispatch notification.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">3. Shipping Inspection</h2>
        <p className="text-mist">
          Inspect packages upon delivery. Any physical shipping damage or missing items must be reported within 48 hours of receipt.
        </p>
      </section>
    </PolicyLayout>
  );
}