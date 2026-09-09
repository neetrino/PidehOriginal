'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const ROLL_TRANSITION = { duration: 0.42, ease: [0.16, 1, 0.3, 1] } as const;
/** Units roll first, higher digits follow — reads like an odometer. */
const DIGIT_STAGGER_S = 0.04;

type ProductPriceFlowProps = {
  /** Base amount, used only to pick the roll direction. */
  amount: number;
  formatted: string;
  className?: string;
};

function lastDigitIndex(chars: readonly string[]): number {
  for (let index = chars.length - 1; index >= 0; index -= 1) {
    const char = chars[index];
    if (char !== undefined && /\d/.test(char)) {
      return index;
    }
  }

  return chars.length - 1;
}

/**
 * Rolls each digit of the product total — upwards when the price grows and
 * downwards when it shrinks. Animates the already formatted string so the
 * grouping and currency symbol stay identical to the compare-at price.
 */
export function ProductPriceFlow({ amount, formatted, className = '' }: ProductPriceFlowProps) {
  const previousAmount = useRef(amount);
  const reduceMotion = useReducedMotion();
  const direction = amount < previousAmount.current ? -1 : 1;
  previousAmount.current = amount;

  if (reduceMotion) {
    return <span className={className}>{formatted}</span>;
  }

  const chars = [...formatted];
  const unitsIndex = lastDigitIndex(chars);

  return (
    <span className={`inline-flex tabular-nums ${className}`}>
      <span className="sr-only">{formatted}</span>
      <span aria-hidden="true" className="inline-flex">
        {chars.map((char, index) => (
          <RollingChar
            key={index}
            char={char}
            direction={direction}
            delay={Math.max(unitsIndex - index, 0) * DIGIT_STAGGER_S}
          />
        ))}
      </span>
    </span>
  );
}

type RollingCharProps = {
  char: string;
  direction: number;
  delay: number;
};

function RollingChar({ char, direction, delay }: RollingCharProps) {
  if (!/\d/.test(char)) {
    return <span className="whitespace-pre">{char}</span>;
  }

  return (
    <span className="relative inline-block overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          className="inline-block"
          initial={{ y: `${direction * 105}%`, opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: `${direction * -105}%`, opacity: 0 }}
          transition={{ ...ROLL_TRANSITION, delay }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
