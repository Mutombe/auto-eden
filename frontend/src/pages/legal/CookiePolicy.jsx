import React from "react";
import { Link } from "react-router-dom";
import LegalLayout, { CONTACT, List, Table, Term } from "../../components/legal/LegalLayout";
import { openCookieSettings } from "../../lib/consent";

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    body: (
      <p>
        This policy explains what cookies and similar technologies Auto Eden uses, why, and how you can control them. It works
        alongside our <Link to="/privacy" className="text-red-600 hover:underline">Privacy Policy</Link>, which explains how we
        handle personal information in general.
      </p>
    ),
  },
  {
    id: "what-are-cookies",
    title: "What are cookies?",
    body: (
      <>
        <p>
          Cookies are small text files a website places on your device. They let the site remember things between pages
          and visits, such as that you are signed in. They do not contain your name or email address, but they can carry
          an identifier that links your activity to your device.
        </p>
        <p>
          We also use your browser's <Term>local storage</Term>, which works in a similar way. In this policy, "cookies"
          covers both.
        </p>
      </>
    ),
  },
  {
    id: "types",
    title: "The types of cookies we use",
    body: (
      <>
        <List
          items={[
            <><Term>Essential</Term>: needed for the site to work: keeping you signed in, protecting forms against forgery, and remembering your cookie choice. These are always on, because without them parts of the site would stop working.</>,
            <><Term>Analytics</Term>: count visits to the marketplace and views of each vehicle, so we know which listings are popular and can show sellers how their cars are doing. These are only set if you choose to allow them.</>,
          ]}
        />
        <p>
          <Term>We do not use advertising, social-media or cross-site tracking cookies</Term>, and we do not let advertisers
          place cookies on Auto Eden.
        </p>
      </>
    ),
  },
  {
    id: "list",
    title: "Cookies on Auto Eden",
    body: (
      <>
        <Table
          head={["Name", "Type", "Purpose", "Duration"]}
          rows={[
            ["auth", "Essential (local storage)", "Keeps you signed in to your account.", "Until you sign out"],
            ["csrftoken", "Essential (cookie)", "Protects forms and account actions against cross-site request forgery.", "1 year"],
            ["ae_cookie_consent", "Essential (local storage)", "Remembers the cookie choice you made, so we don't ask on every visit.", "12 months"],
            ["sessionid", "Analytics (cookie)", "An anonymous session identifier used to count unique visits and vehicle views.", "2 weeks"],
          ]}
        />
        <p>
          <Term>Third-party services.</Term> Our pages load fonts from Google Fonts. This sets no cookies, but your browser
          connects to Google's servers, which receive your IP address. Our AI chat assistant only sends what you type into
          it, when you use it.
        </p>
      </>
    ),
  },
  {
    id: "manage",
    title: "Managing your choices",
    body: (
      <>
        <p>
          When you first visit Auto Eden we ask which cookies you allow. You can change your mind at any time:
        </p>
        <div>
          <button
            onClick={openCookieSettings}
            className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            Open cookie settings
          </button>
        </div>
        <p>
          You can also block or delete cookies in your browser settings. If you block essential cookies, you may not be able
          to sign in or submit forms. Deleting your cookies also deletes your saved choice, so we will ask you again.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes and contact",
    body: (
      <p>
        If we start using new types of cookies we will update this policy and ask for your choice again. Questions? Email{" "}
        <a href={`mailto:${CONTACT.privacyEmail}`} className="text-red-600 hover:underline">{CONTACT.privacyEmail}</a>.
      </p>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      updated="29 October 2026"
      intro="Which cookies Auto Eden uses, what each one is for, and how to change your choices at any time."
      sections={sections}
    />
  );
}
