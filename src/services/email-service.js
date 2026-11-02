import "dotenv/config";
import nodemailer from "nodemailer";

const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    EMAIL_FROM
} = process.env;

// Create the SMTP connection configuration.
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: SMTP_SECURE === "true",
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    }
});

// Send a workout reminder.
export async function sendWorkoutReminderEmail({
    to,
    userName,
    workoutName,
    scheduledAt
}) {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) {
        throw new Error("Email SMTP configuration is incomplete.");
    }

    const workoutDate = new Date(scheduledAt);

    const formattedDate = workoutDate.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata"
    });

    const mailOptions = {
        from: EMAIL_FROM,
        to,
        subject: `Workout reminder: ${workoutName}`,

        text: `
Hi ${userName || "there"},

This is a reminder about your upcoming workout: ${workoutName}.

Scheduled time: ${formattedDate}

Get ready and have a great workout!

Workout Tracker
        `.trim(),

        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Your workout reminder 🏋️</h2>

                <p>Hi ${escapeHtml(userName || "there")},</p>

                <p>Your upcoming workout is approaching.</p>

                <div style="padding: 16px; background: #f3f4f6; border-radius: 8px;">
                    <p>
                        <strong>Workout:</strong>
                        ${escapeHtml(workoutName)}
                    </p>

                    <p>
                        <strong>Scheduled time:</strong>
                        ${escapeHtml(formattedDate)}
                    </p>
                </div>

                <p>Get ready and have a great workout!</p>
                <p>— Workout Tracker</p>
            </div>
        `
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("Workout reminder accepted by SMTP server.");

    return result;
}

// Escape user-controlled text before inserting it into HTML.
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

export async function verifyEmailConnection() {
  await transporter.verify();

  console.log("SMTP connection verified successfully.");
}