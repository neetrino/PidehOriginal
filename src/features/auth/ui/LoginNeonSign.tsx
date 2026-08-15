"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import { useRef } from "react";

import "@/features/auth/ui/login-auth.css";

gsap.registerPlugin(useGSAP);

type LoginNeonSignProps = {
  label: string;
};

export function LoginNeonSign({ label }: LoginNeonSignProps) {
  const signRef = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      const sign = signRef.current;
      if (reduceMotion || !sign) {
        return;
      }
      gsap.to(sign, {
        opacity: 0.72,
        duration: 0.08,
        repeat: -1,
        yoyo: true,
        repeatDelay: 2.4,
        ease: "none",
      });
    },
    { dependencies: [reduceMotion] },
  );

  return (
    <p
      ref={signRef}
      className="login-neon font-display text-center text-[clamp(4.5rem,14vw,9rem)] leading-[0.78] uppercase lg:text-left lg:[writing-mode:vertical-rl] lg:rotate-180"
    >
      {label}
    </p>
  );
}
