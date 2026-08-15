"use client";

import { annotate } from "rough-notation";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

import {
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import { useAdminSidebarCollapse } from "@/features/admin/ui/AdminSidebarCollapseContext";

const SIDEBAR_WIDTH_MS = 240;

type AdminPageHeadingProps = {
  title: string;
  description?: string;
  className?: string;
};

export function AdminPageHeading({
  title,
  description,
  className,
}: AdminPageHeadingProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const reduceMotion = useReducedMotion();
  const { collapsed } = useAdminSidebarCollapse();

  useEffect(() => {
    const titleEl = titleRef.current;
    if (!titleEl) {
      return;
    }
    const heading: HTMLHeadingElement = titleEl;

    function paint(): ReturnType<typeof annotate> {
      const mark = annotate(heading, {
        type: "highlight",
        color: "#ffd54a",
        animate: !reduceMotion,
        animationDuration: 800,
      });
      mark.show();
      return mark;
    }

    let mark = paint();
    const timer = window.setTimeout(() => {
      mark.remove();
      mark = paint();
    }, SIDEBAR_WIDTH_MS);

    return () => {
      window.clearTimeout(timer);
      mark.remove();
    };
  }, [reduceMotion, title, collapsed]);

  return (
    <div className={className}>
      <h1 ref={titleRef} className={ADMIN_PAGE_TITLE}>
        {title}
      </h1>
      {description ? (
        <p className={`mt-3 ${ADMIN_PAGE_SUBTITLE}`}>{description}</p>
      ) : null}
    </div>
  );
}
