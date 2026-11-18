"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";

/**
 * The footer notch: a link into the Tea Experience page.
 *
 * Deliberately legible rather than "quiet architecture" — the first version used
 * a --bg disc on a --card footer (~6% contrast, no label) and the owner could not
 * find it. The accent fill plus the word BREW is the affordance; the notch is
 * just the frame.
 */
export default function BrewLauncher() {
  return (
    <div className="brew-lip">
      <Link href="/experience" aria-label="Open the tea experience" className="brew-lip-button">
        <span className="brew-lip-disc">
          <Leaf size={20} strokeWidth={2} aria-hidden />
        </span>
        <span className="brew-lip-label">Brew</span>
      </Link>
    </div>
  );
}
