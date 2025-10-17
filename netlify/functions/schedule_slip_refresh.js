// schedule_slip_refresh.js

const pendingSlips = new Map(); // { userid: timeoutId }

export async function handler(event) {
  try {
    const { userid, slipType } = JSON.parse(event.body);

    if (!userid) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing userid" }) };
    }

    const siteURL = process.env.DEPLOY_PRIME_URL || process.env.URL;
    const delayMs = 10 * 60 * 1000; // 10 minutes

    // Check if this user already has a pending slip scheduled
    if (pendingSlips.has(userid)) {
      console.log(`⏳ Slip refresh already scheduled for user ${userid}. Skipping duplicate.`);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `Slip for ${userid} already scheduled.` }),
      };
    }

    console.log(`🕒 Scheduling slip for user ${userid} (${slipType}) in 10 minutes...`);

    // Schedule the slip send
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`${siteURL}/.netlify/functions/create_slip_scheduled`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ userid, statusGroup: slipType }),
        });

        console.log(`✅ Slip sent for ${userid} (${slipType}). Status: ${res.status}`);

      } catch (err) {
        console.error(`❌ Failed to send slip for ${userid}:`, err);
      } finally {
        // Remove the user from the pending list after sending
        pendingSlips.delete(userid);
      }
    }, delayMs);

    // Track scheduled user
    pendingSlips.set(userid, timeoutId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Slip scheduled for ${userid} in 10 minutes.` }),
    };

  } catch (err) {
    console.error("❌ Error scheduling slip refresh:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
