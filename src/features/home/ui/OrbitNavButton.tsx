'use client';

import { motion } from 'motion/react';

type OrbitNavButtonProps = {
  disabled: boolean;
  reduceMotion: boolean | null;
  src: string;
  label: string;
  onClick: () => void;
};

const BUTTON_MOVE = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function OrbitNavButton({
  disabled,
  reduceMotion,
  src,
  label,
  onClick,
}: OrbitNavButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="size-[51px] shrink-0 cursor-pointer overflow-hidden rounded-full disabled:pointer-events-none"
      whileHover={reduceMotion ? undefined : { scale: 1.03 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={BUTTON_MOVE}
    >
      {/* SVG brand asset — next/image not required */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={51} height={51} className="size-full" draggable={false} />
    </motion.button>
  );
}
