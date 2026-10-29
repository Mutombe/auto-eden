// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, X, ExternalLink, XLogo } from "../ui/icons";
import { openCookieSettings } from "../../lib/consent";
import Pattern from "../ui/Pattern";


/**
 * Slim Footer Component
 * Minimal, single-row footer with essential links
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "Facebook", href: "https://facebook.com/autoedenzw", icon: Facebook },
    { name: "Twitter", href: "https://twitter.com/autoedenzw", icon: XLogo },
    { name: "Instagram", href: "https://instagram.com/autoedenzw", icon: Instagram },
    { name: "LinkedIn", href: "https://linkedin.com/company/autoeden", icon: Linkedin },
  ];

  return (
    <>
      <footer className="pacaembu-font relative isolate overflow-hidden bg-gray-950 text-gray-400 py-4" role="contentinfo">
        <Pattern variant="circuit" fade="left" scale={0.6} className="-z-10 text-white/[0.06]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Copyright */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-white">Auto Eden</span>
              <span className="hidden sm:inline">•</span>
              <span>© {currentYear}</span>
            </div>

            {/* Center: Navigation Links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm" aria-label="Footer navigation">
              <Link to="/learn" className="hover:text-white transition-colors">
                Learn
              </Link>
              <Link to="/hiring" className="hover:text-white transition-colors">
                Hiring
              </Link>
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link to="/cookies" className="hover:text-white transition-colors">
                Cookies
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <button onClick={openCookieSettings} className="hover:text-white transition-colors">
                Cookie settings
              </button>
              <Link to="/news" className="hover:text-white transition-colors">
                News
              </Link>
              <Link to="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
              <Link to="/suggestions" className="hover:text-white transition-colors">
                Suggestions
              </Link>
              <Link to="/reviews" className="hover:text-white transition-colors">
                Reviews
              </Link>
            </nav>

            {/* Right: Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </>
  );
}