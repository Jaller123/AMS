const API_BASE_URL = "http://localhost:8080";

export const fetchMappings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/mappings`);
    const { requests, responses } = await response.json();

    return {
      requests: requests.map((req) => ({
        id: req.id,
        request: req.resJson, // Ensure `request` matches what the frontend expects
      })),
      responses: responses.map((res) => ({
        id: res.id,
        reqId: res.reqId,
        resJson: res.resJson,
        timestamp: res.timestamp,
      })),
    };
  } catch (error) {
    console.error("Error fetching mappings:", error);
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
