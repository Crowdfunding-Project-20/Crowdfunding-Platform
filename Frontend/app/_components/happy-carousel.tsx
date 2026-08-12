"use client";

import { useLayoutEffect, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

/**
 * HappyCarousel — an "oval belt" image carousel built with GSAP.
 *
 * Six `happy*.jpg` images travel along a shallow ellipse: a card reaches the
 * front (bottom of the ellipse), slides leftward, recedes to the back-top,
 * travels rightward across the back, and comes forward again at the right
 * edge — a continuous conveyor moving right→left.
 *
 * One looping tween drives a single `rot` value (0 → 2π); `onUpdate`
 * repositions every card via cos/sin + a depth term for scale/opacity/zIndex.
 * Pauses on pointer hover and on keyboard focus, honors `prefers-reduced-motion`
 * (rendering a static belt frame), resizes with the viewport, and cleans itself
 * up on unmount.
 */

const IMAGES = [
  "/happy1.jpg",
  "/happy2.jpg",
  "/happy3.jpg",
  "/happy4.jpg",
  "/happy5.jpg",
  "/happy6.jpg",
];

// useLayoutEffect on the client (first position() runs before paint → no flash
// of stacked cards); useEffect on the server to silence the SSR warning.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function HappyCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

  useIsomorphicLayoutEffect(() => {
    const stage = containerRef.current;
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!stage || cards.length === 0) return;

    const N = cards.length;

    // Keep each card centered on its computed (x,y) point — set once.
    gsap.set(cards, { xPercent: -50, yPercent: -50 });

    // Ellipse radii derived from the stage so the belt rescales with the viewport.
    const measure = () => {
      const r = stage.getBoundingClientRect();
      // Flatter, wider spread on narrow screens so the front cards breathe
      // instead of piling up on a phone.
      const a = r.width * (r.width < 480 ? 0.46 : 0.42);
      return { a, b: r.height * 0.18 };
    };

    let { a, b } = measure();

    const position = (rot: number) => {
      for (let i = 0; i < N; i++) {
        const theta = rot + (i / N) * Math.PI * 2;
        const x = a * Math.cos(theta);
        const y = b * Math.sin(theta);
        // sin(theta) = 1 at front-bottom (depth 1), -1 at back-top (depth 0)
        const depth = (Math.sin(theta) + 1) / 2;
        const scale = 0.65 + depth * 0.45;
        const opacity = 0.45 + depth * 0.55;
        const zIndex = Math.round(depth * 100);
        gsap.set(cards[i], { x, y, scale, opacity, zIndex });
      }
    };

    const state = { rot: 0 };

    position(0);

    // Reposition on resize in every path — the static belt still re-measures.
    const onResize = () => {
      ({ a, b } = measure());
      position(state.rot);
    };
    window.addEventListener("resize", onResize);

    const reduceMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced-motion users get the belt as a single static frame: positioned
    // once above, never animated, and no pause controls to wire up.
    if (reduceMotion) {
      return () => window.removeEventListener("resize", onResize);
    }

    const tween = gsap.to(state, {
      rot: Math.PI * 2,
      duration: 24,
      ease: "none",
      repeat: -1,
      onUpdate: () => position(state.rot),
    });

    // Pause on pointer hover AND on keyboard focus; resume only once both
    // conditions have cleared. Making the belt keyboard-reachable lets anyone
    // stop the loop (WCAG 2.2.2 — auto-moving content must be pausable).
    let focusPaused = false;
    let hoverPaused = false;
    const sync = () =>
      focusPaused || hoverPaused ? tween.pause() : tween.resume();
    const onEnter = () => {
      hoverPaused = true;
      sync();
    };
    const onLeave = () => {
      hoverPaused = false;
      sync();
    };
    const onFocusIn = () => {
      focusPaused = true;
      sync();
    };
    const onFocusOut = () => {
      focusPaused = false;
      sync();
    };
    stage.addEventListener("mouseenter", onEnter);
    stage.addEventListener("mouseleave", onLeave);
    stage.addEventListener("focusin", onFocusIn);
    stage.addEventListener("focusout", onFocusOut);

    return () => {
      tween.kill();
      stage.removeEventListener("mouseenter", onEnter);
      stage.removeEventListener("mouseleave", onLeave);
      stage.removeEventListener("focusin", onFocusIn);
      stage.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // The belt is decorative (empty-alt images) but auto-moving, so it gets a
  // keyboard focus target: tabbing to it pauses the loop (see the effect above).
  return (
    <section
      aria-label="Community highlights"
      tabIndex={0}
      className="relative h-[66vh] w-full overflow-hidden focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
    >
      <div ref={containerRef} className="absolute inset-0">
        {IMAGES.map((src, i) => (
          <div
            key={src}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className="absolute left-1/2 top-1/2"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <Image
                src={src}
                alt=""
                width={220}
                height={300}
                priority={i < 2}
                className="h-[220px] w-[150px] object-cover sm:h-[300px] sm:w-[220px]"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
