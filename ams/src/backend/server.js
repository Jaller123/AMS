import express from "express";
import fs from "fs";
import connection from "./db.js";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import fetch from "node-fetch";
import { exec } from "child_process"
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
} from "./mappings.js";

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
    const wireMockResponse = await fetch(
      "http://localhost:8081/__admin/mappings"
    );
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
    const wireMockResponse = await fetch(
      "http://localhost:8081/__admin/mappings"
    );
    const wireMockData = await wireMockResponse.json();
    const wireMockIds = wireMockData.mappings.map((m) => m.id);

    // Mark mappings as matched or not
    const enrichedMappings = mappings.map((mapping) => ({
      ...mapping,
      isMatched: mapping.wireMockId
        ? wireMockIds.includes(mapping.wireMockId)
        : false,
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
app.post("/mappings", async (req, res) => {
  try {
    // Expecting request.body to include "request" and optionally "response"
    const mapping = req.body;
    const newMapping = await createMapping(mapping);
    res.json({ success: true, mapping: newMapping });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating mapping" });
  }
});

// POST /mappings/:id/send: Send a mapping to WireMock
app.post("/mappings/:id/send", async (req, res) => {
  try {
    const { id } = req.params;
    const allMappings = await getMappings();
    const mapping = allMappings.find(
      (m) => String(m.request.id) === String(id)
    );

    if (!mapping) {
      return res
        .status(404)
        .json({ success: false, message: "Mapping not found" });
    }

    const requestData = mapping.request.reqJson;
    const responseData = mapping.responses[0]?.resJson;

    const mappingToSend = {
      request: {
        ...requestData,
        ...(requestData.method !== "GET" &&
          requestData.body && {
            bodyPatterns: [{ equalToJson: requestData.body }],
          }),
      },
      response: {
        status: responseData?.status || 200,
        headers: responseData?.headers || {},
        body: JSON.stringify(responseData?.body || {}),
      },
    };

    console.log(
      "🔍 Sending to WireMock:\n",
      JSON.stringify(mappingToSend, null, 2)
    );

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

    await saveWireMockToMapping(id, data.id || data.wireMockId); // Save the WireMock ID to the mapping in the database
    return res.json({
      success: true,
      wireMockId: data.id || data.uuid,
      message: "Mapping sent to WireMock successfully!",
    });
  } catch (error) {
    console.error("❌ Error sending to WireMock:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Uppdatera en request
app.put("/mappings/:reqId", async (req, res) => {
  try {
    const { reqId } = req.params;
    const updatedRequest = req.body.request;
    const result = await updateMappingRequest(reqId, updatedRequest);
    res.json({ success: true, updatedRequest: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating mapping" });
  }
});

// Uppdatera en respons
app.put("/responses/:resId", async (req, res) => {
  try {
    const { resId } = req.params;
    console.log(`Received update request for response ID: ${resId}`);
    console.log("Request body:", req.body);
    const updatedResponse = req.body.response;
    const result = await updateMappingResponse(resId, updatedResponse);
    res.json({ success: true, updatedResponse: result });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error updating response" });
  }
});

app.get("/responses/:resId", async (req, res) => {
  try {
    const { resId } = req.params;
    const responses = await getMappings(); // Fetch all mappings (which contain responses)
    const response = responses
      .flatMap((m) => m.responses) // Extract responses from mappings
      .find((r) => r.dbId == resId); // Match by resId

    if (!response) {
      return res
        .status(404)
        .json({ success: false, message: "Response not found" });
    }

    res.json({ success: true, response });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching response" });
  }
});

// Ta bort mapping
app.delete("/mappings/:reqId", async (req, res) => {
  try {
    const { reqId } = req.params;
    await deleteMapping(reqId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting mapping" });
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
    res
      .status(500)
      .json({ success: false, message: "Failed to save response." });
  }
});

app.get("/traffic", async (req, res) => {
  try {
    // Read AMS mappings
    const storeRequests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
    c;

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
app.get("/scenarios", async (req, res) => {
  const [scenarios] = await connection.execute("SELECT * FROM scenariotab");
  const [links] = await connection.execute("SELECT * FROM scenariorestab");
  const [responses] = await connection.execute("SELECT * FROM restab");
  const [requests] = await connection.execute("SELECT * FROM reqtab");

  console.log("🔍 Loaded responses from restab:", responses); // ✅ Kolla vad vi hämtar från restab

  const result = scenarios.map((s) => {
    const linkedRes = links.filter((l) => l.scenario_Id === s.id);
    console.log(`Scenario ${s.id} linked resources:`, linkedRes); // ✅ Kolla vilka resurser som är kopplade

    const scenarioMappings = linkedRes
      .map((link) => {
        const response = responses.find((r) => r.resId === link.resId);
        if (!response) {
          console.log(`❌ No response found for resId: ${link.resId}`);
          return null;
        }

        const request = requests.find((req) => req.reqId === response.reqId);
        if (!request) {
          console.log(`❌ No request found for reqId: ${response.reqId}`);
          return null;
        }

        console.log(`✅ Found request for reqId: ${request.reqId}`);

        return {
          resId: response.resId,
          reqId: response.reqId,
          request: {
            id: request.reqId,
            title: request.title,
            ...JSON.parse(request.reqJson),
          },
          response: {
            id: response.resId,
            title: response.title,
            ...JSON.parse(response.resJson),
          },
        };
      })
      .filter(Boolean); // Remove nulls

    return {
      id: s.id,
      name: s.title,
      mappings: scenarioMappings,
    };
  });

  console.log("✅ Final Scenarios with Mappings:", result);
  res.json({ scenarios: result });
});

// POST new scenario
app.post("/scenarios", async (req, res) => {
  const { scenario } = req.body;
  const { name, mappings } = scenario;

  if (!name || !Array.isArray(mappings)) {
    return res.status(400).json({ success: false, message: "Invalid scenario format" });
  }

  const [insertResult] = await connection.execute(
    "INSERT INTO scenariotab (title) VALUES (?)",
    [name]
  );
  const scenId = insertResult.insertId;

  for (const mapping of mappings) {
    const resId = mapping.resId; // ✅ FIXED HERE

    console.log("💾 Saving Scenario:", { scenId, name, mappings });
    console.log("➡️ Trying to link resId:", resId, "to scenario_Id:", scenId);

    if (resId) {
      await connection.execute(
        "INSERT INTO scenariorestab (scenario_Id, resId) VALUES (?, ?)",
        [scenId, resId]
      );
    } else {
      console.warn("⚠️ No resId found in mapping:", mapping);
    }
  }

  res.json({ success: true, scenario: { id: scenId, name, mappings } });
});

//Uppdaterar scenarios
app.put("/scenarios/:id", async (req, res) => {
  const { id } = req.params; // Få id från URL
  const { name, mappings } = req.body.scenario; // Hämta den nya informationen från request body

  if (!name || !Array.isArray(mappings)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid scenario format" });
  }

  try {
    // Uppdatera scenariot i scenariotab
    const [updateResult] = await connection.execute(
      "UPDATE scenariotab SET title = ? WHERE id = ?",
      [name, id]
    );

    if (updateResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Scenario not found" });
    }

    // Ta bort gamla mappningar från scenariorestab för detta scenario
    await connection.execute(
      "DELETE FROM scenariorestab WHERE scenario_Id = ?",
      [id]
    );

    // Lägg till de nya mappningarna
    for (const mapping of mappings) {
      const { resId } = mapping;

      if (resId) {
        await connection.execute(
          "INSERT INTO scenariorestab (scenario_Id, resId) VALUES (?, ?)",
          [id, resId]
        );
      } else {
        console.warn("⚠️ No resId found in mapping:", mapping);
      }
    }

    // Hämta det uppdaterade scenariot och dess mappningar
    const [scenarios] = await connection.execute(
      "SELECT * FROM scenariotab WHERE id = ?",
      [id]
    );
    const [links] = await connection.execute(
      "SELECT * FROM scenariorestab WHERE scenario_Id = ?",
      [id]
    );
    const [responses] = await connection.execute("SELECT * FROM restab");
    const [requests] = await connection.execute("SELECT * FROM reqtab");

    const updatedScenario = scenarios.map((s) => {
      const linkedRes = links.filter((l) => l.scenario_Id === s.id);
      const scenarioMappings = linkedRes
        .map((link) => {
          const response = responses.find((r) => r.resId === link.resId);
          if (!response) return null;

          const request = requests.find((req) => req.reqId === response.reqId);
          if (!request) return null;

          return {
            resId: response.resId,
            reqId: response.reqId,
            request: {
              id: request.reqId,
              title: request.title,
              ...JSON.parse(request.reqJson),
            },
            response: {
              id: response.resId,
              title: response.title,
              ...JSON.parse(response.resJson),
            },
          };
        })
        .filter(Boolean);

      return {
        id: s.id,
        name: s.title,
        mappings: scenarioMappings,
      };
    })[0]; // Vi bör få enbart ett scenario om id är unikt.

    return res.json({ success: true, scenario: updatedScenario });
  } catch (error) {
    console.error("Error updating scenario:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

//Send Scenario to WireMock
app.post("/scenarios/:id/send", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch scenario from database
    const [scenarios] = await connection.execute("SELECT * FROM scenariotab WHERE id = ?", [id]);
    if (scenarios.length === 0) {
      return res.status(404).json({ success: false, message: "Scenario not found" });
    }

    const [links] = await connection.execute("SELECT * FROM scenariorestab WHERE scenario_Id = ?", [id]);
    const [responses] = await connection.execute("SELECT * FROM restab");
    const [requests] = await connection.execute("SELECT * FROM reqtab");

    const mappingsToSend = links.map(link => {
      const response = responses.find(r => r.resId === link.resId);
      const request = response ? requests.find(req => req.reqId === response.reqId) : null;

      if (!request || !response) return null;

      return {
        reqId: request.reqId,
        resId: response.resId,
        request: {
          ...JSON.parse(request.reqJson),
        },
        response: {
          ...JSON.parse(response.resJson),
        },
      };
    }).filter(Boolean);

    const results = [];

    for (const mapping of mappingsToSend) {
      const payload = {
        request: {
          method: mapping.request.method,
          url: mapping.request.url,
          headers: Object.fromEntries(
            Object.entries(mapping.request.headers || {}).map(([k, v]) => [k, { equalTo: v.equalTo || v }])
          ),
          bodyPatterns: mapping.request.bodyPatterns || [],
        },
        response: {
          status: mapping.response.status,
          headers: mapping.response.headers || {},
          body: JSON.stringify(mapping.response.body || {}),
        },
      };

      const wireMockResponse = await fetch(WIREMOCK_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await wireMockResponse.json();

      if (!wireMockResponse.ok || !data.id) {
        console.error(`❌ Failed to send mapping (reqId: ${mapping.reqId})`, data);
        continue;
      }

      // Save wireMockId back to the database
      await connection.execute(
        "UPDATE reqtab SET wireMockId = ? WHERE reqId = ?",
        [data.id, mapping.reqId]
      );

      results.push({
        reqId: mapping.reqId,
        wireMockId: data.id,
      });
    }

    res.json({ success: true, results, message: `Sent ${results.length} mappings to WireMock.` });
  } catch (error) {
    console.error("❌ Error sending scenario to WireMock:", error);
    res.status(500).json({ success: false, message: "Server error while sending scenario." });
  }
});


//Tar bort scenarios
app.delete("/scenarios/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Kontrollera om scenariot finns
    const [existingScenario] = await connection.execute(
      "SELECT * FROM scenariotab WHERE id = ?",
      [id]
    );

    if (existingScenario.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Scenario not found" });
    }

    // Steg 1: Radera länkar i scenariorestab (om de finns)
    await connection.execute(
      "DELETE FROM scenariorestab WHERE scenario_Id = ?",
      [id]
    );

    // Steg 2: Radera själva scenariot från scenariotab
    await connection.execute("DELETE FROM scenariotab WHERE id = ?", [id]);

    res.json({ success: true, message: "Scenario deleted successfully" });
  } catch (error) {
    console.error("Error deleting scenario:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});


app.post("/mock-control/toggle", async (req, res) => {
try {
  exec("docker ps --filter name=wiremock --format '{{.ID}}'", (checkErr, containerId) => {
    if (checkErr) {
      console.error("Error checking Docker containers:", checkErr);
      return res.status(500).json({ success: false, message: checkErr.message });
    }
    if (containerId.trim()) {
      exec("docker stop wiremock", (stopErr, stdout) => {
        if (stopErr) {
          console.error("Error stopping WireMock:", stopErr);
          return res.status(500).json({ success: false, message: stopErr.message });
        }
        console.log("✅ WireMock stopped:", stdout);
        res.json({ success: true, status: "stopped" });
      });
    } else {
      exec("docker run -d --rm --name wiremock -p 8081:8080 wiremock/wiremock", (startErr, startOutput) => {
        if (startErr) {
          console.error("Error starting WireMock:", startErr);
          return res.status(500).json({ success: false, message: startErr.message });
        }
        console.log("✅ WireMock started:", startOutput);
        res.json({ success: true, status: "started" });
      });
    }
  })
} catch (error) {
  console.error("❌ Unexpected error:", error);
  res.status(500).json({ success: false, message: error.message });
  }
})