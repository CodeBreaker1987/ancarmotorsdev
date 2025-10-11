export async function handler(event) {
  try {
    const { data } = JSON.parse(event.body);

    const response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY).toString("base64")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data })
    });

    const result = await response.json();
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: result.errors?.[0]?.detail || "PayMongo error" })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ checkoutUrl: result.data.attributes.checkout_url })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}