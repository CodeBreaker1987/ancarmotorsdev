import React, { useState } from "react";
import { useUser } from "../../Context/UserContext.jsx";
import "./RegisterForm.css";

const RegisterForm = ({ onRegisterSuccess, onBackToLogin }) => {
	const { login } = useUser();
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [address, setAddress] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [regUsername, setRegUsername] = useState("");
	const [regPassword, setRegPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showCriteria, setShowCriteria] = useState(false);

	const criteria = {
		length: regPassword.length >= 8 && regPassword.length <= 16,
		uppercase: /[A-Z]/.test(regPassword),
		number: /\d/.test(regPassword),
		symbol: /[!@#$%^&*(),.?":{}|<>]/.test(regPassword),
	};

	const validateRegistration = () => {
		const emailRegex = /^[\w.%+-]+@(gmail\.com|yahoo\.com|outlook\.com)$/i;
		const phoneRegex = /^(\+639\d{9}|09\d{9})$/;
		const usernameRegex = /^[a-zA-Z0-9_]{8,16}$/;
		const passwordRegex =
			/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

		if (!emailRegex.test(email)) {
			alert("Invalid email format (must be Gmail, Yahoo, or Outlook).\n");
			return false;
		}
		if (!phoneRegex.test(phone)) {
			alert("Invalid phone format. Use +639xxxxxxxxx or 09xxxxxxxxx.\n");
			return false;
		}
		if (!usernameRegex.test(regUsername)) {
			alert(
				"Username must be 8-16 characters, only letters, numbers, or underscores.\n"
			);
			return false;
		}
		if (!passwordRegex.test(regPassword)) {
			alert(
				"Password must be 8-16 characters, include 1 uppercase, 1 number, 1 symbol.\n"
			);
			return false;
		}
		if (regPassword !== confirmPassword) {
			alert("Passwords do not match.\n");
			return false;
		}
		return true;
	};

	const handleRegisterSubmit = async (e) => {
		e.preventDefault();
		if (!validateRegistration()) return;

		try {
			const response = await fetch("/.netlify/functions/reg_user", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					firstName,
					lastName,
					address,
					email,
					phone,
					username: regUsername,
					password: regPassword,
				}),
			});

			if (!response.ok) throw new Error("Failed to register");
			const data = await response.json();

			const fullUser = { ...data.user, role: "customer" };
			login(fullUser, "customer");
			localStorage.setItem("user", JSON.stringify(fullUser));

			alert("✅ Registration successful!");
			onRegisterSuccess?.();
		} catch (err) {
			alert("❌ Registration failed: " + err.message);
		}
	};

	return (
		<div className="register-form">
			<h2>Customer Registration</h2>
			<form onSubmit={handleRegisterSubmit}>
				<label>First Name</label>
				<input
					type="text"
					placeholder="First Name"
					value={firstName}
					onChange={(e) => setFirstName(e.target.value)}
					required
				/>
				<label>Last Name</label>
				<input
					type="text"
					placeholder="Last Name"
					value={lastName}
					onChange={(e) => setLastName(e.target.value)}
					required
				/>
				<label>Home Address</label>
				<input
					type="text"
					placeholder="Home Address"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					required
				/>
				<label>Email Address</label>
				<input
					type="email"
					placeholder="Email Address"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<label>Phone Number</label>
				<input
					type="text"
					placeholder="Phone Number"
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					required
				/>
				<label>Username</label>
				<input
					type="text"
					placeholder="Username (8-16 chars)"
					value={regUsername}
					onChange={(e) => setRegUsername(e.target.value)}
					required
				/>
				<label>Password</label>
				<input
					type="password"
					placeholder="Password"
					value={regPassword}
					onFocus={() => setShowCriteria(true)}
					onBlur={() => setShowCriteria(false)}
					onChange={(e) => setRegPassword(e.target.value)}
					required
				/>
				<label>Confirm Password</label>
				<input
					type="password"
					placeholder="Confirm Password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					required
				/>
				<div className="buttons-container">
				<button
					className="Backbutton"
					type="button"
					onClick={onBackToLogin}
				>
					Back to Login
				</button>
				<button className="Registerbutton" type="submit">
					Register
				</button>
				</div>
			</form>

			{showCriteria && (
				<div className="password-popup">
					<h4>Password must contain:</h4>
					<p className={criteria.length ? "valid" : "invalid"}>✔ 8 – 16 characters</p>
					<p className={criteria.uppercase ? "valid" : "invalid"}>✔ At least 1 uppercase letter</p>
					<p className={criteria.number ? "valid" : "invalid"}>✔ At least 1 number</p>
					<p className={criteria.symbol ? "valid" : "invalid"}>✔ At least 1 symbol</p>
				</div>
			)}
		</div>
	);
};

export default RegisterForm;
