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
