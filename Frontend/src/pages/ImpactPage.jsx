import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const photoStories = [
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

export default function ImpactPage({ navigate }) {
  const [activeTab, setActiveTab] = useState("share");
  const { user } = useAuth();
  const profile = user?.profile || {};
  const stats = profile.stats || {
    donatedCampaigns: 0,
    totalDonated: "GH₵ 0",
    joined: new Date().toISOString(),
  };
  const followers = profile.followers || [];
  const firstName = user?.name?.split(" ")?.[0] || "You";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "NK";

  const fundraisersSupported = stats.donatedCampaigns || 0;
  const peopleInspired = Math.max(followers.length, 0);
  const about = profile.about ||
    "Track how donations, shares, and fundraisers add up to real community progress.";

  const impactLabel = useMemo(() => {
    return stats.totalDonated || "GH₵ 0";
  }, [stats.totalDonated]);

  return (
    <section className="bg-[#f4f5ef] min-h-[calc(100vh-80px)] pb-16 pt-16 sm:pb-24 sm:pt-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-[0_24px_60px_rgba(23,63,53,.08)] sm:p-10">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={`${user?.name}'s avatar`}
                  className="h-28 w-28 rounded-full object-cover shadow-lg"
                />
              ) : (
                <div className="grid h-28 w-28 place-items-center rounded-full bg-[#0e3b2f] text-3xl font-black text-white shadow-lg">
                  {initials}
                </div>
              )}
            </div>
            <p className="text-xs uppercase tracking-[.18em] text-[#52735d]">Your contribution</p>
            <p className="text-6xl font-black text-[#173f35]">{impactLabel || "GH₵ 0"}</p>
            <p className="max-w-2xl text-base leading-7 text-[#617067]">
              This is the total amount you have contributed through Nkoso so far.
            </p>
          </div>

          <div className="mt-10 rounded-[1.75rem] border border-[#dce5da] bg-[#f8faf6] p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[.16em] text-[#39714c]">People supported</p>
                <p className="mt-4 text-4xl font-black text-[#173f35]">{fundraisersSupported}</p>
                <p className="mt-2 text-sm text-[#69746c]">Campaigns and fundraisers you helped move forward.</p>
              </div>
              <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[.16em] text-[#39714c]">People inspired</p>
                <p className="mt-4 text-4xl font-black text-[#173f35]">{peopleInspired}</p>
                <p className="mt-2 text-sm text-[#69746c]">Members who connected with your profile or support.</p>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-[1.75rem] bg-[#0f3328] p-8 text-white">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[.18em] text-[#9ed3a1]">Your impact story</p>
                <h2 className="mt-3 text-3xl font-black">Keep building your influence on Nkoso.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#cfe6d0]">
                  Share fundraisers, support campaigns, and keep your network updated to grow your impact over time.
                </p>
              </div>
              <button onClick={() => navigate("discover")} className="w-full rounded-full bg-[#e86f42] px-6 py-3 text-sm font-bold text-white shadow-lg sm:w-auto">
                Find a fundraiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-[#fffdf8] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-3xl font-black text-[#173f35]">Fundraisers you support</h2>
              <p className="mx-auto max-w-2xl text-sm leading-7 text-[#617067]">
                Toggle between your shared activity and donation activity to see the campaigns that matter to you.
              </p>
            </div>

            <div className="mt-10 rounded-[2rem] bg-white p-6 shadow-[0_24px_60px_rgba(23,63,53,.08)]">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab("share")}
                  className={`rounded-full px-6 py-3 text-sm font-bold transition ${activeTab === "share" ? "bg-[#173f35] text-white" : "bg-[#f1f6ef] text-[#173f35]"}`}
                >
                  Share activity
                </button>
                <button
                  onClick={() => setActiveTab("donation")}
                  className={`rounded-full px-6 py-3 text-sm font-bold transition ${activeTab === "donation" ? "bg-[#173f35] text-white" : "bg-[#f1f6ef] text-[#173f35]"}`}
                >
                  Donation activity
                </button>
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
                <div className="space-y-6">
                  <div className="rounded-[1.75rem] border border-[#e3e8e1] bg-[#f8faf6] p-6">
                    <p className="text-xs uppercase tracking-[.16em] text-[#39714c]">
                      {activeTab === "share" ? "Shared campaigns" : "Donation summary"}
                    </p>
                    <h3 className="mt-3 text-2xl font-black text-[#173f35]">
                      {activeTab === "share"
                        ? "Track the fundraisers you helped amplify"
                        : "See where your contributions went"}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#617067]">
                      {activeTab === "share"
                        ? "These are the campaigns you’ve shared that generated support in the community."
                        : "This view shows the donations you made and the causes you backed."}
                    </p>
                  </div>
                  <div className="rounded-[1.75rem] border border-[#e3e8e1] bg-[#fffdf8] p-6">
                    <p className="text-sm font-bold text-[#173f35]">Empty for now</p>
                    <p className="mt-2 text-sm text-[#617067]">
                      Once you start engaging, this section will show your activity and donation details in a richer feed.
                    </p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-[1.75rem] bg-[#dfeadd] shadow-sm">
                  <img
                    src={activeTab === "share" ? photoStories[0].image : photoStories[1].image}
                    alt="Impact visual"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
