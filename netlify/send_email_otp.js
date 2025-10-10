// netlify/functions/send_email_otp.js
import emailjs from "@emailjs/nodejs";
export async function handler(event) {
  const { email, otp } = JSON.parse(event.body);

  if (!email || !otp) {
    return { statusCode: 400, body: "Missing email or otp" };
  }

  const res = await emailjs.send(
    "service_y38zirj",
    "template_y2wdzzu",
    { otp },
    { publicKey: "sz7Yc08eGlZ6qlCfl" }
  );
  return { statusCode: 200, body: JSON.stringify({ result: res }) };
}