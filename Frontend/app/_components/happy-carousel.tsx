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
 * Pauses on hover, resizes with the viewport, and cleans itself up on unmount.
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
      return { a: r.width * 0.42, b: r.height * 0.18 };
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

    const tween = gsap.to(state, {
      rot: Math.PI * 2,
      duration: 24,
      ease: "none",
      repeat: -1,
      onUpdate: () => position(state.rot),
    });

    position(0);

    // Pause on hover, resume on leave.
    const onEnter = () => tween.pause();
    const onLeave = () => tween.resume();
    stage.addEventListener("mouseenter", onEnter);
    stage.addEventListener("mouseleave", onLeave);

    // Recompute radii on resize and reposition immediately.
    const onResize = () => {
      ({ a, b } = measure());
      position(state.rot);
    };
    window.addEventListener("resize", onResize);

    return () => {
      tween.kill();
      stage.removeEventListener("mouseenter", onEnter);
      stage.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section
      aria-label="Community highlights"
      className="relative h-[66vh] w-full overflow-hidden"
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
                className="h-[260px] w-[190px] object-cover sm:h-[300px] sm:w-[220px]"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
