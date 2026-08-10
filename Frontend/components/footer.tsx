import { Heart } from "@phosphor-icons/react/dist/ssr";

const GROUP_MEMBERS = [
  "Zita Adinkrah",
  "Annie Gamadi",
  "Vida Kwegyireba",
  "Andrea Qua-Enoo",
  "Yaa Konadu",
];

/**
 * Site-wide footer.
 *
 * Warm, community-driven footer that echoes the rounded, centered layout of
 * the reference image while staying true to the project's design tokens and
 * light/dark theme support.
 */
export function Footer() {
  return (
    <footer className="mt-auto w-full rounded-t-[2.5rem] border-t border-border bg-primary/10 dark:bg-primary/15">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Group members */}
        <div className="flex flex-col items-center gap-6 sm:gap-8">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Group members
          </h2>

          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-x-8">
            {GROUP_MEMBERS.map((name) => (
              <li
                key={name}
                className="text-base sm:text-lg text-muted-foreground transition-colors hover:text-foreground"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-8">
          <div className="flex items-center gap-2">
            <Heart weight="fill" className="size-5 text-primary" />
            <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
              Nkoso-Crowdfunding
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            &copy; 2026 Nkoso-Crowdfunding
          </p>
        </div>
      </div>
    </footer>
  );
}
