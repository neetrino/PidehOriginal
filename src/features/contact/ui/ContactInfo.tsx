import { Clock3, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";

import { fadeUp } from "@/components/motion/presets";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ContactInfoProps = {
  copy: Dictionary["contact"];
};

type Channel = {
  index: string;
  icon: LucideIcon;
  title: string;
  lines: string[];
  href?: string;
};

function ChannelRow({ channel }: { channel: Channel }) {
  const Icon = channel.icon;
  const body = (
    <>
      <span className="font-mono text-xs tracking-[0.18em] text-[#ff6b00]">
        {channel.index}
      </span>
      <span className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#1e1e1e]">
        <Icon className="size-4 text-[#ff6b00]" aria-hidden="true" />
        {channel.title}
      </span>
      <span className="mt-2 space-y-1 text-base leading-snug text-[#1e1e1e]/75">
        {channel.lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </span>
    </>
  );

  const className =
    "group relative block border-b border-dashed border-[#1e1e1e]/15 py-6 pl-8 transition-transform hover:translate-x-1";

  if (channel.href) {
    return (
      <a href={channel.href} className={className}>
        <span className="absolute top-8 left-0 size-2.5 rounded-full bg-[#ff6b00] ring-4 ring-[#ff6b00]/20" />
        {body}
      </a>
    );
  }

  return (
    <div className={className}>
      <span className="absolute top-8 left-0 size-2.5 rounded-full bg-[#ff6b00] ring-4 ring-[#ff6b00]/20" />
      {body}
    </div>
  );
}

export function ContactInfo({ copy }: ContactInfoProps) {
  const channels: Channel[] = [
    {
      index: "01",
      icon: Phone,
      title: copy.callTitle,
      lines: [copy.callDescription, copy.storePhone],
      href: `tel:${copy.storePhone}`,
    },
    {
      index: "02",
      icon: Mail,
      title: copy.writeTitle,
      lines: [copy.writeDescription, copy.storeEmail],
      href: `mailto:${copy.storeEmail}`,
    },
    {
      index: "03",
      icon: MapPin,
      title: copy.hqTitle,
      lines: [copy.storeAddress, copy.storeAddressSecondary],
    },
    {
      index: "04",
      icon: Clock3,
      title: copy.hoursTitle,
      lines: [copy.hoursWeekdays, copy.hoursDelivery],
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
