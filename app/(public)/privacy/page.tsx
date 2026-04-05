import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "var(--accent)" }}>
        Legal
      </p>
      <h1 className="font-display text-3xl sm:text-4xl mb-2" style={{ color: "var(--text-primary)" }}>
        Privacy Policy
      </h1>
      <p className="text-sm mb-12" style={{ color: "var(--text-secondary)" }}>
        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </p>

      <div className="space-y-10 text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>1. Information We Collect</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            We collect information you provide directly to us, including name, email address, and payment information when you create an account or make a purchase. We also collect usage data such as pages visited and courses accessed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>2. How We Use Your Information</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            We use the information we collect to provide, maintain, and improve our services, process transactions, send transactional emails (enrollment confirmations, receipts), and communicate with you about your account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>3. Information Sharing</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            We do not sell, trade, or rent your personal information to third parties. We share data only with service providers necessary to operate our platform (payment processors, email delivery) under strict confidentiality agreements.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>4. Payment Data</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Payment card information is processed by our payment gateway provider and is never stored on our servers. We store only order records and transaction IDs for accounting purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>5. Cookies</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            We use session cookies to keep you logged in. We do not use advertising or tracking cookies. You can disable cookies in your browser settings, but this may affect your ability to use the platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>6. Data Retention</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            We retain your account data for as long as your account is active. Purchase records are retained for seven years for accounting compliance. You may request deletion of your account at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>7. Your Rights</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            You have the right to access, correct, or delete your personal data. To exercise these rights, please contact us at the email address below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>8. Contact</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:privacy@perseus.local" style={{ color: "var(--accent)" }} className="underline">
              privacy@perseus.local
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
