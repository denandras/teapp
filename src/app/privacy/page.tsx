"use client";

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Data Controller",
      body: [
        "The data controller responsible for the processing of your personal data is András Dénes. If you have any questions about this Privacy Policy or your data, you can reach us at contact@andrasdenes.com.",
        "This Privacy Policy describes how Teapp collects, uses, stores, and protects your personal data, in accordance with the General Data Protection Regulation (GDPR, Regulation (EU) 2016/679) and the applicable Hungarian data protection legislation (Act CXII of 2011 on Informational Self-Determination and Freedom of Information).",
      ],
    },
    {
      title: "2. Data We Collect",
      body: [
        "When you create an account, we collect your email address and a display name. This data is necessary to identify you and enable you to sign in.",
        "When you use the Service, we collect data you provide about your tea preferences, including the teas you add to your collection, your tasting notes and ratings, and your wish list.",
        "If you operate a teahouse account, we additionally collect information about your teahouse, such as its name, address, and the teas you publish as part of your offering.",
      ],
    },
    {
      title: "3. Legal Basis",
      body: [
        "We process your personal data on the following legal bases under the GDPR:",
      ],
      list: [
        "Consent (Article 6(1)(a)) — for the personalisation of your experience and optional features.",
        "Performance of a contract (Article 6(1)(b)) — to provide and operate the Service you have registered for.",
      ],
    },
    {
      title: "4. How We Use Data",
      body: [
        "We use your data to provide, maintain, and improve the Service, including synchronising your collection across devices and enabling sign-in.",
        "We may use aggregated, non-identifiable data to understand how the Service is used and to improve features. We do not sell your personal data to third parties.",
      ],
    },
    {
      title: "5. Data Storage",
      body: [
        "Your personal data is stored on Supabase, a cloud database service whose servers are hosted within the European Union. Reasonable technical and organisational measures are in place to protect your data against unauthorised access, loss, or alteration.",
      ],
    },
    {
      title: "6. Data Retention",
      body: [
        "We retain your personal data only for as long as your account is active. If you delete your account, your personal data, including your collection and tasting notes, will be removed from our systems.",
      ],
    },
    {
      title: "7. Your Rights",
      body: [
        "Under the GDPR you have the right to request access to the personal data we hold about you, to request rectification of inaccurate data, and to request erasure of your data.",
        "You also have the right to data portability, allowing you to receive your data in a structured, machine-readable format, and the right to object to or restrict certain processing activities.",
        "You may exercise these rights by contacting us at contact@andrasdenes.com. You also have the right to lodge a complaint with the Hungarian National Authority for Data Protection and Freedom of Information (NAIH).",
      ],
    },
    {
      title: "8. Cookies",
      body: [
        "Teapp uses cookies only where necessary for the operation of the Service, such as to keep you signed in. We do not use tracking or analytics cookies.",
        "For more information, please see our Cookie Policy.",
      ],
    },
    {
      title: "9. Third Parties",
      body: [
        "We rely on a limited number of third-party processors to operate the Service:",
      ],
      list: [
        "Supabase — for database and authentication services (data hosted within the EU).",
        "Vercel — for hosting the application itself.",
      ],
      body2:
        "Each processor processes data only on our behalf and only as necessary to provide the Service.",
    },
    {
      title: "10. International Transfers",
      body: [
        "Your personal data is processed and stored within the European Union. We do not transfer your personal data outside the EU/EEA. Should this change, we will ensure appropriate safeguards are in place in accordance with the GDPR.",
      ],
    },
    {
      title: "11. Children's Data",
      body: [
        "The Service is not directed at individuals under the age of 16, and we do not knowingly collect personal data from them. If you believe a child under 16 has provided us with personal data, please contact us and we will take steps to remove it.",
      ],
    },
    {
      title: "12. Service Communications",
      body: [
        "We may use the email address associated with your account to contact you about important changes to the Service — such as domain changes, updates to our policies, or other matters that may affect your use of Teapp. These communications are necessary for the performance of our contract with you (Article 6(1)(b) GDPR).",
        "You can review and update your email address in the Settings page at any time. We will not use your email address for marketing or promotional purposes without your separate consent.",
      ],
    },
    {
      title: "13. Changes",
      body: [
        "We may update this Privacy Policy from time to time. We will indicate the date of the latest revision at the top of this page. When material changes are made, you will be asked to review and accept the updated policy within the Service before continuing to use it.",
        "Your continued use of the Service after changes take effect also constitutes acceptance of the revised Privacy Policy.",
      ],
    },
    {
      title: "14. Contact",
      body: [
        "For any questions or requests relating to your personal data, contact András Dénes at contact@andrasdenes.com.",
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-0 space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-serif font-bold" style={{ color: "var(--text)" }}>
          Privacy Policy
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
          Last updated: August 2026
        </p>
        <p className="text-sm mt-4 leading-relaxed" style={{ color: "var(--muted)" }}>
          This Privacy Policy explains how Teapp collects, uses, and protects your personal
          data, in line with the GDPR and Hungarian data protection law.
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
          {section.list && (
            <ul className="list-disc pl-6 mb-3 space-y-1.5">
              {section.list.map((item, i) => (
                <li key={i} className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {item}
                </li>
              ))}
            </ul>
          )}
          {section.body2 && (
            <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--muted)" }}>
              {section.body2}
            </p>
          )}
        </section>
      ))}

      <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Questions about your data? Email us at{" "}
          <a href="mailto:contact@andrasdenes.com" className="hover:underline" style={{ color: "var(--accent)" }}>
            contact@andrasdenes.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
