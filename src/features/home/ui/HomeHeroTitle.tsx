'use client';

import { motion, useReducedMotion } from 'motion/react';

type HomeHeroTitleProps = {
  line1?: string;
  line2: string;
  className?: string;
};

const TITLE_STYLE = {
  fontSize: 'clamp(3.5rem, 12vw, 215px)',
  lineHeight: 0.85,
  letterSpacing: 0,
} as const;

function HeroTitleLine({
  text,
  className,
  delay,
}: {
  text: string;
  className: string;
  delay: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <span
      className={`${className} block w-full overflow-hidden pt-[0.18em] pb-[0.1em]`}
      style={TITLE_STYLE}
    >
      <motion.span
        key={text}
        className="block"
        initial={reduceMotion ? false : { y: '110%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {text}
      </motion.span>
    </span>
  );
}

/**
 * Hero pide wordmark. `line1` is the old White Shop line and stays off
 * unless explicitly passed.
 */
export function HomeHeroTitle({ line1, line2, className = '' }: HomeHeroTitleProps) {
  return (
    <h1 className={`font-display text-center whitespace-nowrap ${className}`}>
      {line1 ? (
        <HeroTitleLine
          text={line1}
          className="pideh-hero-title-line1 relative z-[1] text-white"
          delay={0.05}
        />
      ) : null}
      <HeroTitleLine
        text={line2}
        className="pideh-hero-title-line2 relative z-[30] text-[#ffd64d]"
        delay={line1 ? 0.14 : 0.05}
      />
    </h1>
  );
}
