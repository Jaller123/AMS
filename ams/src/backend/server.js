import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { handleSendToWireMock } from "./api.js";

const WIREMOCK_BASE_URL = "http://localhost:8081/__admin/mappings";
const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requestsFile = path.join(__dirname, "./mappings_requests.json");
const responseFile = path.join(__dirname, "./mappings_responses.json");
const scenariosFile = path.join(__dirname, "./scenarios.json") 

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


// Ny endpoint för att skicka en specifik mapping till WireMock
app.post("/mappings", (req, res) => {
  const { request, response } = req.body;
  const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"));

  // Check for an existing mapping based on request details.
  const existingMapping = requests.find((r) => {
    return JSON.stringify(r.resJson) === JSON.stringify(request);
  });

  let requestId;
  let transformedRequest; // Declare variable outside if/else

  if (existingMapping) {
    // Use the existing mapping's values.
    requestId = existingMapping.id;
    transformedRequest = existingMapping.resJson;
  } else {
    requestId = getNextId(requests);

    // Determine which URL key to use
    let urlKey = "url"; // default
    if (request.urlMatchType) {
      if (request.urlMatchType === "urlPath") {
        urlKey = "urlPath";
      } else if (request.urlMatchType === "urlPathPattern") {
        urlKey = "urlPathPattern";
      } else if (request.urlMatchType === "urlPathTemplate") {
        urlKey = "urlPathTemplate";
      } else if (request.urlMatchType === "urlPattern") {
        urlKey = "urlPattern";
      }
    }

    // Build the transformed request object in the desired order.
    transformedRequest = {};
    // 1. Title (if provided)
    if (request.title) {
      transformedRequest.title = request.title;
    }
    // 2. URL using the chosen key
    if (request.url) {
      transformedRequest[urlKey] = request.url;
    }
    // 3. Method
    transformedRequest.method = request.method.toUpperCase();
    // 4. Headers (wrap each value with "equalTo")
    transformedRequest.headers = Object.fromEntries(
      Object.entries(request.headers || {}).map(([key, value]) => [
        key,
        { equalTo: value },
      ])
    );
    // 5. Body as bodyPatterns (if provided)
    if (request.body) {
      transformedRequest.bodyPatterns = [{ equalToJson: request.body }];
    }

    // Save the new mapping (do not include urlMatchType)
    requests.push({
      id: requestId,
      resJson: transformedRequest,
      wireMockId: null,
    });
    fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2));
  }

  // Create a new response entry.
  const matchingResponses = responses.filter((r) => r.reqId === requestId);
  const responseId = `${requestId}.${matchingResponses.length + 1}`;
  const timestamp = new Date().toLocaleString("sv-SE", {
    timeZone: "Europe/Stockholm",
  });
  const newResponse = {
    id: responseId,
    reqId: requestId,
    resJson: {
      status: response.status,
      headers: response.headers,
      body: response.body, // Will be stringified when sending
    },
    timestamp,
  };

  responses.push(newResponse);
  fs.writeFileSync(responseFile, JSON.stringify(responses, null, 2));

  res.json({
    success: true,
    newRequest: { id: requestId, resJson: transformedRequest },
    newResponse,
  });
});




