const steps = [
  { number: '01', icon: '✦', title: 'Name the change', text: 'Share what matters—an urgent need, a bright idea, or a community goal.' },
  { number: '02', icon: '↗', title: 'Bring in your people', text: 'Invite friends, family, and neighbours to make the first wave of support.' },
  { number: '03', icon: '◒', title: 'Build momentum', text: 'Post updates, celebrate milestones, and turn every contribution into a shared win.' },
  { number: '04', icon: '⌁', title: 'Watch impact grow', text: 'Use simple analytics to see your reach, progress, and supporter energy in one place.' },
]

export default function HowItWorks({ onAnalytics }) {
  return (
    <section id="how-it-works" className="bg-[#fff7e8] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#bd613d]">
            Fundraising with Nkoso
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-[-.045em] text-[#173f35] sm:text-5xl">
            A clear progression from launch to impact.
          </h2>
          <p className="mt-5 max-w-xl mx-auto leading-7 text-[#617067]">
            Follow a simple campaign journey that helps you name your cause, gather supporters, build momentum, and celebrate the change you make together.
          </p>
        </div>
        <div className="mt-12 overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_24px_60px_rgba(23,63,53,.08)] sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[.88fr_1.12fr] lg:items-start">
            <div className="rounded-[1.75rem] bg-[#eef4eb] p-8 text-[#173f35] shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#588063]">
                Step by step
              </p>
              <h3 className="mt-4 text-3xl font-black tracking-[-.04em]">
                A progression map for every fundraiser.
              </h3>
              <p className="mt-5 leading-7 text-[#617067]">
                Each stage in Nkoso is designed to help your campaign gain clarity, momentum, and measurable support from the people who care.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {steps.map((step) => (
                <div key={step.number} className="rounded-[1.75rem] border border-[#e8f0e5] bg-[#fbf7f1] p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f0e5] text-xl font-black text-[#173f35]">
                      {step.number}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[.2em] text-[#8a9a8d]">
                      Stage
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-black text-[#173f35]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#617067]">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={onAnalytics}
          className="mt-8 inline-flex items-center gap-2 text-sm font-black text-[#276246] hover:text-[#e86f42]"
        >
          See how progress looks in Nkoso <span className="text-xl">→</span>
        </button>
      </div>
    </section>
  )
}
