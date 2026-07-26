import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage({ navigate }) {
  const { user, isSignedIn, updateProfile, logout } = useAuth();
  const [about, setAbout] = useState("");
  const [avatar, setAvatar] = useState("");
  const [activity, setActivity] = useState([]);
  const [visibility, setVisibility] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [stats, setStats] = useState({ donatedCampaigns: 0, totalDonated: "GH₵ 0", joined: "" });
  const [feedback, setFeedback] = useState("");
  const [activePopup, setActivePopup] = useState(null);

  useEffect(() => {
    if (!isSignedIn) {
      navigate("login");
    }
  }, [isSignedIn, navigate]);

  useEffect(() => {
    if (!user) return;
    const profile = user.profile || {};
    setAbout(profile.about || "");
    setAvatar(profile.avatar || "");
    setActivity(profile.activity || []);
    setVisibility(profile.visibility ?? true);
    setFollowers(profile.followers || []);
    setFollowing(profile.following || []);
    setStats(profile.stats || { donatedCampaigns: 0, totalDonated: "GH₵ 0", joined: new Date().toISOString() });
  }, [user]);

  const joinedLabel = useMemo(() => {
    if (!stats.joined) return "";
    return new Date(stats.joined).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });
  }, [stats.joined]);

  const handleAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setAvatar(result);
      updateProfile({ avatar: result });
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteActivity = (id) => {
    const next = activity.filter((item) => item.id !== id);
    setActivity(next);
    updateProfile({ activity: next });
  };

  const handleSave = () => {
    updateProfile({ about, avatar, visibility, activity, followers, following, stats });
    setFeedback("Profile updated successfully.");
    window.setTimeout(() => setFeedback(""), 2800);
  };

  if (!user) {
    return null;
  }

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[#f5f2eb] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-5 rounded-[2rem] bg-white p-5 shadow-[0_24px_60px_rgba(23,63,53,.08)] lg:grid-cols-[1.2fr_1fr] sm:p-6">
          <div className="rounded-[2rem] bg-gradient-to-br from-[#eff7ec] via-[#ebf4e6] to-[#dfe8da] p-6">
            <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
              <div className="relative">
                <div className="mx-auto h-44 w-44 overflow-hidden rounded-[2rem] border border-[#d7ded7] bg-[#eef4eb] shadow-inner">
                  {avatar ? (
                    <img src={avatar} alt="Profile avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#e6efdf] text-5xl font-black uppercase tracking-[.08em] text-[#173f35]">
                      JD
                    </div>
                  )}
                </div>
                <label className="absolute right-0 top-0 translate-x-2 -translate-y-2 rounded-full bg-white p-2 shadow-md ring-1 ring-[#d7ded7] transition hover:bg-[#f0f5ef]">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                  <span className="text-sm font-bold text-[#173f35]">✎</span>
                </label>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[.18em] text-[#52735d]">Profile photo</p>
                <p className="mt-2 text-sm text-[#617067]">Upload a real photo or logo and it will replace the default avatar.</p>
              </div>
                <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-[1.75rem] border border-[#d3dbd4] bg-white text-center text-sm shadow-sm">
                <button
                  type="button"
                  onClick={() => setActivePopup("followers")}
                  className="rounded-none border-r border-[#d3dbd4] px-6 py-4 font-semibold text-[#3f5f4c] transition hover:bg-[#f3f7f2]"
                >
                  Followers {followers.length}
                </button>
                <button
                  type="button"
                  onClick={() => setActivePopup("following")}
                  className="rounded-none px-6 py-4 font-semibold text-[#3f5f4c] transition hover:bg-[#f3f7f2]"
                >
                  Following {following.length}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 px-2 py-4 sm:px-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[.18em] text-[#52735d]">Profile</p>
                  <h1 className="mt-3 text-4xl font-black tracking-[-.04em] text-[#173f35] sm:text-5xl">{user.name}</h1>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.5rem] bg-[#f6f7f2] p-5 text-center">
                  <p className="text-sm uppercase tracking-[.16em] text-[#6a7a70]">Campaigns donated</p>
                  <p className="mt-3 text-3xl font-black text-[#173f35]">{stats.donatedCampaigns}</p>
                </div>
                <div className="rounded-[1.5rem] bg-[#f6f7f2] p-5 text-center">
                  <p className="text-sm uppercase tracking-[.16em] text-[#6a7a70]">Total donated</p>
                  <p className="mt-3 text-3xl font-black text-[#173f35]">{stats.totalDonated}</p>
                </div>
                <div className="rounded-[1.5rem] bg-[#f6f7f2] p-5 text-center">
                  <p className="text-sm uppercase tracking-[.16em] text-[#6a7a70]">Member since</p>
                  <p className="mt-3 text-xl font-black text-[#173f35]">{joinedLabel}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-[#eef4eb] p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#173f35] text-center text-lg font-bold leading-10 text-white">i</div>
                <p className="text-sm font-bold text-[#173f35]">Profile visibility</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#617067]">
                {visibility ? "Your profile is visible to other Nkoso members." : "Your profile is private and hidden from others."}
              </p>
              <button
                onClick={() => {
                  const next = !visibility;
                  setVisibility(next);
                  updateProfile({ visibility: next });
                }}
                className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-bold text-[#173f35] ring-1 ring-[#d7ded7] transition hover:bg-[#f7f8f4]"
              >
                {visibility ? "Make profile private" : "Make profile visible"}
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 mt-12">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
            <div className="space-y-6">
              <section className="rounded-[2rem] border border-dashed border-[#cbd7cc] bg-[#fffdf8] p-6 shadow-[0_16px_40px_rgba(23,63,53,.04)]">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[.16em] text-[#52735d]">What I care about</p>
                  <h2 className="mt-3 text-3xl font-black text-[#173f35]">Share what matters to you</h2>
                  <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#617067]">
                    Share what you care about and connect with people who support similar causes.
                  </p>
                </div>
                <div className="mt-8 flex flex-col gap-4 rounded-[1.75rem] border border-[#e7e7e0] bg-[#f8faf6] p-5">
                  <textarea
                    value={about}
                    onChange={(event) => setAbout(event.target.value)}
                    rows={4}
                    placeholder="Add intro text about why these causes matter to you"
                    className="w-full rounded-[1.5rem] border border-[#d7ded7] bg-white px-4 py-4 text-sm text-[#2f4035] outline-none focus:border-[#587b5a]"
                  />
                </div>
              </section>

              <section className="rounded-[2rem] bg-white p-6 shadow-[0_16px_40px_rgba(23,63,53,.06)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[.16em] text-[#52735d]">Activity</p>
                    <h2 className="mt-3 text-2xl font-black text-[#173f35]">Recent actions</h2>
                  </div>
                  <span className="text-sm text-[#617067]">Manage visibility</span>
                </div>
                <div className="mt-6 space-y-4">
                  {activity.length === 0 ? (
                    <p className="text-sm text-[#617067]">Your activity is currently empty.</p>
                  ) : (
                    activity.map((item) => (
                      <div key={item.id} className="rounded-[1.75rem] border border-[#e3e8e1] bg-[#f8faf6] p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-[#173f35]">{item.title}</p>
                            <p className="mt-1 text-sm leading-6 text-[#617067]">{item.description}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteActivity(item.id)}
                            className="rounded-full border border-[#cbd7cc] px-3 py-2 text-xs font-bold text-[#52705d] transition hover:bg-[#eef2ec]"
                          >
                            Delete
                          </button>
                        </div>
                        <p className="mt-3 text-xs uppercase tracking-[.17em] text-[#879389]">{item.date}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-[2rem] bg-white p-6 shadow-[0_16px_40px_rgba(23,63,53,.06)]">
                <p className="text-xs uppercase tracking-[.16em] text-[#52735d]">Joined</p>
                <p className="mt-4 text-3xl font-black text-[#173f35]">{joinedLabel}</p>
                <p className="mt-3 text-sm text-[#617067]">
                  Your Nkoso profile was created on the date above and will grow as you support campaigns.
                </p>
              </section>
            </aside>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            className="rounded-full bg-[#173f35] px-8 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(23,63,53,.24)] transition hover:bg-[#1e4637]"
          >
            Save profile
          </button>
        </div>
        {feedback && (
          <p className="mt-3 text-center text-sm text-[#52705d]">{feedback}</p>
        )}
        {activePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[.16em] text-[#52735d]">{activePopup === "followers" ? "Followers" : "Following"}</p>
                  <h3 className="mt-3 text-2xl font-black text-[#173f35]">{activePopup === "followers" ? "Your followers" : "People you follow"}</h3>
                </div>
                <button
                  onClick={() => setActivePopup(null)}
                  className="rounded-full bg-[#f5f5f2] px-4 py-2 text-sm font-bold text-[#617067] transition hover:bg-[#eae8e2]"
                >
                  Close
                </button>
              </div>
              <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
                {(activePopup === "followers" ? followers : following).length === 0 ? (
                  <p className="rounded-[1.75rem] bg-[#f8faf6] p-5 text-sm text-[#617067]">No entries yet.</p>
                ) : (
                  (activePopup === "followers" ? followers : following).map((person) => (
                    <div key={person.name} className="rounded-[1.75rem] border border-[#e8ece3] bg-[#fafbf8] p-4">
                      <p className="font-bold text-[#173f35]">{person.name}</p>
                      <p className="mt-1 text-sm text-[#617067]">{person.detail || "Member"}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
);}