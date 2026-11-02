import "dotenv/config";

import {
  verifyEmailConnection,
  sendWorkoutReminderEmail
} from "./services/email-service.js";

try {
  await verifyEmailConnection();

  console.log("SMTP verification successful.");

  await sendWorkoutReminderEmail({
    to: process.env.SMTP_USER,
    userName: "Sanjay",
    workoutName: "Test Workout",
    scheduledAt: new Date(Date.now() + 60 * 60 * 1000)
  });

  console.log("Test email sent successfully.");
} catch (error) {
  console.error("Email test failed:", error.message);

  process.exitCode = 1;
}