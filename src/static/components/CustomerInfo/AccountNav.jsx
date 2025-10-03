import React, { useState, useEffect } from "react";
import "./AccountNav.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext.jsx";

const AccountNav = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email_address: "",
    phone_number: "",
    home_address: "",   // ✅ Added home address
  });

  const [draftData, setDraftData] = useState({ ...userData });

  const [editMode, setEditMode] = useState({
    first_name: false,
    last_name: false,
    username: false,
    email_address: false,
    phone_number: false,
    home_address: false, // ✅ Added edit mode toggle
    password: false,
  });

  const [passwordInput, setPasswordInput] = useState("");
  const [showCriteria, setShowCriteria] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper: parse response safely
  const parseResponse = async (res) => {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    return await res.text();
  };

  // Fetch user data
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/.netlify/functions/get_user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.userid }),
        });

        const data = await parseResponse(res);

        if (!res.ok) {
          throw new Error(
            typeof data === "string" ? data : data.error || "Failed to fetch user data"
          );
        }

        // Sync both saved and draft states
        setUserData({
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username,
          email_address: data.email_address,
          phone_number: data.phone_number,
          home_address: data.home_address || "", // ✅ Pull from DB
        });
        setDraftData({
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username,
          email_address: data.email_address,
          phone_number: data.phone_number,
          home_address: data.home_address || "", // ✅ Pull from DB
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
        alert("Error fetching user info: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Validation helpers
  const emailRegex = /^[\w.%+-]+@(gmail\.com|yahoo\.com|outlook\.com)$/i;
  const phoneRegex = /^(\+639\d{9}|09\d{9})$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

  // Save a single field with validation
  const handleFieldSave = async (field) => {
    if (!user) return;

    // Empty check
    if (field !== "password" && !draftData[field].trim()) {
      alert("Change Info failed: Cannot change to empty value!");
      return;
    }
    // Email format check
    if (field === "email_address" && !emailRegex.test(draftData[field])) {
      alert("Change Email failed: Not a valid email address!");
      return;
    }
    // Phone format check
    if (field === "phone_number" && !phoneRegex.test(draftData[field])) {
      alert("Change Phone Number failed: Not a valid phone number!");
      return;
    }
    // Password format check
    if (field === "password") {
      if (!passwordRegex.test(passwordInput)) {
        alert("Change Password failed: new password is invalid! please try again.");
        return;
      }
    }

    try {
      const bodyData =
        field === "password"
          ? { userId: user.userid, password: passwordInput }
          : { userId: user.userid, [field]: draftData[field] };

      const res = await fetch("/.netlify/functions/update_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await parseResponse(res);

      if (!res.ok) {
        throw new Error(
          typeof data === "string" ? data : data.error || "Failed to update user data"
        );
      }

      // Update state
      if (field === "password") {
        setPasswordInput("");
      } else {
        setUserData((prev) => ({ ...prev, [field]: draftData[field] }));
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, [field]: draftData[field] })
        );
      }

      alert(`✅ ${field.replace("_", " ")} updated successfully!`);

      // Exit edit mode for this field
      setEditMode((prev) => ({ ...prev, [field]: false }));
    } catch (err) {
      console.error("Error updating user info:", err);
      alert("Error updating user info: " + err.message);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  if (loading) return <p>Loading account info...</p>;

  return (
    <div className="account-parallax">
    <div className="account-container">
      <h2 className="account-title">Account Information</h2>

      {Object.keys(userData).map((field) =>
        field !== "password" ? ( // ✅ Skip password (handled separately)
          <div className="editable-field" key={field}>
            <strong>{field.replace("_", " ").toUpperCase()}:</strong>
            {editMode[field] ? (
              <>
                <input
                  type="text"
                  value={draftData[field]}
                  onChange={(e) =>
                    setDraftData({ ...draftData, [field]: e.target.value })
                  }
                  className="input-field"
                />
                <button
                  className="save-button"
                  onClick={() => handleFieldSave(field)}
                >
                  Save
                </button>
                <button
                  className="edit-button"
                  onClick={() => {
                    setDraftData({ ...draftData, [field]: userData[field] });
                    setEditMode({ ...editMode, [field]: false });
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <p>{userData[field]}</p>
                <button
                  className="edit-button"
                  onClick={() => setEditMode({ ...editMode, [field]: true })}
                >
                  Change
                </button>
              </>
            )}
          </div>
        ) : null
      )}

      {/* Password (separate handling) */}
      <div className="editable-field" style={{ position: "relative" }}>
        <strong>Password:</strong>
        {editMode.password ? (
          <>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="input-field"
              placeholder="Enter new password"
              onFocus={() => setShowCriteria(true)}
              onBlur={() => setShowCriteria(false)}
            />
            <button
              className="save-button"
              onClick={() => handleFieldSave("password")}
            >
              Save
            </button>
            <button
              className="edit-button"
              onClick={() => {
                setPasswordInput("");
                setEditMode({ ...editMode, password: false });
                setShowCriteria(false);
              }}
            >
              Cancel
            </button>
            {/* Password criteria popup (right side) */}
            {showCriteria && (
              <div className="password-popup" style={{ position: "absolute", right: "-320px", top: 0, width: 300 }}>
                <h4>Password must contain:</h4>
                <p className={passwordInput.length >= 8 && passwordInput.length <= 16 ? "valid" : "invalid"}>✔ 8 – 16 characters</p>
                <p className={/[A-Z]/.test(passwordInput) ? "valid" : "invalid"}>✔ At least 1 uppercase letter</p>
                <p className={/\d/.test(passwordInput) ? "valid" : "invalid"}>✔ At least 1 number</p>
                <p className={/[!@#$%^&*(),.?":{}|<>]/.test(passwordInput) ? "valid" : "invalid"}>✔ At least 1 symbol</p>
              </div>
            )}
          </>
        ) : (
          <>
            <p>********</p>
            <button
              className="edit-button"
              onClick={() => setEditMode({ ...editMode, password: true })}
            >
              Change Password
            </button>
          </>
        )}
      </div>
    </div>
    </div>
  );
};

export default AccountNav;
