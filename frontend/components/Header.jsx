
// "use client";

// import React, { useEffect, useState } from "react";
// import { Search, Sprout, User, Menu, X, LogOut } from "lucide-react";
// import { Button } from "./ui/button";
// import { usePathname, useRouter } from "next/navigation";
// import Link from "next/link";
// import { supabase } from "@/services/superbaseClient";

// export default function Header() {
//     const router = useRouter();
//     const pathname = usePathname();
//     const [mobileOpen, setMobileOpen] = useState(false);
//     const [user, setUser] = useState(null);
//     const [loadingAuth, setLoadingAuth] = useState(true);

//     const navLinks = [
//         { name: "Home", href: "/" },
//         { name: "Disease Detection", href: "/diseasedetection" },
//         { name: "Map", href: "/map" },
//         { name: "Forecast", href: "/forecast" },
//     ];

//     const isActive = (href) => pathname === href;

//     // Get initial session/user and subscribe to auth changes
//     useEffect(() => {
//         let subscription;

//         async function init() {
//             try {
//                 const { data: { session } } = await supabase.auth.getSession();
//                 setUser(session?.user ?? null);
//             } catch (err) {
//                 console.error("Error fetching session:", err);
//             } finally {
//                 setLoadingAuth(false);
//             }

//             // Subscribe to auth state changes (sign in / sign out)
//             const { data } = supabase.auth.onAuthStateChange((_event, session) => {
//                 setUser(session?.user ?? null);
//             });

//             subscription = data?.subscription;
//         }

//         init();

//         return () => {
//             // cleanup subscription
//             if (subscription?.unsubscribe) subscription.unsubscribe();
//         };
//     }, []);

//     // Redirect to auth page instead of direct login
//     const handleLoginRedirect = () => {
//         router.push("/auth");
//     };

//     const handleSignOut = async () => {
//         try {
//             const { error } = await supabase.auth.signOut();
//             if (error) throw error;
//             // onAuthStateChange will update UI; manually route if you want:
//             setUser(null);
//             router.push("/");
//         } catch (err) {
//             console.error("Sign out failed:", err);
//             alert("Sign out failed — check console for details.");
//         }
//     };

//     return (
//         <header className="fixed top-0 left-0 right-0 z-50 bg-transparent  ">
//             <div className="mx-5 py-4">
//                 <div className="flex items-center justify-between">
//                     {/* LOGO */}
//                     <div
//                         className="flex items-center gap-2 cursor-pointer"
//                         onClick={() => router.push("/")}
//                     >
//                         <Sprout className="h-6 w-6 text-primary" />
//                         <span className="text-xl font-semibold text-white">Forest</span>
//                     </div>

//                     {/* DESKTOP NAV */}
//                     <nav className="hidden md:flex items-center gap-6">
//                         {navLinks.map((link) => (
//                             <Link
//                                 key={link.href}
//                                 href={link.href}
//                                 className={`text-sm font-medium transition-colors ${isActive(link.href)
//                                     ? "text-zinc-400 underline underline-offset-4"
//                                     : "text-white hover:text-zinc-400"
//                                     }`}
//                             >
//                                 {link.name}
//                             </Link>
//                         ))}
//                     </nav>

//                     {/* DESKTOP RIGHT BUTTONS */}
//                     <div className="hidden md:flex items-center gap-4">

//                         {/* If loading show placeholder, else show login/logout */}
//                         {loadingAuth ? (
//                             <div className="px-3 py-1 text-sm">...</div>
//                         ) : user ? (
//                             <div className="flex items-center gap-2">
//                                 {/* optionally show user email or avatar */}
//                                 <span className="text-sm text-white font-semibold hidden md:inline">{user.name || user.user_metadata?.name}</span>
//                                 <Button
//                                     variant="ghost"
//                                     size="sm"
//                                     onClick={handleSignOut}
//                                     className="flex text-white items-center gap-2  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/20 hover:text-white"
//                                 >
//                                     <LogOut className="w-4 h-4 text-white" />
//                                     Logout
//                                 </Button>
//                             </div>
//                         ) : (
//                             <Link href="/auth">
//                                 <Button
//                                     variant="ghost"
//                                     size="sm"
//                                     className="flex text-white items-center gap-2  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/20 hover:text-white"
//                                 >
//                                     <User className="h-5 w-5 text-white" />
//                                     Login
//                                 </Button>
//                             </Link>
//                         )}
//                     </div>

