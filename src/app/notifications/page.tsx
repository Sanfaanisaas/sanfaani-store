import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata = { title: "Notifications", robots: { index: false, follow: false } };
export default function NotificationsPage() { return <ProtectedRoute><main id="main-content" className="mx-auto max-w-3xl px-6 py-12"><h1 className="font-display text-3xl font-semibold">Notifications</h1><section role="status" className="mt-6 rounded-2xl border border-navy-900/10 bg-white p-6"><h2 className="font-semibold">Notification centre is unavailable</h2><p className="mt-2 text-sm text-mist">The backend does not currently provide owner-scoped notification, unread-count, mark-read, preference, or safe resource-link endpoints. No local-only notification preferences are stored.</p><Link href="/support" className="mt-4 inline-block font-semibold text-blue underline">Contact support</Link></section></main></ProtectedRoute>; }