// POST /mappings/:id/send: Send a mapping to WireMock
app.post("/mappings/:id/send", async (req, res) => {
  const { id } = req.params;
  const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"));

  const mappingEntry = requests.find((r) => r.id === id);
  const mappingResponse = responses.find((r) => r.reqId === id);

  if (!mappingEntry || !mappingResponse) {
    return res.status(404).json({ success: false, message: "Mapping not found" });
  }

  // Start with the saved request (transformed)...
  let requestMapping = { ...mappingEntry.resJson };

  // Remove custom fields that WireMock does not expect (e.g. "title")
  if (requestMapping.title) {
    delete requestMapping.title;
  }

  // If the saved object contains a plain "body" (instead of bodyPatterns),
  // wrap it into a bodyPatterns array (and remove the plain "body" key).
  if (requestMapping.body) {
    requestMapping.bodyPatterns = [{ equalToJson: requestMapping.body }];
    delete requestMapping.body;
  }

  // Build the mapping object to send to WireMock.
  const mappingToSend = {
    request: requestMapping,
    response: {
      status: mappingResponse.resJson.status,
      headers: mappingResponse.resJson.headers,
      // Ensure the response body is a string (WireMock expects a JSON string)
      body: JSON.stringify(mappingResponse.resJson.body),
    },
  };

  console.log("Mapping to send to WireMock:", mappingToSend);

  try {
    const wireMockResponse = await fetch(WIREMOCK_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mappingToSend),
    });
    const data = await wireMockResponse.json();
    if (!wireMockResponse.ok) {
      console.error("WireMock response not OK:", data);
      return res.status(500).json({ success: false, message: "Failed to send to WireMock" });
    }
    // Update the saved mapping with the WireMock UUID
    mappingEntry.wireMockId = data.id ?? data.uuid;
    fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2));
    return res.json({ success: true, wireMockId: mappingEntry.wireMockId });
  } catch (error) {
    console.error("❌ Error sending mapping to WireMock:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
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
app.put("/requests/:id", (req, res) => {
  const { id } = req.params;
  const { resJson } = req.body; // Incoming data containing title, url, method, headers, (and optionally body or urlMatchType)

  if (!id || !resJson) {
    return res
      .status(400)
      .json({ success: false, message: "ID and request data are required." });
  }

  const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
  const requestIndex = requests.findIndex((r) => String(r.id) === String(id));

  if (requestIndex === -1) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found." });
  }

  // Determine which URL key to use based on an optional urlMatchType field.
  // (If not provided, default to "url")
  let urlKey = "url";
  if (resJson.urlMatchType) {
    if (resJson.urlMatchType === "urlPath") {
      urlKey = "urlPath";
    } else if (resJson.urlMatchType === "urlPathPattern") {
      urlKey = "urlPathPattern";
    } else if (resJson.urlMatchType === "urlPathTemplate") {
      urlKey = "urlPathTemplate";
    } else if (resJson.urlMatchType === "urlPattern") {
      urlKey = "urlPattern";
    }
  }

  // Build the transformed request object in the desired order:
  // 1. Title (if provided)
  // 2. URL (using the chosen key)
  // 3. Method (uppercased)
  // 4. Headers (each value wrapped with "equalTo")
  // 5. Body as bodyPatterns (if provided)
  let transformedRequest = {};
  if (resJson.title) {
    transformedRequest.title = resJson.title;
  }
  if (resJson.url) {
    transformedRequest[urlKey] = resJson.url;
  }
  transformedRequest.method = resJson.method.toUpperCase();
  transformedRequest.headers = Object.fromEntries(
    Object.entries(resJson.headers || {}).map(([key, value]) => [
      key,
      { equalTo: value },
    ])
  );
  if (resJson.body) {
    transformedRequest.bodyPatterns = [{ equalToJson: resJson.body }];
  }

  // Update the saved mapping with the transformed object.
  requests[requestIndex].resJson = transformedRequest;
  fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2));

  res.json({ success: true, updatedRequest: requests[requestIndex] });
});



// Ta bort mapping
app.delete("/mappings/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }

  // Read existing mappings from file
  const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"));

  // Find the mapping to delete
  const mappingToDelete = requests.find((req) => String(req.id) === String(id));

  // If the mapping exists and has a WireMock ID, delete it from WireMock
  if (mappingToDelete && mappingToDelete.wireMockId) {
    try {
      const wireMockDeleteResponse = await fetch(
        `${WIREMOCK_BASE_URL}/${mappingToDelete.wireMockId}`,
        { method: "DELETE" }
      );
      if (!wireMockDeleteResponse.ok) {
        console.error(
          "Failed to delete mapping from WireMock:",
          await wireMockDeleteResponse.text()
        );
      } else {
        console.log("Mapping deleted from WireMock successfully");
      }
    } catch (error) {
      console.error("Error deleting mapping from WireMock:", error);
    }
  }

  // Filter out the deleted mapping locally
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


app.post("/responses", (req, res) => {
  const { reqId, resJson, timestamp } = req.body;
  if (
    !reqId ||
    !resJson ||
    !resJson.status ||
    !resJson.headers ||
    !resJson.body
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid data. Ensure reqId and resJson fields are valid.",
    });
  }
  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"));
  const matchingResponses = responses.filter(
    (response) => response.reqId === reqId
  );
  const responseId = `${reqId}.${matchingResponses.length + 1}`;
  const newResponse = {
    id: responseId,
    reqId,
    resJson,
    timestamp: timestamp || new Date().toISOString(),
  };
  responses.push(newResponse);
  fs.writeFileSync(responseFile, JSON.stringify(responses, null, 2));
  res.json({ success: true, newResponse });
});

