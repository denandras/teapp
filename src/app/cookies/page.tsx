"use client";

export default function CookiesPage() {
  const sections = [
    {
      title: "What are cookies?",
      body: [
        "Cookies are small text files that are stored on your device when you visit a website. They allow a website to recognise your browser and remember certain information, such as your sign-in status or preferences.",
        "Cookies can be 'session' cookies, which are deleted when you close your browser, or 'persistent' cookies, which remain on your device for a set period.",
      ],
    },
    {
      title: "Essential cookies",
      body: [
        "Teapp uses a single essential cookie category: authentication. These cookies are necessary for the Service to function, as they allow us to recognise you and keep you signed in while you use the app.",
        "These cookies are strictly required to provide the Service you have requested. Without them, you would not be able to sign in or use Teapp.",
      ],
    },
    {
      title: "No tracking or analytics",
      body: [
        "Teapp does not use tracking cookies, advertising cookies, or third-party analytics cookies. We do not profile your browsing behaviour across sites, and we do not share cookie data with advertising partners.",
        "This policy may evolve if we introduce analytics in the future; in that case we will update this Cookie Policy and ask for your consent where required.",
      ],
    },
    {
      title: "How to manage cookies",
      body: [
        "Essential cookies are required for the Service to function and cannot be disabled without affecting your ability to use Teapp. However, most browsers allow you to view, delete, or block cookies through their settings.",
        "You can typically manage cookies via your browser's settings menu, for example under 'Privacy' or 'Cookies'. Please note that blocking or deleting essential cookies may prevent you from signing in to the Service.",
        "To find out more about managing cookies in your browser, visit the help section of your browser or your device's settings.",
      ],
    },
    {
      title: "Contact",
      body: [
        "If you have any questions about how Teapp uses cookies, please contact us at contact@andrasdenes.com.",
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-0 space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-serif font-bold" style={{ color: "var(--text)" }}>
          Cookie Policy
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
          Last updated: August 2026
        </p>
        <p className="text-sm mt-4 leading-relaxed" style={{ color: "var(--muted)" }}>
          This Cookie Policy explains how and why Teapp uses cookies and similar
          technologies, and how you can manage them.
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
          Questions about cookies? Email us at{" "}
          <a href="mailto:contact@andrasdenes.com" className="hover:underline" style={{ color: "var(--accent)" }}>
            contact@andrasdenes.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
