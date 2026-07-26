import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const publicLinks = [
  ['Discover', 'discover'],
  ['How it works', 'how-it-works'],
  ['Our impact', 'impact'],
]

const memberLinks = [
  ['Discover', 'discover'],
  ['My fundraisers', 'fundraisers'],
  ['Analytics', 'analytics'],
]

export default function Header({ currentPage, isSignedIn, navigate, onStart, onSignIn, onSignOut }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const links = isSignedIn ? memberLinks : publicLinks
  const firstName = user?.name?.split(' ')[0] || ''
  const initials = user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'AK'
  const goTo = (page) => { navigate(page); setMenuOpen(false); setProfileOpen(false) }
  const handleSignOut = () => { onSignOut(); setMenuOpen(false); setProfileOpen(false) }

  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = menuOpen ? 'hidden' : originalOverflow
    document.documentElement.style.overflow = menuOpen ? 'hidden' : originalHtmlOverflow

    return () => {
      document.body.style.overflow = originalOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e5ebe3] bg-[#fffdf8] shadow-[0_10px_30px_rgba(23,63,53,0.12)]">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
      <button onClick={() => goTo('home')} className="flex items-center gap-2 text-[1.7rem] tracking-[-.015em] text-[#173f35]" aria-label="Nkoso home"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f5b642] text-lg font-black text-[#173f35] shadow-sm">N</span><span className="font-black">nkoso</span></button>
      <nav className="hidden items-center gap-8 text-sm font-semibold lg:flex" aria-label="Primary navigation">
        {links.map(([label, page]) => <button key={page} onClick={() => goTo(page)} className={`border-b-2 px-1 pb-1 pt-1 transition-colors ${currentPage === page ? 'border-[#e86f42] text-[#e86f42]' : 'border-transparent hover:border-[#e86f42] hover:text-[#39714c]'}`}>{label}</button>)}
      </nav>
      <div className="hidden items-center gap-3 sm:flex">
        {isSignedIn ? (
          <div className="relative">
            <button
              onClick={() => setProfileOpen((open) => !open)}
              className="inline-flex items-center gap-3 rounded-full border border-[#d7ded7] bg-white px-3 py-2 text-sm font-bold text-[#173f35] shadow-sm transition hover:bg-[#f7f9f4]"
              aria-label="Open user menu"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#dbead9] text-sm font-black text-[#173f35]">
                {initials}
              </span>
              <span className="hidden xl:inline">{firstName}</span>
              <span className="text-lg">{profileOpen ? '▴' : '▾'}</span>
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-[1.75rem] border border-[#e7ebe4] bg-white shadow-[0_24px_70px_rgba(23,63,53,.16)]">
                <div className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dbead9] text-lg font-black text-[#173f35]">{initials}</span>
                    <div>
                      <p className="text-sm font-bold text-[#173f35]">{user?.name}</p>
                      <p className="text-xs text-[#67736c]">Member menu</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#eef0eb] px-3 py-3">
                  <button onClick={() => goTo('profile')} className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold text-[#173f35] hover:bg-[#f7f8f4]">
                    Profile
                    <span className="text-[#7a8c82]">›</span>
                  </button>
                  <button onClick={() => goTo('analytics')} className="mt-1 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold text-[#173f35] hover:bg-[#f7f8f4]">
                    Your impact
                    <span className="text-[#7a8c82]">›</span>
                  </button>
                  <button onClick={() => goTo('account-settings')} className="mt-1 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold text-[#173f35] hover:bg-[#f7f8f4]">
                    Account settings
                    <span className="text-[#7a8c82]">›</span>
                  </button>
                  <button onClick={handleSignOut} className="mt-4 w-full rounded-2xl bg-[#173f35] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#152f26]">
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <button onClick={onSignIn} className="px-2 py-2 text-sm font-bold text-[#315c42]">Sign in</button>
            <button onClick={onStart} className="rounded-full bg-[#173f35] px-5 py-3 text-sm font-bold text-white shadow-[0_7px_18px_rgba(23,63,53,.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#e86f42] hover:shadow-[0_10px_22px_rgba(232,111,66,.28)]">
              Start a fundraiser
            </button>
          </>
        )}
      </div>
      <button onClick={() => setMenuOpen(!menuOpen)} className="grid h-10 w-10 place-items-center rounded-full border border-[#d8e0d6] text-xl sm:hidden" aria-label="Toggle menu">{menuOpen ? '×' : '☰'}</button>
      <div className={`fixed inset-0 z-[60] bg-[#173f35]/40 transition-opacity duration-300 sm:hidden ${menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setMenuOpen(false)} />
      <div className={`fixed right-0 top-0 z-[70] flex h-screen w-4/5 max-w-sm flex-col overflow-hidden bg-[#fffdf8] p-6 shadow-2xl transition-transform duration-300 sm:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between pb-4">
          <span className="text-lg font-black text-[#173f35]">Menu</span>
          <button onClick={() => setMenuOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-[#d8e0d6] text-xl" aria-label="Close menu">×</button>
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          {isSignedIn && (
            <div className="space-y-4 rounded-[2rem] bg-[#eef4eb] p-5 shadow-inner">
              <div className="flex items-center gap-3">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#dbead9] text-lg font-black text-[#173f35]">{initials}</span>
                <div>
                  <p className="text-sm font-bold text-[#173f35]">{firstName}</p>
                  <p className="text-xs text-[#617067]">Member menu</p>
                </div>
              </div>
              <div className="grid gap-2">
                <button onClick={() => goTo('profile')} className="w-full rounded-2xl bg-white px-4 py-3 text-left text-sm font-bold text-[#173f35] shadow-sm hover:bg-[#f7f8f4]">
                  Profile
                </button>
                <button onClick={() => goTo('analytics')} className="w-full rounded-2xl bg-white px-4 py-3 text-left text-sm font-bold text-[#173f35] shadow-sm hover:bg-[#f7f8f4]">
                  Your impact
                </button>
                <button onClick={() => goTo('account-settings')} className="w-full rounded-2xl bg-white px-4 py-3 text-left text-sm font-bold text-[#173f35] shadow-sm hover:bg-[#f7f8f4]">
                  Account settings
                </button>
              </div>
            </div>
          )}
          <div className="rounded-[2rem] bg-[#eef4eb] p-4 shadow-inner">
            <img
              src="https://images.unsplash.com/photo-1522204506985-80f71b7f26a0?auto=format&fit=crop&w=800&q=80"
              alt="Crowdfunding community planning together"
              className="h-40 w-full rounded-[1.5rem] object-cover"
            />
          </div>
          <div className="flex flex-col gap-2">
            {links.map(([label, page]) => (
              <button key={page} onClick={() => goTo(page)} className="rounded-xl px-4 py-3 text-left text-sm font-bold text-[#173f35] hover:bg-[#f1f6ef]">
                {label}
              </button>
            ))}
          </div>
          <div className="mt-auto flex w-full flex-col items-center gap-3 pb-2">
            {isSignedIn ? (
              <>
                <button onClick={() => { onStart(); setMenuOpen(false) }} className="w-full rounded-xl bg-[#173f35] px-4 py-3 text-center text-sm font-bold text-white shadow-[0_7px_18px_rgba(23,63,53,.18)] hover:bg-[#0f2c23]">
                  Start a fundraiser
                </button>
                <button onClick={() => { handleSignOut(); setMenuOpen(false) }} className="w-full rounded-xl border border-[#173f35] bg-[#eef4eb] px-4 py-3 text-center text-sm font-bold text-[#173f35]">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { onSignIn(); setMenuOpen(false) }} className="w-full rounded-xl border border-[#173f35] bg-[#eef4eb] px-4 py-3 text-center text-sm font-bold text-[#173f35] hover:bg-[#dbead9]">
                  Sign in
                </button>
                <button onClick={() => { onStart(); setMenuOpen(false) }} className="w-full rounded-xl bg-[#173f35] px-4 py-3 text-center text-sm font-bold text-white shadow-[0_7px_18px_rgba(23,63,53,.18)] hover:bg-[#0f2c23]">
                  Start a fundraiser
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </header>
  )
}
