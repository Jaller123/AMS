import { getBackendAddress } from './backendContextHelper.js';
const API_WIREMOCK_URL = "http://localhost:8081/__admin";

//AMS/WireMock--------------------------------------------------------------------------------------------------------------------------------

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
    // Check if WireMock is running (optional)
    let wiremockRunning = false;
    try {
      const healthResponse = await retryFetch(
        `${getBackendAddress()}/health`,
        5,
        1500
      );
      wiremockRunning = healthResponse.wiremockRunning === true;
      console.log(healthResponse);
    } catch (error) {
      console.log(
        "🩺 WireMock Health Status:",
        wiremockRunning ? "Running ✅" : "Down ❌"
      );
    }

    // Fetch mappings from the backend
    const response = await fetch(`${getBackendAddress()}/mappings`);
    if (!response.ok) throw new Error("Failed to fetch mappings");
    const data = await response.json();


    // Ensure each mapping has a responses array:
    const mappings = (data.mappings || []).map((mapping) => ({
      ...mapping,
      isActive: wiremockRunning && !!mapping.wireMockId,
      wireMockId: wiremockRunning ? mapping.wireMockId : null,
      responses: mapping.responses || [],
    }));

    return { mappings, responses: [] };
  } catch (error) {
    console.error("❌ Error fetching mappings:", error);
    return { mappings: [], responses: [] };
  }
};

// WireMock API--------------------------------------------------------------------------------------------------------------------------------

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
      `${getBackendAddress()}/mappings/${mappingId}/send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();

    if (data.success) {
      alert(data.message || "Mapping sent successfully!");
      return data; // ✅ Return the response so MappingsPage can handle updates
    } else {
      alert("Failed to send mapping to WireMock.");
      return null;
    }
  } catch (error) {
    console.error("Error sending mapping to WireMock:", error);
    return null;
  }
};

export const handleSendScenarioToWireMock = async (scenarioId) => {
  try {
    const response = await fetch(
      `${getBackendAddress()}/scenarios/${scenarioId}/send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    const data = await response.json();
    if (data.success) {
      return data; // The response now contains the updated scenario
    } else {
      alert("Failed to send scenario to WireMock.");
      return null;
    }
  } catch (error) {
    console.error("Error sending scenario to WireMock:", error);
    alert("Error sending scenario. Check console for details.");
    return null;
  }
};

//Mappings--------------------------------------------------------------------------------------------------------------------------------

export const saveMapping = async (mapping) => {
  try {
    const response = await fetch(`${getBackendAddress()}/mappings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapping),
    });
    const data = await response.json();
    console.log("SaveMapping response data:", data);

    // Ensure the mapping was returned
    if (!data.mapping) {
      throw new Error("Mapping was not returned from the server");
    }

    const newMapping = data.mapping;
    return {
      id: newMapping.reqId, // using reqId from the backend object
      request: newMapping.request,
      wireMockId: newMapping.wireMockId,
      responses: newMapping.response ? [newMapping.response] : [], // Always return an array!
    };
  } catch (error) {
    console.error("Error saving mapping:", error);
    throw error;
  }
};

export const saveResponse = async (response) => {
  try {
    const res = await fetch(`${getBackendAddress()}/responses`, {
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
    const response = await fetch(`${getBackendAddress()}/mappings/${id}`, {
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
    const response = await fetch(`${getBackendAddress()}/requests/${requestId}`, {
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

export const updateResponse = async (dbId, updatedResponse) => {
  try {
    const response = await fetch(`${getBackendAddress()}/responses/${dbId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resJson: updatedResponse }),
    });
    if (!response.ok) {
      throw new Error("Failed to update response.");
    }
    return await response.json(); // Expect updatedResponse as an object
  } catch (error) {
    console.error("Error updating response:", error);
    throw error;
  }
};

// Scenarios ---------------------------------------------------------------------------------------------------------------------------

export const fetchScenarios = async () => {
  try {
    const response = await fetch(`${getBackendAddress()}/scenarios`);
    if (!response.ok) throw new Error("Failed to fetch scenarios");
    const data = await response.json();
    console.log("Fetched scenarios data:", data); // 👈 Logga API-svaret
    return data.scenarios;
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    return [];
  }
};

export const saveScenario = async (scenario) => {
  try {
    const response = await fetch(`${getBackendAddress()}/scenarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario }),
    });
    if (!response.ok) throw new Error("Failed to save scenario");
    const data = await response.json();
    return data.scenario;
  } catch (error) {
    console.error("Error saving scenario:", error);
    return null;
  }
};

export const updateScenario = async (scenarioId, scenario) => {
  try {
    const response = await fetch(`${getBackendAddress()}/scenarios/${scenarioId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario }),
    });
    if (!response.ok) throw new Error("Failed to update scenario");
    const data = await response.json();
    return data.scenario;
  } catch (error) {
    console.error("Error updating scenario:", error);
    return null;
  }
};

export const deleteScenario = async (scenarioId) => {
  try {
    const response = await fetch(`${getBackendAddress()}/scenarios/${scenarioId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete scenario");
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error deleting scenario:", error);
    return false;
  }
};

export const toggleWireMock = async () => {
  const res = await fetch("http://localhost:8080/mock-control/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
  return await res.json()
}
