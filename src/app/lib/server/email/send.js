const RESEND_URL = "https://api.resend.com/emails";
const TIMEOUT_MS = 5000;

/**
 * @param {{ to: string | null | undefined, subject: string, html: string }} email
 * @returns {Promise<boolean>} whether Resend accepted the email
 */
export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn(
      `RESEND_API_KEY or EMAIL_FROM is not set; skipped email "${subject}"`,
    );
    return false;
  }
  if (!to) {
    console.error(`No recipient for email "${subject}"`);
    return false;
  }

  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: subject.replace(/[\r\n]+/g, " "),
        html,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`Resend rejected email "${subject}": HTTP ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Failed to send email "${subject}":`, err);
    return false;
  }
}
