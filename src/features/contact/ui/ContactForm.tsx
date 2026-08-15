"use client";

import { motion, useReducedMotion } from "motion/react";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";

import { springSoft } from "@/components/motion/presets";
import { submitContactMessageAction } from "@/features/contact/application/submit-contact";

type ContactFormCopy = {
  name: string;
  email: string;
  phone: string;
  message: string;
  submit: string;
  sending: string;
  success: string;
  error: string;
  ticketStamp: string;
};

type ContactFormProps = {
  copy: ContactFormCopy;
};

const fieldClassName =
  "w-full border-0 border-b-2 border-pideh-ink/15 bg-transparent px-0 py-3 text-lg text-pideh-ink outline-none transition placeholder:text-pideh-ink/30 focus:border-pideh-orange disabled:opacity-60";

function readContactForm(form: HTMLFormElement) {
  const formData = new FormData(form);
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? "") || undefined,
    message: String(formData.get("message") ?? ""),
    companyWebsite: String(formData.get("companyWebsite") ?? ""),
  };
}

export function ContactForm({ copy }: ContactFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = readContactForm(form);

    startTransition(async () => {
      setError(null);
      const result = await submitContactMessageAction(payload);
      if (!result.ok) {
        setError(result.error.message || copy.error);
        return;
      }
      setSuccess(true);
    });
  }

  if (success) {
    return (
      <p
        role="status"
        className="rounded-[2px] border border-dashed border-pideh-yellow bg-pideh-cream p-8 text-base text-pideh-ink"
      >
        {copy.success}
      </p>
    );
  }

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute inset-3 rotate-2 rounded-[2px] bg-pideh-yellow"
      />
      <form
        onSubmit={onSubmit}
        className="relative overflow-hidden rounded-[2px] bg-white px-8 py-8 shadow-[12px_18px_0_0_rgba(30,30,30,0.18)] sm:px-10 sm:py-10"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-[radial-gradient(circle_at_left,var(--pideh-cream)_6px,transparent_7px)] bg-[length:100%_18px]"
        />
        <p className="font-display mb-8 -rotate-6 text-sm font-bold tracking-[0.18em] text-pideh-orange uppercase">
          {copy.ticketStamp}
        </p>
        <label className="mb-6 block text-[11px] font-semibold tracking-[0.2em] text-pideh-muted uppercase">
          {copy.name}
          <input
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            className={fieldClassName}
            disabled={isPending}
          />
        </label>
        <label className="mb-6 block text-[11px] font-semibold tracking-[0.2em] text-pideh-muted uppercase">
          {copy.email}
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className={fieldClassName}
            disabled={isPending}
          />
        </label>
        <label className="mb-6 block text-[11px] font-semibold tracking-[0.2em] text-pideh-muted uppercase">
          {copy.phone}
          <input
            name="phone"
            maxLength={40}
            autoComplete="tel"
            className={fieldClassName}
            disabled={isPending}
          />
        </label>
        <label className="mb-8 block text-[11px] font-semibold tracking-[0.2em] text-pideh-muted uppercase">
          {copy.message}
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={5000}
            rows={5}
            className={`${fieldClassName} resize-none`}
            disabled={isPending}
          />
        </label>
        <div className="hidden" aria-hidden="true">
          <label>
            company
            <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        {error ? (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        <motion.button
          type="submit"
          className="w-full rounded-full bg-pideh-orange py-3.5 text-sm font-bold tracking-[0.18em] text-white uppercase disabled:opacity-50"
          disabled={isPending}
          whileHover={reduceMotion ? undefined : { scale: 1.02 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          transition={springSoft}
        >
          {isPending ? copy.sending : copy.submit}
        </motion.button>
      </form>
    </div>
  );
}
