// netlify/functions/send_sms_otp.js
export async function handler(event) {
  const { phone, otp } = JSON.parse(event.body);

  // Only send if phone and otp are present
  if (!phone || !otp) {
    return { statusCode: 400, body: "Missing phone or otp" };
  }

  const params = new URLSearchParams({
    username: "alexalexd6dau2025",
    password: "SzmIad8H",
    senderid: "ANCAR",
    message: `Your Ancar Motors OTP is: ${otp}`,
    mobileno: phone,
    type: "text"
  });

  const res = await fetch("https://www.easysendsms.com/sms/bulksms-api/bulksms-api", {
    method: "POST",
    body: params
  });
  const text = await res.text();
  return { statusCode: 200, body: JSON.stringify({ result: text }) };
}