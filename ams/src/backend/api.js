const API_BASE_URL = "http://localhost:8080";
const API_WIREMOCK_URL = "http://localhost:8081/__admin/mappings";

export const fetchMappings = async () => {
  try {
    // Fetch mappings from backend
    const response = await fetch(`${API_BASE_URL}/mappings`);
    if (!response.ok) throw new Error("Failed to fetch mappings");
    const { requests, responses } = await response.json();

    // Fetch mappings from WireMock
    const wireMockResponse = await fetch(API_WIREMOCK_URL);
    if (!wireMockResponse.ok)
      throw new Error("Failed to fetch WireMock mappings");

    const wireMockData = await wireMockResponse.json();

    // ✅ Create a Set of WireMock UUIDs
    const wireMockMappings = new Set(
      wireMockData.mappings.map((mapping) => mapping.id)
    );

    console.log(
      "🔄 Backend Mappings:",
      requests.map((req) => ({
        id: req.id,
        request: req.resJson,
        uuid: req.wireMockUuid, // ✅ Changed from wireMockUuid → uuid
        isActive: wireMockMappings.has(req.wireMockUuid), // ✅ Match using stored UUID
      }))
    );

    console.log("✅ WireMock Mappings:", wireMockMappings);

    return {
      requests: requests.map((req) => ({
        id: req.id,
        request: req.resJson,
        uuid: req.wireMockUuid, // ✅ Changed from wireMockUuid → uuid
        isActive: wireMockMappings.has(req.wireMockUuid), // ✅ Correctly check Active status
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
    const response = await fetch(API_WIREMOCK_URL);
    if (!response.ok) throw new Error("Failed to fetch WireMock mappings");

    const data = await response.json();

    return {
      requests: data.mappings.map((mapping) => ({
        id: mapping.id,
        request: mapping.request || {}, // Ensure request object exists
        isActive: true,
      })),
      responses: data.mappings.map((mapping) => ({
        id: mapping.id,
        reqId: mapping.id, // WireMock uses `id` instead of `reqId`
        resJson: mapping.response || {}, // Ensure response object exists
        status: mapping.response?.status || "N/A", // Fix: Ensure status is always included
        timestamp: new Date().toISOString(), // WireMock doesn't provide timestamps
      })),
    };
  } catch (error) {
    console.error("Error fetching WireMock mappings:", error);
    return { requests: [], responses: [] };
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
