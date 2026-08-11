import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Faq — static Q&A near the bottom of the homepage to handle common
 * objections before the closing call-to-action. Reuses the Accordion primitive
 * so the open/close behaviour and a11y come for free.
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
] as const;

export function Faq() {
  return (
    <section className="w-full px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-center font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Frequently asked questions
        </h2>

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
