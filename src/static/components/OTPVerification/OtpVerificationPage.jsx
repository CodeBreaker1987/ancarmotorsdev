import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OtpVerificationPage.css";
import emailjs from "@emailjs/browser";
import { MdPermIdentity } from "react-icons/md";

// --- Helper: Send OTP via Email using EmailJS ---
const sendOtpEmail = async (userEmail, otpCode) => {
  try {
    await emailjs.send(
      "service_y38zirj",
      "template_y2wdzzu",
      {
        email: userEmail,
        otp: otpCode,
      },
      "sz7Yc08eGlZ6qlCfl"
    );
    console.log("✅ OTP sent successfully!");
  } catch (error) {
    console.error("❌ Failed to send OTP:", error);
  }
};

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const pendingOrder = JSON.parse(sessionStorage.getItem("pendingOrder") || "{}");
  const { user, truck, totalPrice, paymentMethod } = pendingOrder;

  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState("");
  const [method, setMethod] = useState(""); // "sms" or "email"
  const [timer, setTimer] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // --- Generate and send OTP ---
  const sendOtp = async (chosenMethod) => {
    if (!user) return;

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtp(generatedOtp);
    setMethod(chosenMethod);
    setTimer(chosenMethod === "email" ? 600 : 300); // 10 or 5 min
    setResendTimer(30);
    setCanResend(false);

    if (chosenMethod === "sms") {
      await fetch("/.netlify/functions/send_sms_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: user.phone_number, otp: generatedOtp }),
      });
    } else {
      await sendOtpEmail(user.email_address, generatedOtp);
    }
  };

  // --- Countdown timers ---
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // --- Handle OTP Verification ---
  const handleVerify = () => {
    setVerifying(true);
    setError("");

    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit OTP.");
      setVerifying(false);
      return;
    }

    if (otp === sentOtp && timer > 0) {
      console.log("✅ OTP Verified. Redirecting to Payment...");
      navigate("/PaymentNav", {
        state: {
        ...pendingOrder
        },
      });
    } else {
      setError("Invalid or expired OTP. Please try again.");
    }

    setVerifying(false);
  };

  // --- Handle Missing Order ---
  if (!user || !truck) {
    return (
      <div className="otp-verification-container">
        <h2>OTP Verification</h2>
        <p style={{ color: "#ef4444" }}>
          Order information missing. Please restart your order process.
        </p>
        <button onClick={() => navigate("/")}>Go to Home</button>
      </div>
    );
  }

  // --- UI ---
  return (
    <div className="otp-verification-container">
      <MdPermIdentity className="icon-circle-otp-icon" />
      <h2>OTP Verification</h2>
      <h3>Select where to send OTP to verify this transaction.</h3>

      {!method ? (
        <div>
          <button onClick={() => sendOtp("sms")}>Send OTP via SMS</button>
          <button onClick={() => sendOtp("email")}>Send OTP via Email</button>
        </div>
      ) : (
        <div>
          <p>
            Enter the OTP sent to your{" "}
            {method === "sms" ? "phone" : "email"}.
          </p>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            placeholder="Enter OTP"
          />
          <button
            onClick={handleVerify}
            disabled={timer <= 0 || verifying || otp.length < 6}
          >
            {verifying ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="timer">
            {timer > 0 ? (
              <span>
                OTP expires in {Math.floor(timer / 60)}:
                {(timer % 60).toString().padStart(2, "0")}
              </span>
            ) : (
              <span>OTP expired. Please resend.</span>
            )}
          </div>

          <button
            className="resend-btn"
            onClick={() => sendOtp(method)}
            disabled={!canResend}
          >
            {canResend
              ? "Resend OTP"
              : `Resend in ${resendTimer}s`}
          </button>

          {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
        </div>
      )}
    </div>
  );
}
