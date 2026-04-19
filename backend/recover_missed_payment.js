/**
 * Recovery script: finds application_fee payments that completed on Stripe
 * but were never recorded in MongoDB (due to webhook body-parse bug).
 * Creates missing applications and sends confirmation emails.
 *
 * Usage: node backend/recover_missed_payment.js
 */

require("dotenv").config({ path: __dirname + "/.env" });

const Stripe = require("stripe");
const { MongoClient } = require("mongodb");
const { Resend } = require("resend");
const { v4: uuidv4 } = require("uuid");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || "gitb_lms";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "noreply@gitb.lt";
const APPLICATION_FEE = parseFloat(process.env.APPLICATION_FEE_EUR || "50");

async function sendApplicationReceivedEmail(email, firstName, courseTitle) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #0B3B2C; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">GITB</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #0B3B2C;">Application Received!</h2>
        <p>Dear ${firstName},</p>
        <p>Thank you for applying to <strong>${courseTitle}</strong> at GITB. We have received your application and payment.</p>
        <p>Our admissions team will review your application and be in touch within 3–5 business days.</p>
        <p style="color: #555;">If you have any questions, please contact us at
          <a href="mailto:admissions@gitb.lt" style="color: #3d7a4a;">admissions@gitb.lt</a>.
        </p>
        <p>Best regards,<br><strong>GITB Admissions Team</strong></p>
      </div>
      <p style="color:#555; font-size:12px; text-align:center; margin-top:10px;">
        Vilnius, Lithuania · admissions@gitb.lt
      </p>
    </div>`;

  return resend.emails.send({
    from: `GITB <${ADMIN_EMAIL}>`,
    to: email,
    subject: `Application Received – ${courseTitle} | GITB`,
    html,
  });
}

async function sendAdminNotificationEmail(application) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0B3B2C;">New Application (Recovered from Stripe)</h2>
      <table style="width:100%; border-collapse:collapse;">
        <tr><td style="padding:6px; font-weight:bold;">Name</td><td>${application.first_name} ${application.last_name}</td></tr>
        <tr><td style="padding:6px; font-weight:bold;">Email</td><td>${application.email}</td></tr>
        <tr><td style="padding:6px; font-weight:bold;">Course</td><td>${application.course_title}</td></tr>
        <tr><td style="padding:6px; font-weight:bold;">Phone</td><td>${application.phone || "—"}</td></tr>
        <tr><td style="padding:6px; font-weight:bold;">Country</td><td>${application.country || "—"}</td></tr>
        <tr><td style="padding:6px; font-weight:bold;">Payment</td><td>€${APPLICATION_FEE} (Stripe confirmed)</td></tr>
        <tr><td style="padding:6px; font-weight:bold;">Stripe Session</td><td>${application.stripe_session_id}</td></tr>
        <tr><td style="padding:6px; font-weight:bold;">Paid At</td><td>${application.paid_at}</td></tr>
      </table>
      <p style="color:#888; font-size:12px;">This application was recovered from Stripe after a webhook delivery failure.</p>
    </div>`;

  return resend.emails.send({
    from: `GITB <${ADMIN_EMAIL}>`,
    to: "admissions@gitb.lt",
    subject: `[RECOVERED] New Application — ${application.first_name} ${application.last_name} (${application.course_title})`,
    html,
  });
}

async function main() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db(DB_NAME);
  console.log("Connected to MongoDB");

  // Search Stripe for completed checkout sessions with application_fee type
  // Look back 7 days to be safe
  const since = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;

  console.log("\nSearching Stripe for completed application_fee sessions...");
  const sessions = await stripe.checkout.sessions.list({
    limit: 100,
    created: { gte: since },
  });

  const missed = [];
  for (const session of sessions.data) {
    const meta = session.metadata || {};
    if (
      session.payment_status === "paid" &&
      meta.type === "application_fee" &&
      meta.application_id
    ) {
      // Check if already in DB
      const exists = await db.collection("applications").findOne({ id: meta.application_id });
      if (!exists) {
        missed.push(session);
      } else {
        console.log(`  ✓ Already in DB: ${meta.email} (${meta.application_id})`);
      }
    }
  }

  if (missed.length === 0) {
    console.log("\nNo missed payments found — all paid sessions are already in the database.");
    await client.close();
    return;
  }

  console.log(`\nFound ${missed.length} missed payment(s):\n`);

  for (const session of missed) {
    const meta = session.metadata;
    const paidAt = new Date(session.created * 1000).toISOString();

    const application = {
      id: meta.application_id,
      first_name: meta.first_name || "",
      last_name: meta.last_name || "",
      email: meta.email || "",
      phone: meta.phone || null,
      course_id: meta.course_id || null,
      course_title: meta.course_title || null,
      country: meta.country || null,
      city: meta.city || null,
      address: meta.address || null,
      date_of_birth: meta.date_of_birth || null,
      identification_url: meta.identification_url || null,
      high_school_certificate_url: meta.high_school_certificate_url || null,
      motivation: meta.motivation || null,
      status: "pending",
      payment_status: "paid",
      stripe_session_id: session.id,
      payment_amount: APPLICATION_FEE,
      created_at: paidAt,
      paid_at: paidAt,
    };

    console.log(`Processing: ${application.first_name} ${application.last_name} <${application.email}>`);
    console.log(`  Course:  ${application.course_title}`);
    console.log(`  Paid at: ${paidAt}`);
    console.log(`  Session: ${session.id}`);

    // Insert into DB
    await db.collection("applications").insertOne(application);
    console.log(`  ✓ Application inserted into MongoDB`);

    // Email the applicant
    try {
      await sendApplicationReceivedEmail(application.email, application.first_name, application.course_title || "your chosen programme");
      console.log(`  ✓ Confirmation email sent to ${application.email}`);
    } catch (err) {
      console.error(`  ✗ Failed to email applicant: ${err.message}`);
    }

    // Email admissions
    try {
      await sendAdminNotificationEmail(application);
      console.log(`  ✓ Admin notification sent to admissions@gitb.lt`);
    } catch (err) {
      console.error(`  ✗ Failed to email admin: ${err.message}`);
    }

    console.log();
  }

  console.log("Recovery complete.");
  await client.close();
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
