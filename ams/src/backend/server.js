import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

const WIREMOCK_BASE_URL = "http://localhost:8081/__admin/mappings";
const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requestsFile = path.join(__dirname, "./mappings_requests.json");
const responseFile = path.join(__dirname, "./mappings_responses.json");

// Helper för nästa ID
const getNextId = (mappings) => {
  if (mappings.length === 0) return "1"; // Return as string
  const maxId = Math.max(...mappings.map((item) => parseInt(item.id, 10)));
  return String(maxId + 1); // Increment and return as string
};

// ✅ Add WireMock Health Check Route
app.get("/health", async (req, res) => {
  try {
    const response = await fetch("http://localhost:8081/__admin/mappings");
    if (!response.ok) throw new Error("WireMock is unavailable");

    res.json({ wiremockRunning: true });
  } catch (error) {
    console.error("❌ WireMock is DOWN:", error.message);
    res.json({ wiremockRunning: false }); // ✅ Send false if WireMock is down
  }
});

// Hämta alla mappings
app.get("/mappings", (req, res) => {
  const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"));
  console.log("GET /mappings:", { requests, responses });
  res.json({ requests, responses });
});

const sendMappingToWireMock = async (request, response) => {
  const mapping = {
    request: {
      method: request.method.toUpperCase(),
      url: request.url,
      headers: Object.fromEntries(
        Object.entries(request.headers || {}).map(([key, value]) => [
          key,
          { equalTo: value }, // Transform headers to WireMock format
        ])
      ),
      bodyPatterns: request.body ? [{ equalToJson: request.body }] : undefined,
    },
    response: {
      status: response.status,
      headers: response.headers,
      body: JSON.stringify(response.body), // Ensure body is a string
    },
  };

  console.log(
    "🔄 Sending mapping to WireMock...",
    JSON.stringify(mapping, null, 2)
  );

  try {
    const wireMockResponse = await fetch(WIREMOCK_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapping),
    });

    const data = await wireMockResponse.json();
    console.log("✅ WireMock Response:", data);

    if (!wireMockResponse.ok) {
      console.error(`❌ WireMock Error: ${wireMockResponse.status}`, data);
      return null;
    }

    return data.id ?? data.uuid; // ✅ Ensure UUID is returned correctly
  } catch (error) {
    console.error("❌ Error sending mapping to WireMock:", error);
    return null;
  }
};

// Skapa ny mapping (sparas lokalt, skickas INTE till WireMock direkt)
app.post("/mappings", (req, res) => {
  const { request, response } = req.body;

  const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"));

  const requestId = getNextId(requests);
  requests.push({ id: requestId, resJson: request, wireMockUuid: null });

  fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2));

  const responseId = `${requestId}.1`;
  const timestamp = new Date().toLocaleString("sv-SE", {
    timeZone: "Europe/Stockholm",
  });

  const newResponse = {
    id: responseId,
    reqId: requestId,
    resJson: response,
    timestamp,
  };

  responses.push(newResponse);
  fs.writeFileSync(responseFile, JSON.stringify(responses, null, 2));

  res.json({
    success: true,
    newRequest: { id: requestId, resJson: request },
    newResponse,
  });
});

// Ny endpoint för att skicka en specifik mapping till WireMock
app.post("/mappings/:id/send", async (req, res) => {
  const { id } = req.params;

  const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"));

  const request = requests.find((r) => r.id === id);
  const response = responses.find((r) => r.reqId === id);

  if (!request || !response) {
    return res
      .status(404)
      .json({ success: false, message: "Mapping not found" });
  }

  // Skicka till WireMock
  const wireMockId = await sendMappingToWireMock(
    request.resJson,
    response.resJson
  );
  if (!wireMockId) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to send to WireMock" });
  }

  // Uppdatera den lagrade mappningen med WireMock UUID
  request.wireMockUuid = wireMockId;
  fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2));

  res.json({ success: true, wireMockUuid: wireMockId });
});

// Uppdatera en request
app.put("/requests/:id", (req, res) => {
  const { id } = req.params;
  const { resJson } = req.body;

  if (!id || !resJson) {
    return res
      .status(400)
      .json({ success: false, message: "ID and request data are required." });
  }

  const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
  const requestIndex = requests.findIndex(
    (req) => String(req.id) === String(id)
  );

  if (requestIndex === -1) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found." });
  }

  // Uppdatera requesten
  requests[requestIndex].resJson = resJson;
  fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2));

  res.json({ success: true, updatedRequest: requests[requestIndex] });
});

// Uppdatera en respons
app.put("/responses/:id", (req, res) => {
  const { id } = req.params;
  const { resJson } = req.body;

  if (!id || !resJson) {
    return res
      .status(400)
      .json({ success: false, message: "ID and response data are required." });
  }

  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"));
  const responseIndex = responses.findIndex((res) => res.id === id);

  if (responseIndex === -1) {
    return res
      .status(404)
      .json({ success: false, message: "Response not found." });
  }

  // Uppdatera responsen
  responses[responseIndex].resJson = resJson;
  fs.writeFileSync(responseFile, JSON.stringify(responses, null, 2));

  res.json({ success: true, updatedResponse: responses[responseIndex] });
});

// Ta bort mapping
app.delete("/mappings/:id", (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }

  // Read the data from files
  const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"));

  // Filter out the specific request and associated responses
  const updatedRequests = requests.filter(
    (req) => String(req.id) !== String(id)
  );
  const updatedResponses = responses.filter(
    (res) => String(res.reqId) !== String(id)
  );

  // Write the updated data back to files
  fs.writeFileSync(requestsFile, JSON.stringify(updatedRequests, null, 2));
  fs.writeFileSync(responseFile, JSON.stringify(updatedResponses, null, 2));

  res.json({ success: true });
});

app.get("/traffic", async (req, res) => {
  try {
    // Read AMS mappings
    const storeRequests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
    const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"));

    const mappingLookup = storeRequests.reduce((lookup, mapping) => {
      lookup[mapping.wireMockUuid] = mapping;
      return lookup;
    }, {});

    // Fetch logged requests from WireMock
    const wireMockResponse = await fetch(
      "http://localhost:8081/__admin/requests"
    );
    if (!wireMockResponse.ok) {
      throw new Error(
        `Failed to fetch WireMock logs: ${wireMockResponse.status}`
      );
    }

    const wireMockData = await wireMockResponse.json();
    const wireMockLogs = wireMockData.requests || [];

    // Combine AMS mappings and WireMock logs
    const trafficData = wireMockLogs.map((log) => {
      // Extract the Matched-Stub-Id from response headers
      const stubId =
        log.response?.headers && log.response.headers["Matched-Stub-Id"];
      const matchingMapping = stubId && mappingLookup[stubId];
      const matchedMappingId = matchingMapping
        ? matchingMapping.id
        : "Not Matched";

      console.log(
        `Traffic log ${log.id} matchedMappingId: ${matchedMappingId}`
      );

      return {
        id: log.id,
        request: {
          method: log.request.method,
          url: log.request.url,
          headers: log.request.headers,
          body: log.request.body,
        },
        response: {
          status: log.response.status,
          headers: log.response.headers,
          matchedMappingId,
          body: log.response.body,
        },
        timestamp: log.request.loggedDate,
        // Enrich log with matched mapping id if available
      };
    });

    res.json({ success: true, trafficData });
  } catch (error) {
    console.error("Error fetching traffic data:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});
