import PolicyLayout from "@/components/PolicyLayout";

export default function PrivacyPage() {
  return (
    <PolicyLayout 
      title="Privacy Policy" 
      subtitle="How we collect, store, and protect your personal information."
      lastUpdated="July 2026"
    >
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">1. Information We Collect</h2>
        <p className="text-mist">
          We collect basic identity details (name, email, phone number) and transaction records required to fulfill store orders and manage repair tickets.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">2. How Information is Used</h2>
        <p className="text-mist">
          Your data is used strictly for order fulfillment, warranty tracking, and order update notifications. We never sell or lease customer records to third-party advertisers.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">3. Data Security</h2>
        <p className="text-mist">
          We apply modern encryption protocols to guard user records against unauthorized access, loss, or alteration.
        </p>
      </section>
    </PolicyLayout>
  );
}