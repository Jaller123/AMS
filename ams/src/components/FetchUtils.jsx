export const sendRequestToWireMock = async (data) => {
  const payload = {
    request: {
      method: data.method,
      url: data.url,
    },
    response: {
      status: 200,
      headers: data.headers || {},
      body: data.body ? JSON.stringify(data.body) : "",
    },
  };

  console.log("Payload for WireMock:", payload);

  try {
    const res = await fetch("http://localhost:8088/__admin/mappings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseBody = await res.text();

    if (res.ok) {
      console.log("Request successful:", responseBody);
      return {
        status: res.status,
        body: responseBody,
      };
    } else {
      console.error("Error from WireMock:", res.status, responseBody);
      return {
        status: res.status,
        body: responseBody,
        error: true,
      };
    }
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
};