app.get("/traffic", async (req, res) => {
  try {
    // Read AMS mappings
    const storeRequests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
    const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"));

    const mappingLookup = storeRequests.reduce((lookup, mapping) => {
      lookup[mapping.wireMockId] = mapping;
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

//Detta läser Scenarion från filen
const readScenarios = () => {
  if (!fs.existsSync(scenariosFile)) return []
  return JSON.parse(fs.readFileSync(scenariosFile, "utf-8"))
}

//Skriver Scenarion till filen
const writeScenarios = (scenarios) => {
  fs.writeFileSync(scenariosFile, JSON.stringify(scenarios, null, 2)) 
}

//Hämtar nästa scenarios Id
const getNextScenarioId = (scenarios) => {
  if (scenarios.length === 0) return "1"
  const maxId = Math.max(...scenarios.map((s) => parseInt(s.id, 10)))
  return String(maxId + 1)
}

//Gör GET anrop på /scenarios för att hämta alla scenarios
app.get ("/scenarios", (req, res) => {
  const scenarios = readScenarios()
  res.json({ scenarios })
})

//Skapar en ny scenario
app.post("/scenarios", (req, res) => {
  const { scenario } = req.body;
  let scenarios = readScenarios();
  const id = getNextScenarioId(scenarios);

  // Ensure each mapping has both "request" and "response"
  const cleanMappings = (scenario.mappings && Array.isArray(scenario.mappings))
  ? scenario.mappings.map(mapping => {
      // Use mapping.id if available; otherwise, use mapping.ReqId from the front-end
      const mappingId = mapping.id || mapping.ReqId;
      
      // Destructure the response to extract its id and the remaining properties
      const { id: responseId, ...restResponse } = mapping.response || {};
      return {
        // Set the top-level reqId if needed
        request: {
          reqId: mappingId,  // Add reqId inside the request object
        },
        response: Object.keys(mapping.response || {}).length > 0
          ? {
              resId: responseId,   // Rename the response id to resId   // Also include reqId in the response object         
            }
          : {}
      };
    })
  : [];

  // Build new scenario object with only the desired keys
  const newScenario = {
    id,
    name: scenario.name,
    mappings: cleanMappings
  };

  scenarios.push(newScenario);
  writeScenarios(scenarios);
  res.json({ success: true, scenario: newScenario });
});

// Batch endpoint to send all mappings for a given scenario to WireMock
app.post("/scenarios/:id/send", async (req, res) => {
  const { id } = req.params;
  let scenarios = readScenarios();
  const scenarioIndex = scenarios.findIndex(s => s.id === id);
  if (scenarioIndex === -1) {
    return res.status(404).json({ success: false, message: "Scenario not found" });
  }
  const scenario = scenarios[scenarioIndex];
  
  if (!scenario.mappings || scenario.mappings.length === 0) {
    return res.status(400).json({ success: false, message: "No mappings to send for this scenario" });
  }
  
  // Send each mapping concurrently using Promise.all
  const results = await Promise.all(
    scenario.mappings.map(mapping => {
      const mappingId = mapping.request.reqId;
      return handleSendToWireMock(mappingId);
    })
  );
  
  // Update each mapping with its WireMock ID
  const updatedMappings = scenario.mappings.map((mapping, index) => {
    const result = results[index];
    return result && result.success
      ? { ...mapping, wireMockId: result.wireMockId }
      : mapping;
  });
  scenario.mappings = updatedMappings;
  
  // Update the main requests file (by matching mapping IDs)
  let requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
  updatedMappings.forEach(updatedMapping => {
    const reqId = updatedMapping.request.reqId;
    const reqIndex = requests.findIndex(r => r.id === reqId);
    if (reqIndex !== -1) {
      requests[reqIndex].wireMockId = updatedMapping.wireMockId || requests[reqIndex].wireMockId;
    }
  });
  fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2));
  writeScenarios(scenarios);
  
  if (results.every(result => result && result.success)) {
    return res.json({ success: true, scenario });
  } else {
    return res.json({ success: false, message: "Some mappings failed to send", scenario });
  }
});



//Uppdaterar scenarios
app.put("/scenarios/:id", (req, res) => {
  const { id } = req.params;
  let scenarios = readScenarios();
  const index = scenarios.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Scenario not found" });
  }
  const scenario = scenarios[scenarioIndex];

  if (!scenario.mappings || scenario.mappings.length === 0) {
    return res.status(400).json({ success: false, message: "Scenario not Found"})     
  }
  
  // Merge new data into existing scenario
  const existingScenario = scenarios[index];

  // Merge scenario name if provided
  if (scenario.name) {  
    existingScenario.name = scenario.name;
  }

  // Merge new mappings
  if (scenario.mappings && scenario.mappings.length) {
    const cleanMapping = scenario.mappings.map(mapping => ({
      request: mapping.request,
      response: mapping.response 
    }))
    existingScenario.mappings = [
      ...(existingScenario.mappings || []),
      ...cleanMapping
    ];
  }

  if (scenario.responses && scenario.responses.length) {
    existingScenario.responses = [
      ...(existingScenario.responses || []),
      ...scenario.responses,
    ];
  }

  // Save updated scenario
  scenarios[index] = existingScenario;
  writeScenarios(scenarios);

  res.json({ success: true, scenario: existingScenario });
});


//Tar bort scenarios
app.delete("/scenarios/:id", (req, res) => {
  const {id} = req.params
  let scenarios = readScenarios()
  scenarios = scenarios.filter((s) => s.id !== id)
  writeScenarios(scenarios)
  res.json({success: true})
})

app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});