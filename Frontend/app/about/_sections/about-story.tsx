import { HandHeart, Sparkle, UsersThree, SealCheck } from "@phosphor-icons/react/dist/ssr";

/**
 * AboutStory — the "About Nkoso" section on /about.
 *
 * Two-column on desktop: the founding story beside a compact "what we stand
 * for" list. Icons stay muted so the page keeps its calm, community tone —
 * this is an editorial section, not a conversion surface (see DESIGN.md).
 */
const VALUES = [
  {
    icon: UsersThree,
    title: "Community first",
    body: "Campaigns are won by people, not pixels. We build for the rally, not just the click.",
  },
  {
    icon: Sparkle,
    title: "Simple by design",
    body: "No fine print, no dark patterns. If a fee exists, you'll see it before you pay it.",
  },
  {
    icon: SealCheck,
    title: "Trusted by default",
    body: "Creators stay in control of their funds, and backers always see where their money lands.",
  },
  {
    icon: HandHeart,
    title: "Every act counts",
    body: "Small donations move the world too. We celebrate the $5 that starts a movement as much as the big gift.",
  },
] as const;

export function AboutStory() {
  return (
    <section id="story" className="w-full scroll-mt-28 px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-2 md:items-start md:gap-12">
          {/* Story */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-primary">Our story</span>
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                About Nkoso
              </h2>
            </div>
            <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                Nkoso started with a simple observation: raising money for the
                things you care about is harder than it should be. Forms were
                long, fees were hidden, and the whole process felt less like
                community and more like a product.
              </p>
              <p>
                So we built the platform we wished existed. A place where
                anyone — a student, a neighbour, a small team — can start a
                campaign in minutes and watch their community show up for it,
                one heartfelt donation at a time.
              </p>
              <p>
                We&apos;re small, and we like it that way. It lets us obsess over the
                details that make people feel at home: honest numbers, warm
                words, and a flow that never asks you to jump through hoops to
                do a good thing.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="flex flex-col gap-3">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="flex gap-4 rounded-xl border border-border bg-card p-5"
              >
                <value.icon weight="duotone" className="mt-0.5 size-6 shrink-0 text-foreground/70" />
                <div className="flex flex-col gap-1">
                  <h3 className="font-heading text-base font-medium text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{value.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}