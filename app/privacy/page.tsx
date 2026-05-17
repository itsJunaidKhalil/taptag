import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How TapTag collects, uses, stores and shares your personal information, and the rights you have over your data.",
};

const LAST_UPDATED = "May 13, 2026";
const CONTACT_EMAIL = "privacy@taptag.biz";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="glass p-6 sm:p-10 rounded-3xl shadow-soft-lg">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold gradient-text mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Last updated: {LAST_UPDATED}
          </p>

          <Section title="1. Who we are">
            <p>
              TapTag (&ldquo;TapTag&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates the website
              {" "}
              <Link href="/" className="link">
                https://taptag.biz
              </Link>{" "}
              and the related digital business card service. This Privacy
              Policy explains what personal data we collect, why we collect
              it, how we use it, who we share it with, and what your rights
              are under the EU/UK GDPR, the California Consumer Privacy Act
              (CCPA/CPRA) and similar laws.
            </p>
            <p>
              For privacy-related requests you can contact us at{" "}
              <a className="link" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="2. Data we collect">
            <h3 className="subhead">Account information</h3>
            <ul>
              <li>
                Email address and (if you sign up with email + password) a
                hashed password.
              </li>
              <li>
                When you sign in with Google, GitHub or LinkedIn we receive
                the email address, profile name and avatar URL that the
                provider returns. We do <strong>not</strong> receive your
                provider password.
              </li>
            </ul>

            <h3 className="subhead">Profile content you choose to publish</h3>
            <ul>
              <li>Username, full name, company/role, short bio.</li>
              <li>
                Phone number, public contact email (can differ from your login
                email), website.
              </li>
              <li>Profile photo and banner image.</li>
              <li>Links to your social profiles and any custom links.</li>
              <li>Theme preferences and link ordering.</li>
            </ul>
            <p className="muted">
              Everything in this category is published on your public profile
              at <code>/your-username</code> and is therefore visible to
              anyone with the URL. Don&apos;t add anything you don&apos;t want public.
            </p>

            <h3 className="subhead">Usage analytics</h3>
            <ul>
              <li>
                Aggregated profile views and link-click counts for the owner
                of each profile.
              </li>
              <li>
                Coarse device class (mobile vs desktop) and HTTP referrer
                only when the visitor has allowed analytics (via the first-visit
                cookie banner or cookie preferences).
              </li>
            </ul>
            <p className="muted">
              We do <strong>not</strong> store IP addresses, precise location,
              fingerprints, or any data that personally identifies a profile
              visitor.
            </p>

            <h3 className="subhead">Cookies and local storage</h3>
            <ul>
              <li>
                <strong>Essential</strong>: a Supabase auth session token
                stored in <code>localStorage</code> so you stay signed in.
              </li>
              <li>
                <strong>Analytics</strong>: a preference flag stored as
                <code>taptag-consent-v1</code> in <code>localStorage</code>.
                Profile view and link-click events are sent only when you
                choose <em>Essential cookies</em> (banner) or enable
                Analytics in cookie preferences — both include analytics for
                profile owners.
              </li>
              <li>
                <strong>Marketing</strong>: reserved for optional product
                updates and surveys. Enabled only if you choose{" "}
                <em>Accept all</em> on the first-visit banner or turn on
                Marketing in cookie preferences. Not used for third-party
                advertising.
              </li>
            </ul>
          </Section>

          <Section title="3. How we use your data">
            <ul>
              <li>To operate your account and render your public profile.</li>
              <li>To send transactional email (verification, password reset, security alerts).</li>
              <li>
                To show you analytics on your own profile (view counts, link
                clicks).
              </li>
              <li>
                To detect abuse — for example to action user-submitted
                reports — and to enforce our terms of service.
              </li>
              <li>
                To improve the product (aggregate, anonymous usage trends).
              </li>
            </ul>
            <p>
              We do <strong>not</strong> sell personal data and we do not
              share it with advertisers. We do not use your content to train
              third-party AI models.
            </p>
          </Section>

          <Section title="4. Legal basis (GDPR Art. 6)">
            <ul>
              <li>
                <strong>Contract</strong> (Art. 6(1)(b)) — providing the
                service you signed up for.
              </li>
              <li>
                <strong>Legitimate interests</strong> (Art. 6(1)(f)) —
                preventing abuse, securing the platform, improving features.
                You can object at any time using the contact email above.
              </li>
              <li>
                <strong>Consent</strong> (Art. 6(1)(a)) — analytics and
                marketing. On your first visit we show a cookie banner with
                two choices: <em>Essential cookies</em> (essential +
                analytics) or <em>Accept all</em> (essential, analytics, and
                marketing). Until you choose, analytics events are not sent.
                You can change or withdraw consent anytime via cookie
                preferences in the footer or on public profiles.
              </li>
              <li>
                <strong>Legal obligation</strong> (Art. 6(1)(c)) — when we
                must retain records for tax, fraud or regulatory reasons.
              </li>
            </ul>
          </Section>

          <Section title="5. Who we share data with">
            <p>
              We use a small number of trusted infrastructure providers
              acting as data processors on our behalf:
            </p>
            <ul>
              <li>
                <strong>Supabase</strong> (database, authentication, file
                storage) — data may be stored in their EU or US regions.
              </li>
              <li>
                <strong>Vercel</strong> (hosting, edge runtime, image
                generation) — globally distributed CDN.
              </li>
              <li>
                <strong>Google / GitHub / LinkedIn</strong> — only if you
                choose to sign in with that provider.
              </li>
            </ul>
            <p>
              Each processor is bound by a data-processing agreement and only
              handles data to deliver their service. We never sell or rent
              personal data to third parties.
            </p>
          </Section>

          <Section title="6. International transfers">
            <p>
              If you access TapTag from outside the country where our
              infrastructure providers store data, your information may be
              transferred internationally. We rely on Standard Contractual
              Clauses (SCCs) and equivalent safeguards required by GDPR
              Chapter V.
            </p>
          </Section>

          <Section title="7. Data retention">
            <ul>
              <li>
                <strong>Active accounts</strong>: we keep your data for as
                long as your account exists.
              </li>
              <li>
                <strong>Soft-deleted accounts</strong>: when you delete your
                account from <Link className="link" href="/dashboard/settings">Settings</Link>, your
                profile is hidden immediately and a 30-day recovery window
                begins. After 30 days the row is purged and the email
                becomes reusable.
              </li>
              <li>
                <strong>Analytics events</strong>: retained for 24 months,
                then aggregated and the raw rows are deleted.
              </li>
              <li>
                <strong>Audit log</strong>: actions taken by administrators
                are retained for 24 months for security and accountability.
              </li>
            </ul>
          </Section>

          <Section title="8. Your rights">
            <p>Subject to applicable law you have the right to:</p>
            <ul>
              <li>
                <strong>Access</strong> the personal data we hold about you
                — request it any time via{" "}
                <Link className="link" href="/dashboard/settings">
                  Settings → Export your data
                </Link>
                . The export is a single JSON file containing your profile,
                links, analytics events, and account metadata.
              </li>
              <li>
                <strong>Rectify</strong> inaccurate data — edit it directly
                in the dashboard.
              </li>
              <li>
                <strong>Erase</strong> your data — the &ldquo;Delete account&rdquo;
                action in Settings starts a 30-day soft delete; after that
                window your data is hard-deleted.
              </li>
              <li>
                <strong>Restrict</strong> or <strong>object</strong> to
                processing based on legitimate interests.
              </li>
              <li>
                <strong>Portability</strong> — the JSON export above is
                machine-readable and reusable.
              </li>
              <li>
                <strong>Withdraw consent</strong> for analytics or marketing
                via the cookie preferences dialog in the site footer or on any
                public profile (use &ldquo;Reject all&rdquo; or turn off
                individual categories and save).
              </li>
              <li>
                <strong>Lodge a complaint</strong> with your local data
                protection authority (e.g. your country&apos;s DPA in the EU,
                the ICO in the UK).
              </li>
            </ul>
            <p>
              To exercise any right, email{" "}
              <a className="link" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              . We aim to respond within 30 days.
            </p>
          </Section>

          <Section title="9. Children">
            <p>
              TapTag is not directed at children under 16. We do not
              knowingly collect data from anyone under 16. If you believe a
              child has signed up, contact us and we will delete the account.
            </p>
          </Section>

          <Section title="10. Security">
            <p>
              All traffic is served over HTTPS. Passwords are hashed by
              Supabase Auth (bcrypt). Administrative actions are logged. We
              follow the principle of least privilege: routine queries use a
              user-scoped token, and only specific server-side endpoints use
              the elevated service role key.
            </p>
            <p>
              No system is 100% secure. If you discover a vulnerability,
              please email{" "}
              <a className="link" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>{" "}
              before disclosing it publicly.
            </p>
          </Section>

          <Section title="11. Changes to this policy">
            <p>
              We will update the &ldquo;Last updated&rdquo; date at the top of this
              page when this policy changes. Material changes will be
              announced by email or via an in-app notice before they take
              effect.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              Privacy questions, data-subject requests, abuse reports:{" "}
              <a className="link" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>
        </div>
      </div>

      <style>{`
        .privacy-section p { color: var(--text); opacity: 0.9; margin-bottom: 0.75rem; }
        .privacy-section ul { list-style: disc; padding-left: 1.25rem; margin-bottom: 0.75rem; color: var(--text); opacity: 0.9; }
        .privacy-section li { margin-bottom: 0.4rem; }
        .privacy-section .subhead { font-weight: 700; margin-top: 1rem; margin-bottom: 0.25rem; color: var(--text); }
        .privacy-section .muted { font-size: 0.875rem; opacity: 0.7; }
        .privacy-section .link { color: #4a3aff; text-decoration: underline; font-weight: 500; }
        .privacy-section code { padding: 0 0.25rem; border-radius: 4px; background: rgba(0,0,0,0.06); font-size: 0.85em; }
        .dark .privacy-section code { background: rgba(255,255,255,0.08); }
      `}</style>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="privacy-section mb-7 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-heading font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}
