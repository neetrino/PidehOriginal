import { notFound } from "next/navigation";

import { ContactForm } from "@/features/contact/ui/ContactForm";
import { ContactInfo } from "@/features/contact/ui/ContactInfo";
import { ContactMap } from "@/features/contact/ui/ContactMap";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);
  const { contact } = dictionary;

  return (
    <div className="-mx-4 -my-10 bg-[#fff8e7] sm:-mx-6 lg:-mx-8">
      <section className="relative mx-auto max-w-7xl overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <h1 className="sr-only">{contact.title}</h1>
        <div className="relative grid grid-cols-1 items-start gap-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <ContactInfo copy={contact} />
          <ContactForm
            copy={{
              name: contact.name,
              email: contact.email,
              phone: contact.phone,
              message: contact.message,
              submit: contact.submit,
              sending: contact.sending,
              success: contact.success,
              error: contact.error,
              ticketStamp: contact.ticketStamp,
            }}
          />
        </div>
      </section>
      <ContactMap
        title={contact.mapTitle}
        primaryLabel={contact.storeAddress}
        secondaryLabel={contact.storeAddressSecondary}
        zoomInLabel={contact.mapZoomIn}
        zoomOutLabel={contact.mapZoomOut}
      />
    </div>
  );
}
