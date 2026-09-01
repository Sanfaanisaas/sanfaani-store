"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { EmptyState, ErrorState, LoadingState } from "@/components/ApiState";
import { customerApiMessage } from "@/lib/api/customerStates";
import {
  getNotificationPreferences,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationDestination,
  type CustomerNotification,
  type NotificationPreferences,
  unreadNotifications,
  updateNotificationPreferences,
} from "@/lib/api/notificationApi";
export default function NotificationsPage() {
  const [items, setItems] = useState<CustomerNotification[]>([]);
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [count, setCount] = useState(0);
  const [pending, setPending] = useState<string | null>(null);
  const loadDataRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [result, unread, prefs] = await Promise.all([
          listNotifications(),
          unreadNotifications(),
          getNotificationPreferences(),
        ]);
        if (!active) return;
        setItems(result.notifications);
        setCount(unread);
        setPreferences(prefs);
        setState("ready");
      } catch (error) {
        if (!active) return;
        setMessage(
          customerApiMessage(error, "Notifications are unavailable."),
        );
        setState("error");
      }
    }
    loadDataRef.current = () => { void loadData(); };
    void loadData();
    return () => { active = false; };
  }, []);

  async function load() {
    setState("loading");
    if (loadDataRef.current) loadDataRef.current();
  }

  async function read(item: CustomerNotification) {
    if (item.readAt || pending) return;
    setPending(item.id);
    try {
      await markNotificationRead(item.id);
      setItems(
        items.map((value) =>
          value.id === item.id
            ? { ...value, readAt: new Date().toISOString() }
            : value,
        ),
      );
      setCount(Math.max(0, count - 1));
    } catch (error) {
      setMessage(
        customerApiMessage(
          error,
          "We could not mark that notification as read.",
        ),
      );
    } finally {
      setPending(null);
    }
  }
  async function readAll() {
    setPending("all");
    try {
      await markAllNotificationsRead();
      setItems(
        items.map((item) => ({
          ...item,
          readAt: item.readAt || new Date().toISOString(),
        })),
      );
      setCount(0);
    } catch (error) {
      setMessage(
        customerApiMessage(error, "We could not mark notifications as read."),
      );
    } finally {
      setPending(null);
    }
  }
  async function preference(key: string, value: boolean) {
    if (!preferences || pending) return;
    const next = { ...preferences.optionalCategories, [key]: value };
    setPending(key);
    try {
      setPreferences({ ...preferences, optionalCategories: next });
      setPreferences(await updateNotificationPreferences(next));
    } catch (error) {
      setMessage(
        customerApiMessage(error, "Your preferences could not be updated."),
      );
      await load();
    } finally {
      setPending(null);
    }
  }
  return (
    <ProtectedRoute>
      <Navbar />
      <main id="main-content" className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-3xl font-semibold">Notifications</h1>
        <p className="mt-2 text-sm text-mist">
          {count} unread notification{count === 1 ? "" : "s"}. Transactional and
          security notices remain enabled.
        </p>
        {state === "loading" ? (
          <LoadingState>Loading notifications&</LoadingState>
        ) : state === "error" ? (
          <ErrorState message={message} onRetry={() => { setState("loading"); void load(); }} />
        ) : (
          <>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={pending !== null || count === 0}
                onClick={() => void readAll()}
                className="rounded-full border border-navy-900/20 px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Mark all read
              </button>
            </div>
            {items.length === 0 ? (
              <EmptyState title="No notifications">
                Updates about your account will appear here.
              </EmptyState>
            ) : (
              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-navy-900/10 bg-white p-4"
                  >
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <h2 className="font-semibold">{item.title}</h2>
                        <p className="mt-1 text-sm text-mist">
                          {item.safePreview}
                        </p>
                        <p className="mt-2 text-xs text-mist">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          href={notificationDestination(item)}
                          onClick={() => void read(item)}
                          className="text-sm font-semibold text-blue underline"
                        >
                          Open
                        </Link>
                        {!item.readAt && (
                          <button
                            type="button"
                            disabled={pending !== null}
                            onClick={() => void read(item)}
                            className="text-sm font-semibold text-blue underline"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <section className="mt-8 rounded-xl border border-navy-900/10 bg-white p-5">
              <h2 className="font-display text-xl font-semibold">
                Notification preferences
              </h2>
              {preferences ? (
                <>
                  <p className="mt-2 text-sm text-mist">
                    Mandatory: {preferences.mandatoryCategories.join(", ")}.
                  </p>
                  <fieldset className="mt-4 space-y-3">
                    <legend className="font-semibold">
                      Optional in-app categories
                    </legend>
                    {Object.entries(preferences.optionalCategories).map(
                      ([key, value]) => (
                        <label
                          key={key}
                          className="flex items-center gap-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={value === true}
                            disabled={pending !== null}
                            onChange={(event) =>
                              void preference(key, event.target.checked)
                            }
                          />
                          <span>{key.replaceAll("_", " ")}</span>
                        </label>
                      ),
                    )}
                  </fieldset>
                </>
              ) : null}
            </section>
          </>
        )}
        {message && (
          <p role="status" className="mt-4 text-sm text-mist">
            {message}
          </p>
        )}
      </main>
    </ProtectedRoute>
  );
}
