import React from "react";
import { useSelector } from "react-redux";
import { AuthModals } from "../auth/AuthModals";
import { HeroPattern } from "../ui/Pattern";

/**
 * Signed-out visitors get a sign-in prompt instead of the page (and no API calls that would
 * bounce them with a "session expired" message).
 */
export default function AccountGate({ children }) {
  const user = useSelector((s) => s.auth.user);
  const [auth, setAuth] = React.useState(null);
  if (user) return children;
  return (
    <div className="pacaembu-font min-h-screen bg-[#f6f7f9]">
      <div className="relative isolate overflow-hidden bg-gray-950 h-24 sm:h-28">
        <HeroPattern />
      </div>
      <div className="max-w-md mx-auto px-4 py-12 sm:py-16 text-center">
        <div className="w-12 h-12 mx-auto rounded-lg bg-white ring-1 ring-gray-200 shadow-sm grid place-items-center mb-4 overflow-hidden">
          <img src="/Auto-eden-favicon.png" alt="Auto Eden" className="w-9 h-9 object-contain" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Sign in to your account</h1>
        <p className="text-sm text-gray-500 mt-1.5">Manage your listings, see offers on your cars and track the offers you've made.</p>
        <div className="mt-6 flex gap-2 justify-center">
          <button onClick={() => setAuth("login")} className="h-10 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium">Sign in</button>
          <button onClick={() => setAuth("register")} className="h-10 px-5 rounded-lg bg-white ring-1 ring-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-800">Create account</button>
        </div>
      </div>
      <AuthModals openType={auth} onClose={() => setAuth(null)} />
    </div>
  );
}
