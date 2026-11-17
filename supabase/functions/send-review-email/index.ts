import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
Deno.serve(async (req)=>{
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
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
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  try {
    const record = await req.json();
    if (!record || !record.club_name || !record.overall_satisfaction || !record.review_text || !record.user_email) {
      return new Response(JSON.stringify({
        error: "Invalid input data"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Email 1: To Admin
    const htmlToAdmin = `
      <p>Please proceed to <a href="https://www.clubhouseucla.com/admin">www.clubhouseucla.com/admin</a> and sign in with the official Clubhouse email to approve or disapprove pending reviews.</p>
      <p><strong>Club:</strong> ${record.club_name}</p>
      <p><strong>Overall Rating:</strong> ${record.overall_satisfaction}</p>
      <p><strong>Review:</strong> ${record.review_text}</p>
    `;
    // Email 2: Confirmation to user
    const htmlToUser = `
      <p>Thank you for submitting your review to ClubHouse.</p>
      <p>All submissions are reviewed by our team to ensure it meets our <a href="https://www.clubhouseucla.com/community-guidelines">Community Guidelines</a>.</p>
      <p>We've received yours and will review it shortly.</p>
    `;
    // Send both emails in parallel
    const [adminRes, userRes] = await Promise.all([
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: "noreply@clubhouseucla.com",
          to: "clubhouseucla@gmail.com",
          subject: "DEVELOPMENT: New Test Review Pending",
          html: htmlToAdmin
        })
      }),
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: "noreply@clubhouseucla.com",
          to: record.user_email,
          subject: `DEVELOPMENT: Test Review Submitted for ${record.club_name}`,
          html: htmlToUser
        })
      })
    ]);
    // Handle any failed email responses
    if (!adminRes.ok || !userRes.ok) {
      const adminError = !adminRes.ok ? await adminRes.json().catch(()=>({})) : {};
      const userError = !userRes.ok ? await userRes.json().catch(()=>({})) : {};
      return new Response(JSON.stringify({
        error: adminError.message || userError.message || "Failed to send email(s)"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({
      error: e.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
