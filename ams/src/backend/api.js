const API_BASE_URL = "http://localhost:8080";

export const fetchMappings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/mappings`);
    const { requests, responses } = await response.json();
    return requests.map((req) => {
      const matchingResponse = responses.find((res) => res.reqId === req.id);
      return {
        request: req.resJson,
        response: matchingResponse?.resJson || {},
      };
    });
  } catch (error) {
    console.error("Error fetching mappings:", error);
    return [];
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
      request: newRequest.resJson,
      response: newResponse.resJson,
    };
  } catch (error) {
    console.error("Error saving mapping:", error);
    throw error;
  }
};
