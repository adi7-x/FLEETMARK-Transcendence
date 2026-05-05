import React from "react";
import { Link } from "react-router-dom";

export default function TermsOfService() {
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
              background: "var(--green-light)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--green)" }}>
              gavel
            </span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Terms of Service
            </h1>
            <p className="mono" style={{ margin: "4px 0 0", fontSize: 11, color: "var(--dim)" }}>
              Last Updated: March 2026
            </p>
          </div>
        </div>

        <p style={{ color: "var(--mid)", fontSize: 14, lineHeight: 1.7, marginBottom: "var(--space-6)" }}>
          By using Fleetmark / SSBS (Smart School Bus System), you agree to be bound by these terms of service.
          Please read them carefully before using the platform.
        </p>

        {[
          {
            icon: "person_check",
            title: "1. Eligibility",
            content: (
              <>
                <p style={{ margin: 0 }}>
                  Fleetmark is available exclusively to:
                </p>
                <ul style={{ margin: "8px 0 0", paddingLeft: 20, display: "grid", gap: 6 }}>
                  <li>Active students currently enrolled at 1337 School (Ben Guerir campus) with a valid 42 Intra account.</li>
                  <li>1337 School logistics staff members with LOGISTICS_STAFF role assigned by an administrator.</li>
                  <li>Approved bus drivers with DRIVER accounts created by logistics staff.</li>
                </ul>
                <p style={{ margin: "8px 0 0" }}>
                  Access is granted through 42 Intra OAuth authentication. If your 42 account is deactivated or you are no longer enrolled, your access to Fleetmark will be revoked.
                </p>
              </>
            ),
          },
          {
            icon: "rule",
            title: "2. Acceptable Use",
            content: (
              <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                <li><strong>Personal use only</strong> — Reserve seats only for yourself. Do not book seats on behalf of others or create multiple reservations you do not intend to use.</li>
                <li><strong>No system abuse</strong> — Do not attempt to manipulate the reservation system, exploit bugs, or use automated tools to gain unfair advantage in booking seats.</li>
                <li><strong>Accurate information</strong> — Ensure your home station is set correctly. Booking seats for stations you do not use wastes limited bus capacity.</li>
                <li><strong>Respectful conduct</strong> — Treat bus drivers, other passengers, and logistics staff with respect. Report issues through the in-app reporting system.</li>
              </ul>
            ),
          },
          {
            icon: "event_seat",
            title: "3. Reservation Policy",
            content: (
              <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                <li><strong>One seat per trip</strong> — Each student may reserve only one seat per shuttle trip.</li>
                <li><strong>Cancellation</strong> — If you cannot make your reserved trip, please cancel your reservation as early as possible so the seat can be made available to other students.</li>
                <li><strong>No-shows</strong> — Repeated no-shows (reserving a seat but not boarding the bus) may result in temporary restriction of booking privileges.</li>
                <li><strong>Seat availability</strong> — Reservations are on a first-come, first-served basis. Fleetmark does not guarantee seat availability on any particular trip.</li>
                <li><strong>Confirmation</strong> — A reservation is confirmed only when you receive the in-app confirmation. If the trip is full, your booking will be rejected.</li>
              </ul>
            ),
          },
          {
            icon: "schedule",
            title: "4. Service Hours",
            content: (
              <>
                <p style={{ margin: 0 }}>
                  The Fleetmark night shuttle service operates during the following windows:
                </p>
                <ul style={{ margin: "8px 0 0", paddingLeft: 20, display: "grid", gap: 6 }}>
                  <li><strong>Peak Hours:</strong> 21:00 — 00:00 (two buses on separate routes)</li>
                  <li><strong>Transition:</strong> 00:00 — 01:00 (both buses, full coverage)</li>
                  <li><strong>Late Night:</strong> 03:00 — 06:00 (one bus, consolidated route)</li>
                </ul>
                <p style={{ margin: "8px 0 0" }}>
                  Service schedules are subject to change based on demand, holidays, and operational requirements. Check the app for the most up-to-date schedule.
                </p>
              </>
            ),
          },
          {
            icon: "warning",
            title: "5. Liability",
            content: (
              <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                <li>1337 School and the Fleetmark team are not liable for missed buses due to system downtime, network issues, or technical failures.</li>
                <li>The shuttle service is provided as a convenience. 1337 School does not guarantee uninterrupted service availability.</li>
                <li>Bus schedules and routes may be modified or cancelled with or without prior notice due to weather, road conditions, or operational constraints.</li>
                <li>Personal belongings left on the shuttle are the responsibility of the passenger.</li>
              </ul>
            ),
          },
          {
            icon: "block",
            title: "6. Account Termination",
            content: (
              <>
                <p style={{ margin: 0 }}>
                  Accounts may be suspended or terminated in the following cases:
                </p>
                <ul style={{ margin: "8px 0 0", paddingLeft: 20, display: "grid", gap: 6 }}>
                  <li>Violation of the acceptable use policy</li>
                  <li>Repeated no-shows or reservation abuse</li>
                  <li>Deactivation of the associated 42 Intra account</li>
                  <li>Expulsion or withdrawal from 1337 School</li>
                  <li>At the discretion of the logistics staff for any behavior that disrupts the service</li>
                </ul>
                <p style={{ margin: "8px 0 0" }}>
                  Suspended users will be notified and may appeal through the 1337 School administration.
                </p>
              </>
            ),
          },
          {
            icon: "update",
            title: "7. Changes to Terms",
            content: (
              <p style={{ margin: 0 }}>
                These terms may be updated at any time. Significant changes will be communicated through the app's announcement system.
                Continued use of Fleetmark after changes constitutes acceptance of the revised terms.
                The "Last Updated" date at the top of this page indicates when these terms were last modified.
              </p>
            ),
          },
          {
            icon: "info",
            title: "8. Intellectual Property",
            content: (
              <p style={{ margin: 0 }}>
                Fleetmark / SSBS is a student project developed as part of the 42 curriculum (ft_transcendence v20.0).
                The source code, design, and assets are the collective work of the project team.
                This service is provided for educational and operational purposes at 1337 School only.
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
                style={{ fontSize: 18, color: "var(--green)" }}
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
            to="/privacy"
            style={{ fontSize: 13, color: "var(--blue)", fontWeight: 600, textDecoration: "none" }}
          >
            Privacy Policy →
          </Link>
        </div>
      </article>
    </div>
  );
}
