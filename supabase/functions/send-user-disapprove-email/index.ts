import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json"
};
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method not allowed"
    }), {
      status: 405,
      headers: jsonHeaders
    });
  }
  try {
    const record = await req.json();
    const requiredFields = [
      "club_name",
      "membership_start_quarter",
      "membership_start_year",
      "membership_end_quarter",
      "membership_end_year",
      "time_commitment_rating",
      "inclusivity_rating",
      "social_community_rating",
      "competitiveness_rating",
      "overall_satisfaction",
      "review_text",
      "user_email"
    ];
    const missingField = requiredFields.find((field)=>!record?.[field]);
    if (missingField) {
      return new Response(JSON.stringify({
        error: `Missing required field: ${missingField}`
      }), {
        status: 400,
        headers: jsonHeaders
      });
    }
    const clubUrl = `https://www.clubhouseucla.com/review`;
    const rejectionMessage = record.custom_message ? `<p><strong>Additional note from the moderation team:</strong></p>
  <p>${record.custom_message}</p>` : ``;
    const html = `
  <p>Thank you for sharing your feedback on ClubHouse! Unfortunately, your review wasn’t approved because it didn’t meet one or more of our community or content guidelines:</p>

  <h3>Clubhouse Community Guidelines</h3>
  <p>To ensure ClubHouse remains a safe, respectful, and helpful space for everyone, please follow these guidelines when posting or interacting on the platform:</p>
  <ul>
    <li><strong>Be Specific and Relevant</strong>: Share clear, helpful insights about your experience with the club. Reviews that are too brief, vague, or off-topic may be rejected to keep feedback meaningful for all students.</li>
    <li><strong>Respect Others</strong>: Do not name or identify individuals, including club leaders or members. Discriminatory, harassing, or hateful language of any kind is strictly prohibited.</li>
    <li><strong>Stay On Topic</strong>: Ensure that all content is relevant to the club or organization being reviewed. Irrelevant or repetitive posts may be removed to maintain clarity and usefulness.</li>
  </ul>

  <p>In particular, we believe that your review had the following issue(s):</p>
  <ul>
    ${record.rejection_reasons.map((reason)=>`<li>${reason}</li>`).join("")}
  </ul>
  ${rejectionMessage}

  <p><strong>Your review:</strong></p>
  <p><strong>Club:</strong> ${record.club_name}</p>
  <p><strong>Start & End Quarter:</strong> ${record.membership_start_quarter} ${record.membership_start_year} – ${record.membership_end_quarter} ${record.membership_end_year}</p>
  <p><strong>Time Commitment Rating:</strong> ${record.time_commitment_rating}</p>
  <p><strong>Diversity Rating:</strong> ${record.inclusivity_rating}</p>
  <p><strong>Social Community Rating:</strong> ${record.social_community_rating}</p>
  <p><strong>Competitiveness Rating:</strong> ${record.competitiveness_rating}</p>
  <p><strong>Overall Satisfaction:</strong> ${record.overall_satisfaction}</p>
  <p>${record.review_text}</p>

  <div style="margin-top: 20px;">
    <p><strong>Click <a href="${clubUrl}">here</a> to submit a new review.</strong></p>
  </div>
`;
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "noreply@clubhouseucla.com",
        to: record.user_email,
        subject: `DEVELOPMENT: Rejected Test Review for ${record.club_name}`,
        html
      })
    });
    if (!resendRes.ok) {
      const errorData = await resendRes.json().catch(()=>({}));
      return new Response(JSON.stringify({
        error: errorData.message || "Failed to send email"
      }), {
        status: resendRes.status,
        headers: jsonHeaders
      });
    }
    const data = await resendRes.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: jsonHeaders
    });
  } catch (e) {
    return new Response(JSON.stringify({
      error: e.message
    }), {
      status: 500,
      headers: jsonHeaders
    });
  }
});
