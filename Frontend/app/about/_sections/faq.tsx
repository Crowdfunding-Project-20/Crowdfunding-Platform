"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * AboutFaq — the fuller FAQ on /about (longer than the homepage teaser FAQ).
 *
 * Same Accordion primitive and warm tone as the homepage section, expanded to
 * cover getting-started, fees, and withdrawals with a bit more depth.
 */
const ITEMS = [
  {
    q: "What does it cost to start a campaign?",
    a: "It's free to start a campaign. You only pay a small platform fee on the money you actually raise, so there's nothing to lose by trying.",
  },
  {
    q: "How do I receive the money I raise?",
    a: "Donations collect on your campaign automatically. Once your goal comes together, you can withdraw the available balance to your linked account from your creator dashboard.",
  },
  {
    q: "Is there a platform fee?",
    a: "Yes. A small percentage of each donation goes toward keeping the platform running. You'll see it clearly in the estimate before you fund a campaign.",
  },
  {
    q: "Who can back a campaign?",
    a: "Anyone is welcome to back a campaign. Just create an account, pick a fundraiser you believe in, and contribute what feels right for you.",
  },
  {
    q: "Can I withdraw before reaching my goal?",
    a: "You can withdraw whatever is currently available in your balance whenever you need it — you don't have to wait until you hit your full goal.",
  },
  {
    q: "What happens if my campaign doesn't reach its goal?",
    a: "You keep everything that was raised. There's no all-or-nothing threshold, so the funds your community gives you stay available to withdraw even if the goal isn't met.",
  },
  {
    q: "How do I get my money out?",
    a: "From your creator dashboard, choose the campaign and the amount you'd like to withdraw. The money moves from your campaign's balance when you confirm.",
  },
] as const;

export function AboutFaq() {
  return (
    <section id="faq" className="w-full scroll-mt-28 px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-2">
          <span className="text-sm font-medium text-primary">Questions</span>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Frequently asked questions
          </h2>
        </div>

        <Accordion>
          {ITEMS.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}