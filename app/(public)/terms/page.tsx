import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "var(--accent)" }}>
        Legal
      </p>
      <h1 className="font-display text-3xl sm:text-4xl mb-2" style={{ color: "var(--text-primary)" }}>
        Terms of Service
      </h1>
      <p className="text-sm mb-12" style={{ color: "var(--text-secondary)" }}>
        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </p>

      <div className="space-y-10 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>1. Acceptance of Terms</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            By accessing or using Perseus Platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>2. Use of the Platform</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            You may use Perseus Platform for personal, non-commercial learning purposes. You agree not to share course content, reproduce lessons, or redistribute materials without explicit written permission from the course instructor.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>3. Purchases and Payments</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            All course purchases are final unless otherwise stated. Course access is granted immediately upon successful payment. Prices are shown in USD and may be subject to local taxes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>4. Refund Policy</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            We offer a 30-day money-back guarantee on all course purchases. If you are unsatisfied for any reason within 30 days of purchase, contact us for a full refund. Refunds are processed within 5–10 business days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>5. Intellectual Property</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            All course content — including videos, text, downloads, and materials — is owned by the respective instructors and/or Perseus Platform. Purchasing a course grants you a personal, non-transferable licence to access that content.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>6. Account Responsibility</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorised use of your account. Perseus Platform is not liable for losses caused by unauthorised access to your account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>7. Limitation of Liability</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Perseus Platform is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>8. Changes to Terms</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>9. Contact</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            For questions about these terms, contact us at{" "}
            <a href="mailto:legal@perseus.local" style={{ color: "var(--accent)" }} className="underline">
              legal@perseus.local
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