//                     {/* MOBILE HAMBURGER */}
//                     <button
//                         className="md:hidden flex p-2  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-lg hover:bg-white/20 text-white"
//                         onClick={() => setMobileOpen(!mobileOpen)}
//                         aria-label="Toggle menu"
//                     >
//                         {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//                     </button>
//                 </div>
//             </div>

//             {/* MOBILE MENU */}
//             {mobileOpen && (
//                 <div className="md:hidden  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg border-t  px-5 py-4 space-y-4 animate-in slide-in-from-top duration-300">
//                     {navLinks.map((link) => (
//                         <Link
//                             key={link.href}
//                             href={link.href}
//                             onClick={() => setMobileOpen(false)}
//                             className={`block text-base font-medium ${isActive(link.href)
//                                 ? "text-white underline underline-offset-4 hover:text-gray-400"
//                                 : "text-white hover:text-gray-400"
//                                 }`}
//                         >
//                             {link.name}
//                         </Link>
//                     ))}

//                     {/* Auth buttons */}
//                     <div className="pt-3 border-t">
//                         {loadingAuth ? (
//                             <div>...</div>
//                         ) : user ? (
//                             <>
//                                 <div className="mb-3 text-sm text-white">
//                                     {user.name || user.user_metadata?.name}
//                                 </div>
//                                 <button
//                                     onClick={() => {
//                                         setMobileOpen(false);
//                                         handleSignOut();
//                                     }}
//                                     className="flex items-center gap-2 text-red-600 font-medium text-lg"
//                                 >
//                                     <LogOut className="w-5 h-5" />
//                                     Logout
//                                 </button>
//                             </>
//                         ) : (
//                             <Link
//                                 href="/auth"
//                                 onClick={() => setMobileOpen(false)}
//                             >
//                                 <div className="flex items-center gap-2 text-foreground text-lg">
//                                     <User className="w-5 h-5" />
//                                     Login
//                                 </div>
//                             </Link>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </header>
//     );
// }


"use client";

import React, { useEffect, useState } from "react";
import { Search, Sprout, User, Menu, X, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/services/superbaseClient";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Disease Detection", href: "/diseasedetection" },
    { name: "Map", href: "/map" },
    { name: "Forecast", href: "/forecast" },
  ];

  const isActive = (href) => pathname === href;

  useEffect(() => {
    let subscription;

    async function init() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Error fetching session:", err);
      } finally {
        setLoadingAuth(false);
      }

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      subscription = data?.subscription;
    }

    init();

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      router.push("/");
    } catch (err) {
      console.error("Sign out failed:", err);
      alert("Sign out failed — check console for details.");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="mx-5">
        {/* MAIN ROW */}
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Sprout className="h-6 w-6 text-white" />
            <span className="text-xl font-semibold text-white">Forest</span>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-zinc-300 underline underline-offset-4"
                    : "text-white hover:text-zinc-300"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* DESKTOP RIGHT SIDE */}
          <div className="hidden md:flex items-center gap-4">
            {loadingAuth ? (
              <div className="px-3 py-1 text-sm text-white">...</div>
            ) : user ? (
              <div className="flex items-center gap-3">

                {/* <span className="text-sm text-white font-semibold">
                  {user.name || user.user_metadata?.name}
                </span> */}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-white bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/20 hover:text-white"
                >
                  <LogOut className="w-4 h-4 text-white" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-white bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/20 hover:text-white"
                >
                  <User className="h-5 w-5 text-white" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden flex items-center justify-center p-2 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-lg hover:bg-white/20 text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg border-t px-5 py-5 space-y-5 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block text-base font-medium ${
                isActive(link.href)
                  ? "text-white underline underline-offset-4"
                  : "text-white hover:text-gray-300"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* MOBILE AUTH SECTION */}
          <div className="pt-3 border-t border-white/20">
            {loadingAuth ? (
              <div className="text-white">...</div>
            ) : user ? (
              <>
                <div className="mb-3 text-sm text-white">
                  {user.name || user.user_metadata?.name}
                </div>

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-2 text-red-500 font-medium text-lg"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-white text-lg"
              >
                <User className="w-5 h-5" />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
