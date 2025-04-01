import express from "express";
import fs from "fs";
import sequelize from "./db.js";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import fetch from "node-fetch";
import { handleSendToWireMock } from "./api.js";
import {
  getMappings,
  createMapping,
  updateMappingRequest,
  updateMappingResponse,
  deleteMapping,
<<<<<<< HEAD
} from "./mappings.js";
=======
  createResponse,
} from './mappings.js'

>>>>>>> fe0ebfebe8c420cb662f8eef43024379f577469d

const WIREMOCK_BASE_URL = "http://localhost:8081/__admin/mappings";
const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));
app.use(express.json());
<<<<<<< HEAD
=======

>>>>>>> fe0ebfebe8c420cb662f8eef43024379f577469d

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
app.get("/mappings", async (req, res) => {
  try {
    const mappings = await getMappings();
    res.json({ mappings });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch mappings" });
  }
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
<<<<<<< HEAD
app.post("/mappings", async (req, res) => {
=======
app.post('/mappings', async (req, res) => {
>>>>>>> fe0ebfebe8c420cb662f8eef43024379f577469d
  try {
    // Expecting request.body to include "request" and optionally "response"
    const mapping = req.body;
    const newMapping = await createMapping(mapping);
    res.json({ success: true, mapping: newMapping });
  } catch (error) {
<<<<<<< HEAD
    res.status(500).json({ success: false, message: "Error creating mapping" });
  }
});

=======
    res.status(500).json({ success: false, message: 'Error creating mapping' });
  }
});


>>>>>>> fe0ebfebe8c420cb662f8eef43024379f577469d
// POST /mappings/:id/send: Send a mapping to WireMock
app.post("/mappings/:id/send", async (req, res) => {
  const { id } = req.params;


  const mappingEntry = requests.find((r) => r.id === id);
  const mappingResponse = responses.find((r) => r.reqId === id);

  if (!mappingEntry || !mappingResponse) {
    return res
      .status(404)
      .json({ success: false, message: "Mapping not found" });
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
      return res
        .status(500)
        .json({ success: false, message: "Failed to send to WireMock" });
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
<<<<<<< HEAD
app.put("/mappings/:reqId", async (req, res) => {
=======
app.put('/mappings/:reqId', async (req, res) => {
>>>>>>> fe0ebfebe8c420cb662f8eef43024379f577469d
  try {
    const { reqId } = req.params;
    const updatedRequest = req.body.request;
    const result = await updateMappingRequest(reqId, updatedRequest);
    res.json({ success: true, updatedRequest: result });
  } catch (error) {
<<<<<<< HEAD
    res.status(500).json({ success: false, message: "Error updating mapping" });
=======
    res.status(500).json({ success: false, message: 'Error updating mapping' });
>>>>>>> fe0ebfebe8c420cb662f8eef43024379f577469d
  }
});


// Uppdatera en respons
<<<<<<< HEAD
app.put("/responses/:resId", async (req, res) => {
  try {
    const { resId } = req.params;
=======
app.put('/responses/:resId', async (req, res) => {
  try {
    const { resId } = req.params;
    console.log(`Received update request for response ID: ${resId}`);
    console.log("Request body:", req.body);
>>>>>>> fe0ebfebe8c420cb662f8eef43024379f577469d
    const updatedResponse = req.body.response;
    const result = await updateMappingResponse(resId, updatedResponse);
    res.json({ success: true, updatedResponse: result });
  } catch (error) {
<<<<<<< HEAD
    res
      .status(500)
      .json({ success: false, message: "Error updating response" });
  }
});

// Ta bort mapping
app.delete("/mappings/:reqId", async (req, res) => {
=======
    res.status(500).json({ success: false, message: 'Error updating response' });
  }
});

app.get('/responses/:resId', async (req, res) => {
  try {
    const { resId } = req.params;
    const responses = await getMappings(); // Fetch all mappings (which contain responses)
    const response = responses
      .flatMap(m => m.responses)  // Extract responses from mappings
      .find(r => r.dbId == resId);  // Match by resId

    if (!response) {
      return res.status(404).json({ success: false, message: "Response not found" });
    }

    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching response" });
  }
});


// Ta bort mapping
app.delete('/mappings/:reqId', async (req, res) => {
>>>>>>> fe0ebfebe8c420cb662f8eef43024379f577469d
  try {
    const { reqId } = req.params;
    await deleteMapping(reqId);
    res.json({ success: true });
  } catch (error) {
<<<<<<< HEAD
    res.status(500).json({ success: false, message: "Error deleting mapping" });
  }
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
=======
    res.status(500).json({ success: false, message: 'Error deleting mapping' });
  }
});


app.post("/responses", async (req, res) => {
  try {
    const { reqId, resJson } = req.body;

    if (!reqId || !resJson?.status || !resJson?.headers || !resJson?.body) {
      return res.status(400).json({
        success: false,
        message: "Invalid data. Ensure reqId and resJson fields are valid.",
      });
    }

    const newResponse = await createResponse(reqId, resJson);
    res.json({ success: true, newResponse });
  } catch (error) {
    console.error("Error creating response:", error);
    res.status(500).json({ success: false, message: "Failed to save response." });
>>>>>>> fe0ebfebe8c420cb662f8eef43024379f577469d
  }
});

app.get("/traffic", async (req, res) => {
  try {
    // Read AMS mappings
    const storeRequests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
    c

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

<<<<<<< HEAD
//Detta läser Scenarion från filen
const readScenarios = () => {
  if (!fs.existsSync(scenariosFile)) return [];
  return JSON.parse(fs.readFileSync(scenariosFile, "utf-8"));
};

//Skriver Scenarion till filen
const writeScenarios = (scenarios) => {
  fs.writeFileSync(scenariosFile, JSON.stringify(scenarios, null, 2));
};

//Hämtar nästa scenarios Id
const getNextScenarioId = (scenarios) => {
  if (scenarios.length === 0) return "1";
  const maxId = Math.max(...scenarios.map((s) => parseInt(s.id, 10)));
  return String(maxId + 1);
};

//Gör GET anrop på /scenarios för att hämta alla scenarios
app.get("/scenarios", (req, res) => {
  const scenarios = readScenarios();
  res.json({ scenarios });
});

=======
//Detta läser Scenarion från file

//Hämtar nästa scenarios Id
>>>>>>> fe0ebfebe8c420cb662f8eef43024379f577469d
//Skapar en ny scenario

<<<<<<< HEAD
  // Ensure each mapping has both "request" and "response"
  const cleanMappings =
    scenario.mappings && Array.isArray(scenario.mappings)
      ? scenario.mappings.map((mapping) => {
          // Use mapping.id if available; otherwise, use mapping.ReqId from the front-end
          const mappingId = mapping.id || mapping.ReqId;

          // Destructure the response to extract its id and the remaining properties
          const { id: responseId, ...restResponse } = mapping.response || {};
          return {
            // Set the top-level reqId if needed
            request: {
              reqId: mappingId, // Add reqId inside the request object
            },
            response:
              Object.keys(mapping.response || {}).length > 0
                ? {
                    resId: responseId, // Rename the response id to resId   // Also include reqId in the response object
                  }
                : {},
          };
        })
      : [];

  // Build new scenario object with only the desired keys
  const newScenario = {
    id,
    name: scenario.name,
    mappings: cleanMappings,
  };

  scenarios.push(newScenario);
  writeScenarios(scenarios);
  res.json({ success: true, scenario: newScenario });
});

// Batch endpoint to send all mappings for a given scenario to WireMock
app.post("/scenarios/:id/send", async (req, res) => {
  const { id } = req.params;
  let scenarios = readScenarios();
  const scenarioIndex = scenarios.findIndex((s) => s.id === id);
  if (scenarioIndex === -1) {
    return res
      .status(404)
      .json({ success: false, message: "Scenario not found" });
  }
  const scenario = scenarios[scenarioIndex];

  if (!scenario.mappings || scenario.mappings.length === 0) {
    return res
      .status(400)
      .json({
        success: false,
        message: "No mappings to send for this scenario",
      });
  }

  // Send each mapping concurrently using Promise.all
  const results = await Promise.all(
    scenario.mappings.map((mapping) => {
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
  updatedMappings.forEach((updatedMapping) => {
    const reqId = updatedMapping.request.reqId;
    const reqIndex = requests.findIndex((r) => r.id === reqId);
    if (reqIndex !== -1) {
      requests[reqIndex].wireMockId =
        updatedMapping.wireMockId || requests[reqIndex].wireMockId;
    }
  });
  fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2));
  writeScenarios(scenarios);

  if (results.every((result) => result && result.success)) {
    return res.json({ success: true, scenario });
  } else {
    return res.json({
      success: false,
      message: "Some mappings failed to send",
      scenario,
    });
  }
});
=======
  
>>>>>>> fe0ebfebe8c420cb662f8eef43024379f577469d

//Uppdaterar scenarios
<<<<<<< HEAD
app.put("/scenarios/:id", (req, res) => {
  const { id } = req.params;
  let scenarios = readScenarios();
  const index = scenarios.findIndex((s) => s.id === id);
  if (index === -1) {
    return res
      .status(404)
      .json({ success: false, message: "Scenario not found" });
  }

  // Get the new scenario data from the request body.
  const updatedScenario = req.body.scenario;
  if (!updatedScenario) {
    return res
      .status(400)
      .json({ success: false, message: "No scenario data provided" });
  }

  const cleanMappings =
    updatedScenario.mappings && Array.isArray(updatedScenario.mappings)
      ? updatedScenario.mappings.map((mapping) => ({
          request: { reqId: mapping.request.reqId },
          response:
            mapping.response && mapping.response.resId
              ? { resId: mapping.response.resId }
              : {},
        }))
      : [];

  // Replace the existing scenario data with the new data.
  scenarios[index] = {
    id,
    name: updatedScenario.name, // Use the updated name
    mappings: updatedScenario.mappings, // Replace the mappings
    // You can add responses if needed.
  };

  writeScenarios(scenarios);
  res.json({ success: true, scenario: scenarios[index] });
});
=======
>>>>>>> fe0ebfebe8c420cb662f8eef43024379f577469d

//Tar bort scenarios
<<<<<<< HEAD
app.delete("/scenarios/:id", (req, res) => {
  const { id } = req.params;
  let scenarios = readScenarios();
  scenarios = scenarios.filter((s) => s.id !== id);
  writeScenarios(scenarios);
  res.json({ success: true });
});
=======
>>>>>>> fe0ebfebe8c420cb662f8eef43024379f577469d

app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});
