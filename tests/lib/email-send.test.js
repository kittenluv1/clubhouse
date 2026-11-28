/**
 * @jest-environment node
 */
import { sendEmail } from "@/app/lib/server/email/send";

const email = { to: "student@ucla.edu", subject: "Hi", html: "<p>Hi</p>" };

beforeEach(() => {
  process.env.EMAIL_FROM = "Clubhouse <noreply@example.com>";
  global.fetch = jest.fn();
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
  jest.restoreAllMocks();
});

describe("sendEmail", () => {
  it("skips sending without RESEND_API_KEY", async () => {
    expect(await sendEmail(email)).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
  });

  it("skips sending without EMAIL_FROM", async () => {
    process.env.RESEND_API_KEY = "re_test";
    delete process.env.EMAIL_FROM;
    expect(await sendEmail(email)).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
  });

  it("skips sending without a recipient", async () => {
    process.env.RESEND_API_KEY = "re_test";
    expect(await sendEmail({ ...email, to: null })).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts to Resend with the key and the configured sender", async () => {
    process.env.RESEND_API_KEY = "re_test";
    global.fetch.mockResolvedValue({ ok: true });

    expect(await sendEmail(email)).toBe(true);

    const [url, init] = global.fetch.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    expect(JSON.parse(init.body)).toEqual({
      from: "Clubhouse <noreply@example.com>",
      to: ["student@ucla.edu"],
      subject: "Hi",
      html: "<p>Hi</p>",
    });
    expect(init.signal).toBeDefined();
  });

  it("strips line breaks from the subject", async () => {
    process.env.RESEND_API_KEY = "re_test";
    global.fetch.mockResolvedValue({ ok: true });

    await sendEmail({ ...email, subject: "Chess\r\nBcc: x@evil.com" });

    expect(JSON.parse(global.fetch.mock.calls[0][1].body).subject).toBe(
      "Chess Bcc: x@evil.com",
    );
  });

  it("returns false instead of throwing when Resend rejects or is unreachable", async () => {
    process.env.RESEND_API_KEY = "re_test";
    global.fetch.mockResolvedValueOnce({ ok: false, status: 422 });
    expect(await sendEmail(email)).toBe(false);

    global.fetch.mockRejectedValueOnce(new Error("timeout"));
    expect(await sendEmail(email)).toBe(false);
  });
});
