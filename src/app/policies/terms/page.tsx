import PolicyLayout from "@/components/PolicyLayout";

export default function TermsPage() {
  return (
    <PolicyLayout 
      title="Terms & Conditions" 
      subtitle="Rules and legal guidelines governing your use of our platform and services."
      lastUpdated="July 2026"
    >
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">1. Acceptance of Terms</h2>
        <p className="text-mist">
          By accessing or using our services, online shop, or repair facilities, you agree to be bound by these Terms and Conditions. If you do not agree, please refrain from using our platform.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">2. Account Obligations</h2>
        <p className="text-mist">
          You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account. Promptly notify us of any unauthorized use.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">3. Pricing & Payments</h2>
        <p className="text-mist">
          All prices for products and repair services are displayed in local currency and are subject to change without notice. Full payment or pre-authorization is required before service completion or item dispatch.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">4. Limitation of Liability</h2>
        <p className="text-mist">
          We shall not be liable for any indirect, incidental, or consequential damages resulting from product use or repair operations beyond the value of the service provided.
        </p>
      </section>
    </PolicyLayout>
  );
}