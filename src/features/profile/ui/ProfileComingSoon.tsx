import { PROFILE_PANEL } from "@/features/profile/ui/profile-ui-classes";

type ProfileComingSoonProps = {
  title: string;
  message: string;
};

export function ProfileComingSoon({ title, message }: ProfileComingSoonProps) {
  return (
    <section className={`${PROFILE_PANEL} profile-sheet-keep-frame`}>
      <h1 className="font-display mb-3 text-3xl leading-[0.9] text-[#1e1e1e] uppercase sm:text-4xl">
        {title}
      </h1>
      <p className="text-sm leading-relaxed text-[#1e1e1e]/65 sm:text-base">
        {message}
      </p>
    </section>
  );
}
