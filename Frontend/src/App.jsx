import { useMemo, useState, useEffect } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import HowItWorks from "./components/HowItWorks";
import AnalyticsPage from "./pages/AnalyticsPage";
import ImpactPage from "./pages/ImpactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import { AuthProvider, useAuth } from "./context/AuthContext";

const campaigns = [
  {
    title: "Bring clean water to Nkwanta",
    category: "Community",
    raised: "GH₵ 18,420",
    goal: "GH₵ 25,000",
    percent: 74,
    image:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80",
    people: "128 supporters",
  },
  {
    title: "Help Ama return to school",
    category: "Education",
    raised: "GH₵ 9,850",
    goal: "GH₵ 15,000",
    percent: 66,
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
    people: "76 supporters",
  },
  {
    title: "A studio for Kofi’s art class",
    category: "Creative",
    raised: "GH₵ 5,205",
    goal: "GH₵ 12,000",
    percent: 43,
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80",
    people: "49 supporters",
  },
];
const categories = [
  "All causes",
  "Community",
  "Education",
  "Medical",
  "Creative",
];

function Arrow() {
  return (
    <span aria-hidden="true" className="text-xl leading-none">
      →
    </span>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HomeHero({ onStart, onDiscover }) {
  return (
    <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-7 sm:px-8 sm:pb-24 lg:grid lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-16 lg:pt-14">
      <div className="absolute -left-20 top-8 h-64 w-64 rounded-full bg-[#f7d875]/35 blur-3xl" />
      <div className="relative">
        <p className="mb-5 inline-flex rounded-full border border-[#d5e3d4] bg-[#f1f7ef] px-3 py-1.5 text-xs font-bold uppercase tracking-[.14em] text-[#39714c]">
          A better way to give together
        </p>
        <h1 className="max-w-xl font-display text-5xl font-bold leading-[.97] tracking-[-.055em] text-[#173f35] sm:text-7xl">
          Make a difference that feels{" "}
          <em className="font-normal text-[#d86d45]">close.</em>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-[#52635a] sm:text-lg">
          Nkoso brings people together to fund the hopes, emergencies, and
          bright ideas shaping our communities.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onStart}
            className="rounded-full bg-[#e86f42] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(232,111,66,.25)] transition hover:-translate-y-0.5"
          >
            Start a fundraiser <Arrow />
          </button>
          <button
            onClick={onDiscover}
            className="rounded-full border border-[#cbd7cc] px-6 py-3.5 text-sm font-bold"
          >
            Explore causes
          </button>
        </div>
        <div className="mt-10 flex gap-7 text-sm">
          <div>
            <strong className="block text-2xl text-[#173f35]">8,400+</strong>
            <span className="text-[#65756b]">kind supporters</span>
          </div>
          <div className="border-l border-[#d7ded7] pl-7">
            <strong className="block text-2xl text-[#173f35]">GH₵ 2.6m</strong>
            <span className="text-[#65756b]">raised for good</span>
          </div>
        </div>
      </div>
      <div className="relative mt-12 lg:mt-0">
        <div className="relative overflow-hidden rounded-[2.25rem] bg-[#dfeadd] p-3 shadow-[0_22px_60px_rgba(28,61,45,.16)]">
          <img
            className="h-[360px] w-full rounded-[1.65rem] object-cover sm:h-[470px]"
            src="https://images.unsplash.com/photo-1489493512598-d08130f49bea?auto=format&fit=crop&w=1200&q=85"
            alt="Children smiling outdoors"
          />
          <div className="absolute bottom-8 left-8 right-8 rounded-2xl bg-white/95 p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-[#4e6254]">
              <span>Community garden, Kumasi</span>
              <span>82%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e6ede5]">
              <div className="h-full w-[82%] rounded-full bg-[#e86f42]" />
            </div>
            <p className="mt-3 text-sm font-bold">
              GH₵ 41,120 raised{" "}
              <span className="font-normal text-[#66766b]">of GH₵ 50,000</span>
            </p>
          </div>
        </div>
        <div className="absolute -bottom-5 -left-3 rounded-2xl bg-[#173f35] px-4 py-3 text-sm text-white shadow-xl sm:-left-8">
          <span className="mr-2 text-[#f5c65d]">✦</span>
          <strong>247</strong> people gave today
        </div>
      </div>
    </section>
  );
}

function PageBanner({ title, description, ctaLabel, onCta }) {
  return (
    <section className="bg-[#f1f6ef] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#588063]">
          Nkoso support
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[-.04em] text-[#173f35] sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#65756b]">
          {description}
        </p>
        {ctaLabel && (
          <button
            onClick={onCta}
            className="mt-8 rounded-full bg-[#e86f42] px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(232,111,66,.25)] transition hover:-translate-y-0.5"
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </section>
  )
}

function FeaturedCampaigns({ onDiscover }) {
  return (
    <section className="bg-[#fffdf8] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#588063]">
              Featured fundraisers
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-[-.04em] text-[#173f35] sm:text-5xl">
              Fundraisers ready for support today
            </h2>
          </div>
          <button
            onClick={onDiscover}
            className="rounded-full border border-[#cbd7cc] bg-white px-6 py-3 text-sm font-bold text-[#173f35] transition hover:border-[#173f35] hover:text-[#173f35]"
          >
            Explore all causes
          </button>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {campaigns.map((campaign) => (
            <article
              key={campaign.title}
              className="overflow-hidden rounded-[2rem] bg-white shadow-[0_16px_40px_rgba(23,63,53,.08)]"
            >
              <img
                src={campaign.image}
                alt={campaign.title}
                className="h-56 w-full object-cover"
              />
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#63826a]">
                  {campaign.category}
                </p>
                <h3 className="mt-3 text-xl font-bold text-[#173f35]">
                  {campaign.title}
                </h3>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e8eee7]">
                  <div
                    className="h-full rounded-full bg-[#e86f42]"
                    style={{ width: `${campaign.percent}%` }}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between text-sm font-bold text-[#173f35]">
                  <span>{campaign.raised}</span>
                  <span>{campaign.percent}%</span>
                </div>
                <p className="mt-2 text-sm text-[#758279]">
                  {campaign.people}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhotoStories() {
  const photos = [
    {
      title: "Hands that help",
      description: "Supporters and organisers working side by side.",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Community celebration",
      description: "Small victories become shared milestones.",
      image:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "A brighter tomorrow",
      description: "Every fundraiser builds momentum toward real change.",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    },
  ];

  return (
    <section className="bg-[#fffdf8] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#588063]">
            Photo stories
          </p>
          <h2 className="font-display text-4xl font-bold tracking-[-.04em] text-[#173f35] sm:text-5xl">
            See how support looks in real life.
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-7 text-[#65756b]">
            A few moments from communities, fundraisers, and supporters who are moving good ideas forward.
          </p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {photos.map((photo) => (
            <article key={photo.title} className="overflow-hidden rounded-[2rem] bg-white shadow-[0_16px_40px_rgba(23,63,53,.08)]">
              <div className="h-72 overflow-hidden">
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black text-[#173f35]">{photo.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#617067]">{photo.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalPhotoCTA({ onStart }) {
  return (
    <section className="relative overflow-hidden bg-[#f5f2eb] py-16 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(40,75,61,0.12),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(238,204,154,0.15),_transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 rounded-[2.25rem] bg-white/95 p-6 shadow-[0_24px_60px_rgba(23,63,53,.08)] sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10">
          <div className="flex flex-col justify-center gap-5 text-[#173f35]">
            <p className="inline-flex rounded-full bg-[#e9f4e8] px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-[#3f6b55]">
              Feel the momentum
            </p>
            <div>
              <h2 className="font-display text-4xl font-black tracking-[-.04em] text-[#173f35] sm:text-5xl">
                Bring your story to life.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#5f7567] sm:text-lg">
                One warm image helps visitors connect faster. Keep the message simple and let the moment speak.
              </p>
            </div>
            <button
              onClick={onStart}
              className="w-fit rounded-full bg-[#e86f42] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(232,111,66,.25)] transition hover:-translate-y-0.5"
            >
              Start a fundraiser
            </button>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-[#e6e1d6] shadow-[0_20px_60px_rgba(23,63,53,.08)]">
            <img
              src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"
              alt="Volunteers holding hands outside in a natural community setting"
              className="h-96 w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState("All causes");
  const [query, setQuery] = useState("");
  const visibleCampaigns = useMemo(
    () =>
      campaigns.filter(
        (campaign) =>
          (activeCategory === "All causes" ||
            campaign.category === activeCategory) &&
          campaign.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [activeCategory, query],
  );
  return (
    <section className="bg-[#f1f6ef] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#588063]">
          Discover fundraisers
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-[-.04em] text-[#173f35] sm:text-5xl">
          Stories moving us forward
        </h1>
        <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${activeCategory === category ? "bg-[#173f35] text-white" : "bg-white text-[#52635a] ring-1 ring-[#dae3d8]"}`}
            >
              {category}
            </button>
          ))}
        </div>
        <label className="mt-5 flex max-w-md items-center gap-3 rounded-xl bg-white px-4 py-3 text-[#6a796f] shadow-sm ring-1 ring-[#dce5da]">
          <SearchIcon />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#87958b]"
            placeholder="Search a fundraiser"
          />
        </label>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {visibleCampaigns.map((campaign) => (
            <article
              key={campaign.title}
              className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_18px_rgba(36,65,45,.07)]"
            >
              <img
                src={campaign.image}
                alt=""
                className="h-48 w-full object-cover"
              />
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[.12em] text-[#63826a]">
                  {campaign.category}
                </p>
                <h2 className="mt-2 text-lg font-bold leading-6">
                  {campaign.title}
                </h2>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e8eee7]">
                  <div
                    className="h-full rounded-full bg-[#e86f42]"
                    style={{ width: `${campaign.percent}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-bold">
                  {campaign.raised}{" "}
                  <span className="font-normal text-[#758279]">
                    raised of {campaign.goal}
                  </span>
                </p>
                <p className="mt-1 text-xs text-[#758279]">{campaign.people}</p>
              </div>
            </article>
          ))}
        </div>
        {visibleCampaigns.length === 0 && (
          <p className="py-8 text-center text-[#65756b]">
            No campaigns match that search yet.
          </p>
        )}
      </div>
    </section>
  );
}

function ImpactSection({ onAnalytics }) {
  return (
    <section className="bg-[#f4f5ef] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#588063]">
            Our impact
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-[-.04em] text-[#173f35] sm:text-5xl">
            Real stories that show us what progress looks like.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#617067] sm:text-lg">
            Nkoso brings fundraisers and communities together with clear goals, visible momentum, and everyday wins people can feel proud of.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
          <div className="rounded-[2rem] bg-white p-8 shadow-[0_24px_60px_rgba(23,63,53,.08)]">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-[#e6ece3] bg-[#eef4eb] p-6">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#39714c]">
                  Total raised
                </p>
                <p className="mt-4 text-3xl font-black text-[#173f35]">GH₵ 2.6m</p>
                <p className="mt-2 text-sm text-[#617067]">Funding community-led causes.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#e6ece3] bg-[#eef4eb] p-6">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#39714c]">
                  Supporters
                </p>
                <p className="mt-4 text-3xl font-black text-[#173f35]">8,400+</p>
                <p className="mt-2 text-sm text-[#617067]">People giving with care.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#e6ece3] bg-[#eef4eb] p-6">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#39714c]">
                  Communities
                </p>
                <p className="mt-4 text-3xl font-black text-[#173f35]">12</p>
                <p className="mt-2 text-sm text-[#617067]">Local causes supported.</p>
              </div>
            </div>
            <div className="mt-8 space-y-6">
              <article className="rounded-[1.75rem] bg-[#f7faf6] p-6">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#588063]">
                  Community story
                </p>
                <h3 className="mt-4 text-2xl font-black text-[#173f35]">
                  Clean water in Nkwanta
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#617067]">
                  A neighbourhood campaign that grew through local support, showing how clear goals and regular updates keep people connected to the cause.
                </p>
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#e8eee7]">
                  <div className="h-full w-[74%] rounded-full bg-[#e86f42]" />
                </div>
                <div className="mt-4 flex items-center justify-between text-sm font-bold text-[#173f35]">
                  <span>GH₵ 18,420 raised</span>
                  <span>74%</span>
                </div>
              </article>
              <article className="rounded-[1.75rem] bg-[#f7faf6] p-6">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#588063]">
                  Supporter story
                </p>
                <h3 className="mt-4 text-2xl font-black text-[#173f35]">
                  Every gift begins a story
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#617067]">
                  With Nkoso, supporters can follow the progress they helped create and feel the shared impact of each contribution.
                </p>
                <div className="mt-6 flex items-center gap-3 text-sm text-[#758279]">
                  <div className="h-10 w-10 rounded-full bg-[#dde9df]" />
                  <div>
                    <p className="font-bold text-[#173f35]">Ama, supporter</p>
                    <p>“I can finally see where every Cedi goes.”</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <div className="rounded-[2rem] bg-[#eef4eb] p-8 shadow-[0_24px_60px_rgba(23,63,53,.08)]">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#39714c]">
              Impact in action
            </p>
            <h3 className="mt-4 text-3xl font-black text-[#173f35]">
              Progress that feels easy to follow.
            </h3>
            <p className="mt-5 text-sm leading-6 text-[#617067]">
              A simple dashboard helps campaign organisers see support growing, celebrate milestones, and know when to invite more people in.
            </p>
            <div className="mt-8 rounded-[1.75rem] bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[.18em] text-[#8a9a8d]">
                Giving this year
              </p>
              <p className="mt-3 text-4xl font-black text-[#173f35]">GH₵ 1,240</p>
              <div className="mt-6 flex h-24 items-end gap-2">
                {[36, 52, 43, 70, 61, 88, 76].map((height, index) => (
                  <div
                    key={index}
                    className={`flex-1 rounded-t-md ${index > 4 ? "bg-[#e86f42]" : "bg-[#e7eee7]"}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <p className="mt-4 text-sm text-[#6b7b70]">
                <strong className="text-[#173f35]">12 causes</strong> backed · 4 communities reached
              </p>
            </div>
            <button
              onClick={onAnalytics}
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#39714c]"
            >
              Explore analytics <Arrow />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FundraiserModal({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-[#10251b]/45 p-4 sm:place-items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-3xl bg-[#fffdf8] p-6 shadow-2xl">
        <button
          className="float-right text-xl text-[#65756b]"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e1f0dd] text-2xl">
              ✦
            </div>
            <h2 className="mt-4 text-2xl font-bold">You’re ready to begin!</h2>
            <p className="mt-2 text-[#65756b]">
              This frontend flow is ready for campaign creation when the backend
              is connected.
            </p>
            <button
              className="mt-6 rounded-full bg-[#173f35] px-5 py-3 text-sm font-bold text-white"
              onClick={onClose}
            >
              Back to Nkoso
            </button>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#588063]">
              Start a fundraiser
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              What are you raising funds for?
            </h2>
            <label className="mt-6 block text-sm font-bold">
              Fundraiser title
              <input
                required
                className="mt-2 w-full rounded-xl border border-[#d9e1d7] bg-white px-4 py-3 font-normal outline-none focus:border-[#39714c]"
                placeholder="e.g. Help our community grow"
              />
            </label>
            <label className="mt-4 block text-sm font-bold">
              Goal amount (GH₵)
              <input
                required
                type="number"
                min="1"
                className="mt-2 w-full rounded-xl border border-[#d9e1d7] bg-white px-4 py-3 font-normal outline-none focus:border-[#39714c]"
                placeholder="5,000"
              />
            </label>
            <button className="mt-6 w-full rounded-full bg-[#e86f42] px-5 py-3.5 text-sm font-bold text-white">
              Continue
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function AppContent() {
  const getInitialPage = () => {
    if (typeof window === "undefined") return "home";
    const path = window.location.pathname.replace(/^\//, "");
    if (!path || path === "home") return "home";
    // map known paths to pages
    const allowed = new Set(["analytics", "discover", "how-it-works", "impact", "fundraisers", "login", "register", "profile", "account-settings"]);
    return allowed.has(path) ? path : "home";
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [modalOpen, setModalOpen] = useState(false);
  const { isSignedIn, setRedirectPath, logout } = useAuth();

  const navigate = (page) => {
    setCurrentPage(page);
    try {
      const url = page === "home" ? "/" : `/${page}`;
      window.history.pushState({}, "", url);
    } catch (e) {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname.replace(/^\//, "");
      setCurrentPage(path || "home");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const redirectToLogin = (page) => {
    setRedirectPath(page);
    navigate("login");
  };

  let content;
  if (currentPage === "analytics")
    content = isSignedIn ? (
      <ImpactPage navigate={navigate} />
    ) : (
      <PageBanner
        title="Please sign in to access analytics"
        description="Analytics and fundraiser management are members-only features."
        ctaLabel="Sign in"
        onCta={() => redirectToLogin("analytics")}
      />
    );
  else if (currentPage === "discover") content = <DiscoverPage />;
  else if (currentPage === "how-it-works")
    content = (
      <PageBanner
        title="Learn how Nkoso turns ideas into support"
        description="See the simple steps behind launching a fundraiser, growing awareness, and tracking progress with your community."
        ctaLabel="Explore causes"
        onCta={() => navigate("discover")}
      />
    );
  else if (currentPage === "impact")
    content = <ImpactPage navigate={navigate} />;
  else if (currentPage === "fundraisers")
    content = isSignedIn ? (
      <AnalyticsPage onStart={() => setModalOpen(true)} />
    ) : (
      <PageBanner
        title="Ready to start your fundraiser?"
        description="Sign in to build your campaign and invite support from your community."
        ctaLabel="Sign in"
        onCta={() => redirectToLogin("fundraisers")}
      />
    );
  else if (currentPage === "login")
    content = <LoginPage navigate={navigate} />;
  else if (currentPage === "register")
    content = <RegisterPage navigate={navigate} />;
  else if (currentPage === "profile") content = <ProfilePage navigate={navigate} />;
  else if (currentPage === "account-settings") content = <AccountSettingsPage navigate={navigate} />;
  else
    content = (
      <>
        <HomeHero
          onStart={() => redirectToLogin("fundraisers")}
          onDiscover={() => navigate("discover")}
        />
        <FeaturedCampaigns onDiscover={() => navigate("discover")} />
        <HowItWorks onAnalytics={() => redirectToLogin("analytics")} />
        <PhotoStories />
        <ImpactSection onAnalytics={() => redirectToLogin("analytics")} />
        <FinalPhotoCTA onStart={() => redirectToLogin("fundraisers")} />
      </>
    );

  return (
    <main className="min-h-screen overflow-x-clip bg-[#fffdf8] text-[#17261f]">
      <Header
        currentPage={currentPage}
        isSignedIn={isSignedIn}
        navigate={navigate}
        onStart={() => redirectToLogin("fundraisers")}
        onSignIn={() => redirectToLogin("login")}
        onSignOut={() => {
          logout();
          navigate("home");
        }}
      />
      {content}
      <Footer navigate={navigate} />
      {modalOpen && <FundraiserModal onClose={() => setModalOpen(false)} />}
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
