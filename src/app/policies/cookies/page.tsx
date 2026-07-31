import PolicyLayout from "@/components/PolicyLayout";

export default function CookieNoticePage() {
  return (
    <PolicyLayout 
      title="Cookie Notice" 
      subtitle="Explanation of session cookies and web browser storage utilization."
      lastUpdated="July 2026"
    >
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">1. What Are Cookies?</h2>
        <p className="text-mist">
          Cookies are tiny text files stored in your web browser that enable us to recognize your session, remember cart items, and maintain logged-in states.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">2. Essential Cookies</h2>
        <p className="text-mist">
          These cookies are strictly required for authenticating your account session and enabling checkout functionality. Disabling them will disrupt core site operations.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">3. Managing Cookie Preferences</h2>
        <p className="text-mist">
          You can modify your web browser preferences to refuse non-essential performance cookies at any time.
        </p>
      </section>
    </PolicyLayout>
  );
}