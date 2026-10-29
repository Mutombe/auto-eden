import React from "react";
import { Link } from "react-router-dom";
import LegalLayout, { CONTACT, List, Term } from "../../components/legal/LegalLayout";

const mail = (a) => <a href={`mailto:${a}`} className="text-red-600 hover:underline">{a}</a>;

const sections = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          Auto Eden ("Auto Eden", "we", "us") runs an online marketplace in Zimbabwe where people list, verify, browse, bid on
          and buy vehicles, at <Term>autoeden.co.zw</Term> and related services (together, the "Platform").
        </p>
        <p>
          We are the controller of the personal information described in this policy. We process it in line with the
          Cyber and Data Protection Act [Chapter 12:07] of Zimbabwe and any other law that applies to you.
        </p>
        <p>
          By using the Platform you confirm that you have read this policy. If you do not agree with it, please do not use
          the Platform. This policy works alongside our <Link to="/cookies" className="text-red-600 hover:underline">Cookie Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "Information we collect",
    body: (
      <>
        <p><Term>Information you give us</Term></p>
        <List
          items={[
            <><Term>Account details</Term>: username, email address, first and last name, phone number and password (stored only in hashed form; we can never see it).</>,
            <><Term>Vehicle listings</Term>: make, model, year, VIN, mileage, condition, price, location, description and photos of the vehicle.</>,
            <><Term>Bids and offers</Term>: the amount you bid and any message you include.</>,
            <><Term>Quote and purchase requests</Term>: your full name, email, telephone number, address, city and country, and the vehicle you are asking about.</>,
            <><Term>Messages</Term>: what you send us through the contact form, suggestion box, job applications, reviews, email or phone.</>,
            <><Term>AI assistant chats</Term>: the questions you type into the Auto Eden chat assistant and its replies.</>,
          ]}
        />
        <p><Term>Information collected automatically</Term></p>
        <List
          items={[
            <><Term>Technical data</Term>: IP address, browser and device type, and the date and time of requests, recorded in our server logs.</>,
            <><Term>Usage data</Term>: pages and vehicles viewed on the marketplace, used to count visits and vehicle views. This only happens if you allow analytics cookies.</>,
            <><Term>Error reports</Term>: when something breaks, technical details of the error so we can fix it.</>,
          ]}
        />
        <p>
          We do not knowingly collect information from anyone under 18. The Platform is not intended for children; if you
          believe a child has given us information, contact us and we will delete it.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    body: (
      <>
        <List
          items={[
            <><Term>To run the marketplace</Term>: create and secure your account, publish and verify your listings, pass your bids and offers to sellers, and handle quote and purchase requests.</>,
            <><Term>To verify vehicles and prevent fraud</Term>: check VINs and listing details, inspect vehicles, and detect fake listings or misuse of the Platform.</>,
            <><Term>To communicate with you</Term>: account emails such as verification codes and password resets, updates on your listings, bids and quotes, and replies to your messages.</>,
            <><Term>To answer questions through the AI assistant</Term>: your chat messages are processed to generate replies.</>,
            <><Term>To improve the Platform</Term>: understand which pages and vehicles are popular (with your consent) and fix errors.</>,
            <><Term>To meet legal obligations</Term>: keep records the law requires, and respond to lawful requests from authorities.</>,
          ]}
        />
        <p>
          We rely on the following grounds: performing our agreement with you (running your account, listings and
          transactions), your consent (analytics cookies, marketing), our legitimate interests (security, fraud prevention,
          fixing errors, improving the service) and our legal obligations.
        </p>
        <p><Term>We never sell your personal information.</Term> We do not use it for third-party advertising.</p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <List
          items={[
            <><Term>Other users, as needed for a deal</Term>: listing details and photos are public. When you bid, make an offer or request a quote, the relevant seller or our team sees the details needed to respond. We do not publish your email address or phone number on listings.</>,
            <><Term>Service providers who run the Platform for us</Term>: website and server hosting (Render), our database (Neon), photo storage (DigitalOcean Spaces), email delivery (Google), the AI chat assistant (Anthropic), and error monitoring (Sentry). They may only use your information to provide their service to us.</>,
            <><Term>Authorities</Term>: where the law requires it, or to protect the rights, property or safety of our users, the public or Auto Eden.</>,
            <><Term>A buyer of our business</Term>: if Auto Eden is sold or merged, your information may transfer to the new owner, under this policy.</>,
          ]}
        />
      </>
    ),
  },
  {
    id: "transfers",
    title: "International transfers",
    body: (
      <p>
        Some of our service providers store or process information outside Zimbabwe, including in the United States and
        Singapore. When this happens we use providers with strong security practices and contractual protections, so your
        information gets a level of protection comparable to what Zimbabwean law requires.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <>
        <List
          items={[
            <><Term>Account information</Term>: while your account is open. When you delete your account, we delete or anonymise it, except what we must keep by law.</>,
            <><Term>Listings, bids and transaction records</Term>: for as long as needed to complete the deal and resolve disputes, and for the period tax and commercial law requires.</>,
            <><Term>Quote requests and messages</Term>: for as long as needed to respond and follow up, then deleted when no longer needed.</>,
            <><Term>Analytics and server logs</Term>: for a limited period, after which they are deleted or aggregated so they no longer identify you.</>,
          ]}
        />
      </>
    ),
  },
  {
    id: "security",
    title: "How we protect it",
    body: (
      <p>
        All traffic to the Platform is encrypted with HTTPS, passwords are stored only as secure hashes, and access to
        personal information is limited to staff who need it to do their job. No system is perfectly secure; if a breach
        affects your information, we will notify you and the Data Protection Authority as the law requires.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>You have the right to:</p>
        <List
          items={[
            "know what personal information we hold about you and get a copy of it;",
            "have inaccurate or incomplete information corrected;",
            "have your information deleted when we no longer have a reason to keep it;",
            "object to, or ask us to restrict, how we use it;",
            "withdraw your consent at any time, for example by changing your cookie settings, without affecting what we did before;",
            "complain to the Data Protection Authority (POTRAZ).",
          ]}
        />
        <p>
          You can update most account details yourself in your profile. For anything else, email {mail(CONTACT.privacyEmail)}.
          We may ask you to confirm your identity first, and we aim to respond within 30 days.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We may update this policy as the Platform changes or the law requires. The "Last updated" date above shows the latest
        version. If a change significantly affects how we use your information, we will tell you on the site or by email
        before it takes effect.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <>
        <p>Questions, requests or complaints about your privacy:</p>
        <List
          items={[
            <>Privacy requests: {mail(CONTACT.privacyEmail)}</>,
            <>General: {mail(CONTACT.email)}</>,
            <>Phone: <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="text-red-600 hover:underline">{CONTACT.phone}</a></>,
          ]}
        />
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="29 October 2026"
      intro="What we collect when you use Auto Eden, why we collect it, who sees it, and the choices you have."
      sections={sections}
    />
  );
}
