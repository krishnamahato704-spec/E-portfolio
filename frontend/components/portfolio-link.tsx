"use client";

import Link, { useLinkStatus } from "next/link";
import { createPortal } from "react-dom";
import type { ComponentProps } from "react";

function NavigationFeedback() {
  const { pending } = useLinkStatus();
  return pending
    ? createPortal(
        <div className="navigation-feedback" role="status">
          <span className="sr-only">Opening the next page…</span>
        </div>,
        document.body,
      )
    : null;
}

export default function PortfolioLink({
  children,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <NavigationFeedback />
    </Link>
  );
}
