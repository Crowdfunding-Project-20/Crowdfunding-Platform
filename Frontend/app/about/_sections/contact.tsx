import { EnvelopeSimple, MapPin, Clock } from "@phosphor-icons/react/dist/ssr";

/**
 * Contact — static "get in touch" cards on /about.
 *
 * No backend endpoint exists for messaging, so this is intentionally
 * frontend-only: cards with mailto links (team inbox, support) and a bit of
 * scene-setting. Email addresses below are placeholders — swap in real ones
 * before shipping.
 */
const CONTACT_CARDS = [
  {
    icon: EnvelopeSimple,
    title: "Team inbox",
    body: "Questions, ideas, or just to say hi — we read everything.",
    href: "mailto:hello@nkoso.com",
    cta: "Email hello@nkoso.com",
  },
  {
    icon: Clock,
    title: "Support",
    body: "Stuck on a campaign or a donation? We'll help get you unstuck.",
    href: "mailto:support@nkoso.com",
    cta: "Email support@nkoso.com",
  },
  {
    icon: MapPin,
    title: "Based in",
    body: "Built and run by a small, close-knit team learning in public.",
    href: "mailto:hello@nkoso.com",
    cta: "Say hello",
  },
] as const;

export function Contact() {
  return (
    <section id="contact" className="w-full scroll-mt-28 px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-2">
          <span className="text-sm font-medium text-primary">Get in touch</span>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            We&apos;d love to hear from you
          </h2>
        </div>

        <ul className="grid gap-4 sm:grid-cols-3">
          {CONTACT_CARDS.map((card) => (
            <li
              key={card.title}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
            >
              <card.icon
                weight="duotone"
                className="size-6 text-primary-foreground/80"
              />
              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-base font-medium text-foreground">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {card.body}
                </p>
              </div>
              <a
                href={card.href}
                className="mt-auto inline-flex w-fit items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {card.cta}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}