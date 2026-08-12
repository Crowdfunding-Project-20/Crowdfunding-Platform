"use client";

import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { HappyCarousel } from "./_components/happy-carousel";
import { DiscoverCampaigns } from "./_components/discover-campaigns";
import { HowItWorks } from "./_components/how-it-works";
import { AboutTeaser } from "./_components/about-teaser";
import { Faq } from "./_components/faq";
import { ClosingCta } from "./_components/closing-cta";

/**
 * Home page — hero + community carousel + how-it-works + discover fundraisers
 * + about teaser + FAQ + closing CTA.
 *
 * The hero is context-aware: logged-in users go straight to creating a campaign;
 * visitors land on signup first. Below it, the HappyCarousel belt showcases the
 * community across the six `happy` images, HowItWorks explains the flow,
 * DiscoverCampaigns shows a bento grid of active campaigns, the AboutTeaser
 * introduces the team and links to /about, and the FAQ + ClosingCta round the
 * page out.
 */
export default function Home() {
  const { user } = useAuth();

  const ctaHref = user ? "/campaigns/new" : "/signup";

  return (
    <main className="flex flex-col">
      <section className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex max-w-2xl flex-col items-center gap-10">
          <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Want to raise money? We make it easy.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Start a campaign and let your community rally behind your idea.
          </p>
          <Button
            size="lg"
            nativeButton={false}
            className="h-12 rounded-full px-8 text-base"
            render={<Link href={ctaHref} />}
          >
            Start raising funds
          </Button>
        </div>
      </section>

      <HappyCarousel />

      <HowItWorks />

      <DiscoverCampaigns />

      <AboutTeaser />

      <Faq />

      <ClosingCta />
    </main>
  );
}
