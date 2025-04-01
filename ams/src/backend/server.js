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
  createResponse,
  saveWireMockToMapping,
  clearWireMockIds,
} from './mappings.js'


const WIREMOCK_BASE_URL = "http://localhost:8081/__admin/mappings";
const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));
app.use(express.json());


// Helper för nästa ID
const getNextId = (mappings) => {
  if (mappings.length === 0) return "1"; // Return as string
  const maxId = Math.max(...mappings.map((item) => parseInt(item.id, 10)));
  return String(maxId + 1); // Increment and return as string
};

// ✅ Add WireMock Health Check Route
app.get("/health", async (req, res) => {
  try {
    const wireMockResponse = await fetch("http://localhost:8081/__admin/mappings");
    if (!wireMockResponse.ok) throw new Error("WireMock is unavailable");

    const mappings = await wireMockResponse.json();
    const activeStubIds = mappings.mappings.map((m) => m.id);

    res.json({ wiremockRunning: true, activeStubIds });
  } catch (error) {
    console.error("❌ WireMock is DOWN:", error.message);
    await clearWireMockIds(); // ✅ Clear them on failure
    res.json({ wiremockRunning: false, activeStubIds: [] });
  }
});



// Hämta alla mappings
app.get("/mappings", async (req, res) => {
  try {
    const mappings = await getMappings();

    // Fetch actual WireMock mappings
    const wireMockResponse = await fetch("http://localhost:8081/__admin/mappings");
    const wireMockData = await wireMockResponse.json();
    const wireMockIds = wireMockData.mappings.map((m) => m.id);

    // Mark mappings as matched or not
    const enrichedMappings = mappings.map((mapping) => ({
      ...mapping,
      isMatched: mapping.wireMockId ? wireMockIds.includes(mapping.wireMockId) : false
    }));

    res.json({ mappings: enrichedMappings });
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
app.post('/mappings', async (req, res) => {
  try {
    // Expecting request.body to include "request" and optionally "response"
    const mapping = req.body;
    const newMapping = await createMapping(mapping);
    res.json({ success: true, mapping: newMapping });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating mapping' });
  }
});


// POST /mappings/:id/send: Send a mapping to WireMock
app.post("/mappings/:id/send", async (req, res) => {
  try {
    const { id } = req.params;
    const allMappings = await getMappings();
    const mapping = allMappings.find((m) => String(m.request.id) === String(id));

    if (!mapping) {
      return res.status(404).json({ success: false, message: "Mapping not found" });
    }

    const requestData = mapping.request.reqJson;
    const responseData = mapping.responses[0]?.resJson;

    const mappingToSend = {
      request: {
        ...requestData,
        ...(requestData.method !== 'GET' && requestData.body && {
          bodyPatterns: [{ equalToJson: requestData.body }]
        })
      },
      response: {
        status: responseData?.status || 200,
        headers: responseData?.headers || {},
        body: JSON.stringify(responseData?.body || {})
      }
    };
    
    console.log("🔍 Sending to WireMock:\n", JSON.stringify(mappingToSend, null, 2));

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
    
    await saveWireMockToMapping(id, data.id || data.wireMockId); // Save the WireMock ID to the mapping in the database
    return res.json({ success: true, wireMockId: data.id || data.uuid, message: "Mapping sent to WireMock successfully!", });
    
  } catch (error) {
    console.error("❌ Error sending to WireMock:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});




// Uppdatera en request
app.put('/mappings/:reqId', async (req, res) => {
  try {
    const { reqId } = req.params;
    const updatedRequest = req.body.request;
    const result = await updateMappingRequest(reqId, updatedRequest);
    res.json({ success: true, updatedRequest: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating mapping' });
  }
});


// Uppdatera en respons
app.put('/responses/:resId', async (req, res) => {
  try {
    const { resId } = req.params;
    console.log(`Received update request for response ID: ${resId}`);
    console.log("Request body:", req.body);
    const updatedResponse = req.body.response;
    const result = await updateMappingResponse(resId, updatedResponse);
    res.json({ success: true, updatedResponse: result });
  } catch (error) {
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
  try {
    const { reqId } = req.params;
    await deleteMapping(reqId);
    res.json({ success: true });
  } catch (error) {
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

//Detta läser Scenarion från file

//Hämtar nästa scenarios Id
//Skapar en ny scenario

  



//Uppdaterar scenarios


//Tar bort scenarios

app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});