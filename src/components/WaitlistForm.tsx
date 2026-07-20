"use client";

import { useState } from "react";

const EMPLOYMENT_STATUSES = [
  "Student",
  "Employed",
  "Self-employed / Founder",
  "Unemployed",
  "Other",
];

// Google Form submission endpoint + field entry IDs.
// See: https://docs.google.com/forms/d/1LzqAJjBXWG3VQLnZODz-WAu61dnoC6e55aD2492Ve2M/edit
const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSdEAp94pcFgbBcTnjFP_SxhfC24S4XtOLmQK6rJlReIWGxj1Q/formResponse";

const ENTRY_IDS = {
  name: "entry.262330069",
  email: "entry.913927242",
  phone: "entry.1166808372",
  address: "entry.778676526",
  employmentStatus: "entry.1418504374",
  desiredGadget: "entry.1899066851",
  reason: "entry.1914142699",
};

interface WaitlistFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  employmentStatus: string;
  desiredGadget: string;
  reason: string;
}

const initialFormData: WaitlistFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  employmentStatus: "",
  desiredGadget: "",
  reason: "",
};

export default function WaitlistForm() {
  const [formData, setFormData] = useState<WaitlistFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const body = new URLSearchParams();
    body.append(ENTRY_IDS.name, formData.name);
    body.append(ENTRY_IDS.email, formData.email);
    body.append(ENTRY_IDS.phone, formData.phone);
    body.append(ENTRY_IDS.address, formData.address);
    body.append(ENTRY_IDS.employmentStatus, formData.employmentStatus);
    body.append(ENTRY_IDS.desiredGadget, formData.desiredGadget);
    body.append(ENTRY_IDS.reason, formData.reason);

    try {
      // "no-cors" is required here — Google's endpoint doesn't allow us to
      // read the response, so we can't check res.ok. We fire the request
      // and trust it succeeded; this is the standard, well-established way
      // to submit to Google Forms from outside forms.google.com itself.
      await fetch(GOOGLE_FORM_ACTION, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
    } catch {
      // no-cors requests essentially never throw, but we catch defensively.
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md rounded-md bg-green-50 px-6 py-4 text-center">
        <p className="text-sm font-medium text-green-800">
          Thanks, {formData.name.split(" ")[0] || "there"} — you&apos;re on the
          list. We&apos;ll be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-2xl space-y-4 text-left"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-ink/80"
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            className="w-full rounded-md border border-navy-900/15 px-4 py-2 text-sm text-ink focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-ink/80"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full rounded-md border border-navy-900/15 px-4 py-2 text-sm text-ink focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-1 block text-sm font-medium text-ink/80"
          >
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="0901 017 2138"
            className="w-full rounded-md border border-navy-900/15 px-4 py-2 text-sm text-ink focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="employmentStatus"
            className="mb-1 block text-sm font-medium text-ink/80"
          >
            Employment status
          </label>
          <select
            id="employmentStatus"
            name="employmentStatus"
            required
            value={formData.employmentStatus}
            onChange={handleChange}
            className="w-full rounded-md border border-navy-900/15 px-4 py-2 text-sm text-ink focus:border-gold focus:outline-none"
          >
            <option value="" disabled>
              Select one
            </option>
            {EMPLOYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="address"
          className="mb-1 block text-sm font-medium text-ink/80"
        >
          Address
        </label>
        <input
          id="address"
          name="address"
          type="text"
          required
          value={formData.address}
          onChange={handleChange}
          placeholder="City, State"
          className="w-full rounded-md border border-navy-900/15 px-4 py-2 text-sm text-ink focus:border-gold focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="desiredGadget"
          className="mb-1 block text-sm font-medium text-ink/80"
        >
          What gadget are you looking to buy?
        </label>
        <input
          id="desiredGadget"
          name="desiredGadget"
          type="text"
          required
          value={formData.desiredGadget}
          onChange={handleChange}
          placeholder="e.g. MacBook Air M2, iPhone 14"
          className="w-full rounded-md border border-navy-900/15 px-4 py-2 text-sm text-ink focus:border-gold focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="reason"
          className="mb-1 block text-sm font-medium text-ink/80"
        >
          Why do you want it?
        </label>
        <textarea
          id="reason"
          name="reason"
          required
          rows={3}
          value={formData.reason}
          onChange={handleChange}
          placeholder="Tell us what you'll use it for..."
          className="w-full resize-none rounded-md border border-navy-900/15 px-4 py-2 text-sm text-ink focus:border-gold focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-navy-900 px-6 py-3 text-sm font-medium text-paper hover:bg-navy-800 disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Submitting..." : "Join waitlist"}
      </button>
    </form>
  );
}
