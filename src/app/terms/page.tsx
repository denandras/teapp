"use client";

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      body: [
        "By accessing or using the Teapp service (\"the Service\"), you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use the Service.",
        "By registering an account or continuing to use the Service after any changes to these terms, you accept the updated terms. Continued use of the Service constitutes acceptance of the then-current version of these Terms & Conditions.",
      ],
    },
    {
      title: "2. Service Description",
      body: [
        "Teapp is a personal tea-tracking and tea-library web application. It allows you to log and organise the teas you own, have tried, or wish to try, maintain tasting notes, and explore a curated database of teas.",
        "The Service is operated by András Dénes and is currently available exclusively to users residing in Hungary. Access from other jurisdictions is not guaranteed and features may be restricted or disabled without prior notice.",
      ],
    },
    {
      title: "3. Eligibility",
      body: [
        "To use the Service you must be at least 16 years old. By creating an account, you confirm that you meet this age requirement.",
        "You must be a resident of Hungary at the time of registration and for the duration of your use of the Service. We may verify eligibility and reserve the right to refuse or terminate access in our discretion.",
      ],
    },
    {
      title: "4. User Accounts",
      body: [
        "The Service offers two types of accounts: personal accounts and teahouse accounts. Personal accounts are for individual tea enthusiasts who wish to track their own collections and tasting notes.",
        "You are responsible for safeguarding your account credentials and for all activity that occurs under your account. You agree to notify us promptly of any unauthorised use of your account.",
      ],
    },
    {
      title: "5. User Content",
      body: [
        "You may add custom teas and tasting notes to the Service. You retain ownership of the content you provide, and you grant us a non-exclusive licence to store, display, and process that content solely to operate the Service.",
        "You are solely responsible for the accuracy, legality, and appropriateness of any content you submit. Content must not infringe the rights of others or violate applicable law.",
      ],
    },
    {
      title: "6. Teahouse Accounts",
      body: [
        "Teahouse accounts are intended for registered teahouses operating in Hungary. They allow a teahouse to publish its tea offering to the Service's community.",
        "Teahouse accounts are subject to an enrollment and approval process. Enrollment does not guarantee approval. An administrator must review and approve each teahouse application before the account becomes active.",
        "Once approved, the teas associated with a teahouse account become publicly visible within the Service. Teahouse owners are responsible for keeping their published information accurate and up to date.",
      ],
    },
    {
      title: "7. Acceptable Use",
      body: [
        "You agree not to misuse the Service, including but not limited to: attempting to gain unauthorised access, disrupting the Service or its servers, scraping data at scale, or using the Service for any unlawful purpose.",
        "You agree not to impersonate any person or entity, including teahouses, or to misrepresent your affiliation. Misleading or fraudulent content is grounds for immediate termination.",
      ],
    },
    {
      title: "8. Intellectual Property",
      body: [
        "The Service, including its design, text, graphics, logos, and software, is the property of András Dénes and is protected by applicable intellectual property laws. You may not copy, modify, distribute, or create derivative works of the Service without prior written consent.",
        "Tea data within the Service is aggregated from publicly available sources, including Wikidata and TheTeaAPI, and remains subject to their respective licences.",
      ],
    },
    {
      title: "9. Privacy",
      body: [
        "Your privacy is important to us. The processing of your personal data is described in our Privacy Policy, which forms part of these Terms & Conditions.",
        "By using the Service you consent to the collection and processing of your personal data as described in the Privacy Policy.",
      ],
    },
    {
      title: "10. Disclaimers & Limitations",
      body: [
        "The Service is provided \"as is\" and \"as available\", without warranties of any kind, whether express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components.",
        "Tea information is provided for informational purposes only and should not be construed as health, dietary, or medical advice. In no event shall we be liable for any indirect, incidental, or consequential damages arising from your use of the Service.",
      ],
    },
    {
      title: "11. Termination",
      body: [
        "You may delete your account at any time through the settings, which will remove your personal data in accordance with our Privacy Policy.",
        "We may suspend or terminate your access to the Service at any time, with or without notice, if you breach these Terms & Conditions or if we believe your use of the Service poses a risk to the Service or other users.",
      ],
    },
    {
      title: "12. Changes to Terms",
      body: [
        "We may update these Terms & Conditions from time to time to reflect changes in the Service, the law, or our practices. We will indicate the date of the latest revision at the top of this page.",
        "When material changes are made, you will be asked to review and accept the updated Terms within the Service before continuing to use it. Your continued use of the Service after changes take effect also constitutes acceptance of the revised terms.",
      ],
    },
    {
      title: "13. Service Communications",
      body: [
        "From time to time, we may need to contact you via the email address associated with your account to inform you about important changes to the Service — such as domain changes, policy updates, or other matters that may affect your use of Teapp.",
        "These communications are sent to the email address you provided during registration (or as updated in your account settings). You can review or update your email address in the Settings page at any time.",
      ],
    },
    {
      title: "14. Governing Law",
      body: [
        "These Terms & Conditions are governed by and construed in accordance with the laws of Hungary.",
        "Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts of Hungary.",
      ],
    },
    {
      title: "15. Contact",
      body: [
        "If you have any questions about these Terms & Conditions, please contact us at contact@andrasdenes.com.",
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-0 space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-serif font-bold" style={{ color: "var(--text)" }}>
          Terms &amp; Conditions
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
          Last updated: August 12, 2026, 13:03 CEST
        </p>
        <p className="text-sm mt-4 leading-relaxed" style={{ color: "var(--muted)" }}>
          Welcome to Teapp. Please read these Terms &amp; Conditions carefully before using
          the Service.
        </p>
      </div>

      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text)" }}>
            {section.title}
          </h2>
          {section.body.map((paragraph, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed mb-3"
              style={{ color: "var(--muted)" }}
            >
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Questions about these terms? Email us at{" "}
          <a href="mailto:contact@andrasdenes.com" className="hover:underline" style={{ color: "var(--accent)" }}>
            contact@andrasdenes.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
