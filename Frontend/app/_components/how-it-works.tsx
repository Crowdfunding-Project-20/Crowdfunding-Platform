import {
  HandCoins,
  Megaphone,
  PencilSimpleLine,
} from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@/components/ui/badge";

/**
 * HowItWorks — static three-step explainer between the community carousel and
 * the discover grid. Teaches the flow right before visitors can act on it.
 *
 * Icons stay muted so the single amber CTA of this "screen" (the hero) keeps
 * its emphasis — middle sections carry no saturated accent (see DESIGN.md).
 */
const STEPS = [
  {
    tag: "Step 1",
    icon: PencilSimpleLine,
    title: "Start a campaign",
    body: "Tell your story, set a goal, and add a photo. It all comes together in a few minutes.",
  },
  {
    tag: "Step 2",
    icon: Megaphone,
    title: "Share with your community",
    body: "Send the link to friends and family, and let your people spread the word.",
  },
  {
    tag: "Step 3",
    icon: HandCoins,
    title: "Receive funds",
    body: "Watch donations come in, then withdraw what you've raised when you're ready.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="w-full px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            How it works
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
            Start a campaign in minutes, and let your community rally behind your
            idea.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.tag}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6"
            >
              <Badge variant="secondary" className="w-fit">
                {step.tag}
              </Badge>
              <step.icon weight="duotone" className="size-6 text-foreground/70" />
              <h3 className="font-heading text-lg font-medium text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
