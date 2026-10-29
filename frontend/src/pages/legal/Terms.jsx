import React from "react";
import { Link } from "react-router-dom";
import LegalLayout from "../../components/legal/LegalLayout";

// Same terms that used to live in the footer pop-up, now a linkable page.
const sections = [
  {
    id: "acceptance",
    title: "Acceptance of terms",
    body: (
      <p>
        By accessing and using Auto Eden, you agree to be bound by these Terms of Service. If you do not agree, please do
        not use our platform.
      </p>
    ),
  },
  {
    id: "user-responsibilities",
    title: "User responsibilities",
    body: (
      <p>
        Users must provide accurate information when creating listings. Sellers are responsible for the accuracy of vehicle
        descriptions and images. Misrepresentation may result in account suspension.
      </p>
    ),
  },
  {
    id: "listing-policy",
    title: "Listing policy",
    body: (
      <p>
        Listings are free for all users. Auto Eden reserves the right to remove listings that violate our policies or
        contain fraudulent information.
      </p>
    ),
  },
  {
    id: "transactions",
    title: "Transaction handling",
    body: (
      <p>
        Auto Eden facilitates secure transactions between buyers and sellers. We act as an intermediary to ensure both
        parties fulfill their obligations.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <>
        <p>
          Auto Eden is not liable for disputes between buyers and sellers beyond our role as a marketplace facilitator. We
          encourage all parties to conduct due diligence.
        </p>
        <p>
          How we handle your information is covered in our{" "}
          <Link to="/privacy" className="text-red-600 hover:underline">Privacy Policy</Link> and{" "}
          <Link to="/cookies" className="text-red-600 hover:underline">Cookie Policy</Link>.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="January 2026"
      intro="The rules for using Auto Eden to buy and sell cars."
      sections={sections}
    />
  );
}
