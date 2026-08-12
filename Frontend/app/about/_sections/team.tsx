import { TEAM } from "@/lib/team";

/**
 * Team — the five people behind Nkoso, shown on /about.
 *
 * Cards use initial-based avatars (no member photos yet) in a soft amber fill
 * with dark amber text, matching the app's badge treatment (DESIGN.md) rather
 * than reaching for a new accent color.
 */
function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export function Team() {
  return (
    <section id="team" className="w-full scroll-mt-28 px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-2">
          <span className="text-sm font-medium text-primary">The team</span>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Meet the people behind Nkoso
          </h2>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member) => (
            <li
              key={member.name}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6"
            >
              <div
                aria-hidden="true"
                className="flex size-12 items-center justify-center rounded-full bg-primary-foreground/10 text-sm font-semibold text-primary-foreground"
              >
                {initials(member.name)}
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="font-heading text-base font-medium text-foreground">
                  {member.name}
                </h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}