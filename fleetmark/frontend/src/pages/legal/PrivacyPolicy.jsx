import React from "react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--ink)",
        display: "grid",
        placeItems: "center",
        padding: "var(--space-6)",
      }}
    >
      <article
        style={{
          width: "100%",
          maxWidth: 780,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-8)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "var(--space-6)" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--blue)",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            Back to Home
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "var(--space-4)" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius-md)",
              background: "var(--blue-light)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--blue)" }}>
              shield
            </span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Privacy Policy
            </h1>
            <p className="mono" style={{ margin: "4px 0 0", fontSize: 11, color: "var(--dim)" }}>
              Last Updated: March 2026
            </p>
          </div>
        </div>

        <p style={{ color: "var(--mid)", fontSize: 14, lineHeight: 1.7, marginBottom: "var(--space-6)" }}>
          Fleetmark / SSBS (Smart School Bus System) is operated by the logistics team at 1337 School, Ben Guerir, Morocco.
          This privacy policy explains what personal data we collect, how we use it, and your rights regarding your information.
        </p>

        {/* Section helper */}
        {[
          {
            icon: "database",
            title: "1. Data We Collect",
            content: (
              <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                <li><strong>42 Intra Login (login_42)</strong> — Your unique username from the 42 Intra platform, used for authentication and identification.</li>
                <li><strong>Email Address</strong> — The email associated with your 42 Intra account, used for account identification purposes.</li>
                <li><strong>Home Bus Station Preference</strong> — Your selected pickup stop within Ben Guerir, used to show you relevant shuttle trips.</li>
                <li><strong>Reservation History</strong> — Records of your seat reservations including trip details, timestamps, and cancellations.</li>
                <li><strong>Session Tokens</strong> — JWT authentication tokens stored in your browser's localStorage to maintain your session.</li>
              </ul>
            ),
          },
          {
            icon: "tune",
            title: "2. How We Use Your Data",
            content: (
              <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                <li><strong>Authentication</strong> — Verifying your identity via 42 OAuth to grant access to the platform.</li>
                <li><strong>Station Assignment</strong> — Associating your home station so you see available buses near your stop.</li>
                <li><strong>Seat Reservation</strong> — Processing and managing your shuttle seat bookings.</li>
                <li><strong>Service Improvement</strong> — Aggregated, anonymized usage data helps the logistics team optimize bus schedules and routes.</li>
              </ul>
            ),
          },
          {
            icon: "schedule",
            title: "3. Data Retention",
            content: (
              <>
                <p style={{ margin: 0 }}>
                  <strong>Session data</strong> (JWT tokens, language preferences, theme) is stored in your browser's localStorage and is cleared when you log out.
                </p>
                <p style={{ margin: "8px 0 0" }}>
                  <strong>Reservation data</strong> is stored on our servers for the duration of the academic semester.
                  Historical reservation records may be retained for up to 12 months for service analytics.
                </p>
                <p style={{ margin: "8px 0 0" }}>
                  <strong>Account data</strong> (login_42, email, station) is stored until the account is deleted or the student is no longer enrolled at 1337 School.
                </p>
              </>
            ),
          },
          {
            icon: "verified_user",
            title: "4. Your Rights",
            content: (
              <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                <li><strong>View your data</strong> — Access your profile, station, and reservation history at any time through the app.</li>
                <li><strong>Update your station</strong> — Change your home station via Settings at any time.</li>
                <li><strong>View reservation history</strong> — See all past and upcoming reservations in the My Trips section.</li>
                <li><strong>Request account deletion</strong> — Contact the 1337 School logistics team to request full account and data deletion.</li>
                <li><strong>Data portability</strong> — You may request an export of your personal data by contacting the admin team.</li>
              </ul>
            ),
          },
          {
            icon: "lock",
            title: "5. Security",
            content: (
              <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                <li><strong>JWT Authentication</strong> — All API requests are authenticated using JSON Web Tokens with automatic refresh.</li>
                <li><strong>HTTPS Only</strong> — All data transmitted between your browser and our servers is encrypted via TLS/SSL.</li>
                <li><strong>HashiCorp Vault</strong> — Sensitive credentials and secrets are managed through HashiCorp Vault, never stored in environment files.</li>
                <li><strong>WAF Protection</strong> — Web Application Firewall (ModSecurity) protects against common web attacks including SQL injection and XSS.</li>
                <li><strong>OAuth 2.0</strong> — We never handle your 42 password directly. Authentication is delegated to the 42 Intra OAuth provider.</li>
              </ul>
            ),
          },
          {
            icon: "cookie",
            title: "6. Cookies & Local Storage",
            content: (
              <p style={{ margin: 0 }}>
                Fleetmark does not use tracking cookies. We use browser localStorage to store:
                authentication tokens (<code>fleetmark_access</code>, <code>fleetmark_refresh</code>),
                user profile data (<code>fleetmark_user</code>),
                theme preference (<code>fleetmark_theme</code>),
                and language preference (<code>fleetmark_lang</code>).
                No third-party analytics or advertising cookies are used.
              </p>
            ),
          },
          {
            icon: "share",
            title: "7. Data Sharing",
            content: (
              <p style={{ margin: 0 }}>
                Your personal data is not shared with any third parties. Data is only accessible by the 1337 School logistics staff who operate the SSBS shuttle service.
                We do not sell, trade, or transfer your personal information to outside parties.
              </p>
            ),
          },
          {
            icon: "contact_mail",
            title: "8. Contact",
            content: (
              <p style={{ margin: 0 }}>
                For any questions regarding this privacy policy or your personal data, please contact the 1337 School logistics team at Ben Guerir, Morocco.
                You may also reach out through the 42 Intra platform or contact any member of the Fleetmark development team.
              </p>
            ),
          },
        ].map((section) => (
          <section
            key={section.title}
            style={{
              marginBottom: "var(--space-5)",
              padding: "var(--space-4)",
              borderRadius: "var(--radius-md)",
              background: "var(--surface2)",
              border: "1px solid var(--line2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, color: "var(--blue)" }}
              >
                {section.icon}
              </span>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{section.title}</h2>
            </div>
            <div style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.7 }}>
              {section.content}
            </div>
          </section>
        ))}

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "var(--space-4)",
            marginTop: "var(--space-4)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p className="mono" style={{ margin: 0, fontSize: 11, color: "var(--dim)" }}>
            © 2026 Fleetmark / SSBS — 1337 School Ben Guerir
          </p>
          <Link
            to="/terms"
            style={{ fontSize: 13, color: "var(--blue)", fontWeight: 600, textDecoration: "none" }}
          >
            Terms of Service →
          </Link>
        </div>
      </article>
    </div>
  );
}
