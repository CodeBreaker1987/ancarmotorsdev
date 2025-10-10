import emailjs from "@emailjs/nodejs";

export async function handler(event) {
  try {
    const { email, otp } = JSON.parse(event.body || "{}");

    if (!email || !otp) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing email or OTP" }) };
    }

    // Send to EmailJS
    const res = await emailjs.send(
      "service_y38zirj",       // Your service ID
      "template_y2wdzzu",      // Your template ID
      { email, otp },          // Must match {{email}} and {{otp}} in your template
      {
        publicKey: "sz7Yc08eGlZ6qlCfl",         // Your public key
        privateKey: process.env.EMAILJS_PRIVATE_KEY, // Add your private key in Netlify env vars
      }
    );

    return { statusCode: 200, body: JSON.stringify({ result: res }) };
  } catch (err) {
    console.error("EmailJS Error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
