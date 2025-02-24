const API_BASE_URL = "http://localhost:8080";
const API_WIREMOCK_URL = "http://localhost:8081/__admin"; 


const retryFetch = async (url, retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === retries) {
        console.error("❌ All retry attempts failed:", error.message);
        return { error: true }; // ✅ Return an error object instead of throwing
      }
      
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};


export const fetchMappings = async () => {
  try {
    // ✅ Step 1: Check if WireMock is running
    let wiremockRunning = false
    try {
    const healthResponse = await retryFetch(`${API_BASE_URL}/health`, 5, 1500);
     wiremockRunning = healthResponse.wiremockRunning === true;
    console.log(healthResponse)
    } catch(error) {
      console.log("🩺 WireMock Health Status:", wiremockRunning ? "Running ✅" : "Down ❌");
    }
    
    // ✅ Step 2: Fetch mappings from backend (Always available)
    const response = await fetch(`${API_BASE_URL}/mappings`);
    if (!response.ok) throw new Error("Failed to fetch mappings");
    const { requests, responses } = await response.json();

    let wireMockMappings = new Set();

    // ✅ Step 3: Fetch WireMock mappings only if it's running
    if (wiremockRunning) {
      try {
        const wireMockData = await retryFetch(`${API_WIREMOCK_URL}/mappings`, 3, 1000);
        wireMockMappings = new Set(wireMockData.mappings.map(mapping => mapping.id));

        console.log("✅ WireMock Mappings:", wireMockMappings);
      } catch (error) {
        console.error("⚠️ Failed to fetch WireMock mappings:", error.message);
      }
    }

    console.log(
      "🔄 Backend Mappings:",
      requests.map((req) => ({
        id: req.id,
        request: req.resJson,
        uuid: req.wireMockId,
        isActive: wiremockRunning && wireMockMappings.has(req.wireMockId), // ✅ Inactive if WireMock is Down
      }))
    );

    return {
      requests: requests.map((req) => ({
        id: req.id,
        request: req.resJson,
        uuid: req.wireMockId,
        isActive: wiremockRunning && wireMockMappings.has(req.wireMockId), // ✅ Automatically Inactive if WireMock is Down
      })),
      responses: responses.map((res) => ({
        id: res.id,
        reqId: res.reqId,
        resJson: res.resJson,
        timestamp: res.timestamp,
      })),
    };
  } catch (error) {
    console.error("❌ Error fetching mappings:", error);
    return { requests: [], responses: [] };
  }
};


// WireMock API

export const fetchWireMockTraffic = async () => {
  try {
    const response = await fetch(`${API_WIREMOCK_URL}/requests`);
    if (!response.ok) throw new Error("Failed to fetch WireMock traffic");

    const data = await response.json();
    const wireMockRequests = data.requests || [];
    console.log("Raw WireMock Requests:", wireMockRequests);

    const trafficData = wireMockRequests.map((request) => {
      // Use optional chaining to avoid errors if response or headers is undefined
      const matchedStubId = request.response?.headers?.["Matched-Stub-Id"];
      // Log the matched stub id for each request
      console.log(`Matched Stub Id for request ${request.id}:`, matchedStubId);

      return {
        id: request.id,
        request: {
          method: request.request.method,
          url: request.request.url,
          headers: request.request.headers,
          body: request.request.body,
        },
        response: {
          status: request.response.status,
          body: request.response.body,
        },
        matchedStubId, // now safely set; if not available, it will be undefined
        timestamp: request.request.loggedDate || new Date().toISOString(),
      };
    });

    console.log("Mapped Traffic Data:", trafficData);

    return { trafficData };
  } catch (error) {
    console.error("❌ Error fetching WireMock traffic:", error);
    return { trafficData: [] };
  }
};

export const handleSendToWireMock = async (mappingId) => {
  try {
    const response = await fetch(
      `http://localhost:8080/mappings/${mappingId}/send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();

    if (data.success) {
      alert("Mapping sent to WireMock successfully!");
      return data; // ✅ Return the response so MappingsPage can handle updates
    } else {
      alert("Failed to send mapping to WireMock.");
      return null;
    }
  } catch (error) {
    console.error("Error sending mapping to WireMock:", error);
    alert("Error sending mapping. Check console for details.");
    return null;
  }
};


export const saveMapping = async (mapping) => {
  try {
    const response = await fetch(`${API_BASE_URL}/mappings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapping),
    });
    const { newRequest, newResponse } = await response.json();

    return {
      id: newRequest.id,
      request: newRequest.resJson,
      wireMockId: newRequest.wireMockId,
      response: newResponse.resJson,
    };
  } catch (error) {
    console.error("Error saving mapping:", error);
    throw error;
  }
};

export const saveResponse = async (response) => {
  try {
    const res = await fetch(`${API_BASE_URL}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });

    if (!res.ok) {
      throw new Error("Failed to save the response.");
    }

    const data = await res.json();
    return data.newResponse;
  } catch (error) {
    console.error("Error saving response:", error);
    throw error;
  }
};

export const deleteMapping = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/mappings/${id}`, {
      method: "DELETE",
    });
    console.log("Response status:", response.status);
    if (!response.ok) {
      throw new Error(`Failed to delete mapping. Status: ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error deleting mapping:", error);
    throw error;
  }
};

export const updateRequest = async (requestId, updatedRequest) => {
  try {
    const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resJson: updatedRequest }),
    });

    if (!response.ok) {
      throw new Error("Failed to update request.");
    }

    return await response.json(); // Return updated request
  } catch (error) {
    console.error("Error updating request:", error);
    throw error;
  }
};

export const updateResponse = async (responseId, updatedResponse) => {
  try {
    const response = await fetch(`${API_BASE_URL}/responses/${responseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resJson: updatedResponse }),
    });

    if (!response.ok) {
      throw new Error("Failed to update response.");
    }

    return await response.json(); // Return updated response
  } catch (error) {
    console.error("Error updating response:", error);
    throw error;
  }
};
