import { Clock3, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";

import { fadeUp } from "@/components/motion/presets";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ContactInfoProps = {
  copy: Dictionary["contact"];
};

type ChannelLine = {
  text: string;
  href?: string;
};

type Channel = {
  index: string;
  icon: LucideIcon;
  title: string;
  lines: ChannelLine[];
};

function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function toMapsHref(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function ChannelRow({ channel }: { channel: Channel }) {
  const Icon = channel.icon;

  return (
    <div className="relative border-b border-dashed border-[#1e1e1e]/15 py-6 pl-8">
      <span className="absolute top-8 left-0 size-2.5 rounded-full bg-[#ff6b00] ring-4 ring-[#ff6b00]/20" />
      <span className="font-mono text-xs tracking-[0.18em] text-[#ff6b00]">
        {channel.index}
      </span>
      <span className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#1e1e1e]">
        <Icon className="size-4 text-[#ff6b00]" aria-hidden="true" />
        {channel.title}
      </span>
      <span className="mt-2 space-y-1 text-base leading-snug text-[#1e1e1e]/75">
        {channel.lines.map((line) =>
          line.href ? (
            <a
              key={line.text}
              href={line.href}
              target={line.href.startsWith("http") ? "_blank" : undefined}
              rel={
                line.href.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              className="block w-fit text-[#1e1e1e] underline-offset-2 transition hover:text-[#ff6b00] hover:underline"
            >
              {line.text}
            </a>
          ) : (
            <span key={line.text} className="block">
              {line.text}
            </span>
          ),
        )}
      </span>
    </div>
  );
}

export function ContactInfo({ copy }: ContactInfoProps) {
  const channels: Channel[] = [
    {
      index: "01",
      icon: Phone,
      title: copy.callTitle,
      lines: [
        { text: copy.callDescription },
        { text: copy.storePhone, href: toTelHref(copy.storePhone) },
      ],
    },
    {
      index: "02",
      icon: Mail,
      title: copy.writeTitle,
      lines: [
        { text: copy.writeDescription },
        { text: copy.storeEmail, href: `mailto:${copy.storeEmail}` },
      ],
    },
    {
      index: "03",
      icon: MapPin,
      title: copy.hqTitle,
      lines: [
        {
          text: copy.storeAddress,
          href: toMapsHref(copy.storeAddress),
        },
        {
          text: copy.storeAddressSecondary,
          href: toMapsHref(copy.storeAddressSecondary),
        },
      ],
    },
    {
      index: "04",
      icon: Clock3,
      title: copy.hoursTitle,
      lines: [
        { text: copy.hoursWeekdays },
        { text: copy.hoursDelivery },
      ],
    },
  ];

  return (
    <StaggerGroup className="relative">
      <div
        aria-hidden="true"
        className="absolute top-8 bottom-8 left-[4px] w-px bg-[#ff6b00]/35"
      />
      {channels.map((channel) => (
        <StaggerItem key={channel.index} variants={fadeUp}>
          <ChannelRow channel={channel} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
