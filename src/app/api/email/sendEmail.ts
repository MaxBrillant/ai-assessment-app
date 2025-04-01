"use server";

const nodemailer = require("nodemailer");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email sending function
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  try {
    const result = await transporter.sendMail({
      from: process.env.SMTP_USER, // Sender email
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export async function sendWelcomeEmail(userEmail: string) {
  console.log("Sending welcome email...");
  await sendEmail({
    to: userEmail,
    subject: "Welcome to Quizdom AI",
    html: `
      <h1>Welcome Aboard! 🚀</h1>
      <p>Thank you for joining Quizdom AI.</p>
      <h3>What Awaits You:</h3>
      <ul>
        <li>Upload your documents and create assessments.</li>
        <li>Quickly generate quality questions and answers for your assessments.</li>
        <li>Export your assessments and submissions to various formats.</li>
        <li>Share assessments with colleagues and friends.</li>
        <li>Review and grade received submissions.</li>
      </ul>
      <br/>
      <p>If you have any questions or need assistance, please don't hesitate to reach out to us at <a href="mailto:support@getquizdom.com">support@getquizdom.com</a>.</p>
    `,
  });

  console.log("Welcome email sent.");
}

export async function sendNewAssessmentCreatedEmail(
  userEmail: string,
  assessmentName: string,
  assessmentLink: string
) {
  console.log("Sending new assessment created email...");
  await sendEmail({
    to: userEmail,
    subject: `New Assessment Created: ${assessmentName}`,
    html: `
      <h1>You have just created a new assessment</h1>
      <p>Assessment Name: ${assessmentName}</p>
      <p>Assessment Link: <a href="${assessmentLink}">${assessmentLink}</a></p>
      <h3>Next steps:</h3>
      <ul>
        <li>Publish your assessment.</li>
        <li>Share the assessment link with colleagues and friends.</li>
        <li>Review and grade received submissions.</li>
      </ul>
      <br/>
      <p>If you have any questions or need assistance, please don't hesitate to reach out to us at <a href="support@getquizdom.com">support@getquizdom.com</a>.</p>
    `,
  });

  console.log("New assessment created email sent.");
}

export async function sendNewSubmissionReceivedEmail(
  userEmail: string,
  assessmentName: string,
  submissionLink: string
) {
  console.log("Sending new submission received email...");
  await sendEmail({
    to: userEmail,
    subject: `New Submission Received: ${assessmentName}`,
    html: `
      <h1>You have just received a new submission for your assessment "${assessmentName}"</h1>
      <p>Submission Link: <a href="${submissionLink}">${submissionLink}</a></p>
      <p>You can view the submission and grade it.</p>
      <br/>
      <p>If you have any questions or need assistance, please don't hesitate to reach out to us at <a href="mailto:support@getquizdom.com">support@getquizdom.com</a>.</p>
    `,
  });

  console.log("New submission received email sent.");
}

export async function sendFeedbackEmail(userEmail: string, feedback: string) {
  console.log("Sending feedback email...");
  await sendEmail({
    to: "ndashimax37@gmail.com",
    subject: "Feedback to Quizdom AI",
    html: `
      <h1>Feedback Received from ${userEmail}</h1>
      <p>${feedback}</p>
      <br/>
      <p>Time: ${new Date().toLocaleString()}</p>
    `,
  });

  console.log("Feedback email sent.");
}
