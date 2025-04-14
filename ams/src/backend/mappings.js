import e from "express";
import connection from "./db.js";

function parseJsonField(field) {
  if (typeof field !== "string") return field;
  let parsed = JSON.parse(field);
  // If after parsing, it's still a string, parse it again.
  if (typeof parsed === "string") {
    parsed = JSON.parse(parsed);
  }
  return parsed;
}

// Fetch all mappings along with their responses
export async function getMappings() {
  try {
    // Get all requests
    const [reqRows] = await connection.execute("SELECT * FROM reqtab");
    // Get all responses
    const [resRows] = await connection.execute("SELECT * FROM restab");

    // Join responses with their corresponding request using reqId
    const mappings = reqRows.map((req) => {
      const responses = resRows
        .filter((res) => res.reqId === req.reqId)
        .map((res, index) => ({
          id: `${req.reqId}.${index + 1}`, // composite id for display
          resId: res.resId,
          reqId: res.reqId,
          title: res.title || `Response ${index + 1}`,
          resJson:
            typeof res.resJson === "string"
              ? JSON.parse(res.resJson)
              : res.resJson, // parse JSON if stored as string
          timestamp: res.timestamp,
        }));
      const parsedReqJson =
        typeof req.reqJson === "string" ? JSON.parse(req.reqJson) : req.reqJson;

      return {
        id: req.reqId,
        request: {
          id: req.reqId,
          title: req.title,
          reqJson: parsedReqJson,
        },
        wireMockId: req.wireMockId,
        responses,
      };
    });

    return mappings;
  } catch (error) {
    console.error("Error fetching mappings:", error);
    throw error;
  }
}

function formatMySQLDate(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export async function createMapping(mapping) {
  try {
    const rawRequest = { ...mapping.request };
    const reqJson = rawRequest.reqJson || {};
    const title = mapping.title || rawRequest.title || null;

    delete rawRequest.title;

    // Hantera headers
    const transformedHeaders = {};
    if (reqJson.headers) {
      for (const [key, value] of Object.entries(reqJson.headers)) {
        if (typeof value === "object" && value.equalTo) {
          transformedHeaders[key] = value;
        } else {
          transformedHeaders[key] = { equalTo: value };
        }
      }
    }

    // 🔥 FIX: Extrahera body från bodyPatterns[0].equalToJson om body saknas
    let extractedBody = reqJson.body;
    if (!extractedBody && Array.isArray(reqJson.bodyPatterns)) {
      const firstPattern = reqJson.bodyPatterns[0];
      if (firstPattern && firstPattern.equalToJson) {
        extractedBody = firstPattern.equalToJson;
      }
    }

    const wireMockRequest = {
      method: reqJson.method,
      url: reqJson.url,
      headers: transformedHeaders,
      ...(extractedBody && {
        bodyPatterns: [{ equalToJson: extractedBody }],
      }),
    };

    const [reqResult] = await connection.execute(
      "INSERT INTO reqtab (title, reqJson, wireMockId) VALUES (?, ?, ?)",
      [title, JSON.stringify(wireMockRequest), mapping.wireMockUuid || null]
    );

    const reqId = reqResult.insertId;

    // Spara responsen
    let newResponse = null;
    if (mapping.response) {
      const resJson = mapping.response;
      const resTitle = resJson.title || "Untitled Response";

      const [resResult] = await connection.execute(
        "INSERT INTO restab (resJson, reqId, title, timestamp) VALUES (?, ?, ?, ?)",
        [JSON.stringify(resJson), reqId, resTitle, formatMySQLDate(new Date())]
      );

      newResponse = {
        dbId: resResult.insertId,
        reqId,
        resJson,
        title: resTitle,
      };
    }

    return {
      reqId,
      request: {
        id: reqId,
        title,
        reqJson: wireMockRequest,
      },
      response: newResponse,
      wireMockUuid: mapping.wireMockUuid || null,
    };
  } catch (error) {
    console.error("❌ Error creating mapping:", error);
    throw error;
  }
}

export async function createResponse(reqId, resJson) {
  try {
    const resTitle = resJson.title || "Untitled";
    const timestamp = formatMySQLDate(new Date());

    const [existingRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM restab WHERE reqId = ?",
      [reqId]
    );
    const index = existingRows[0].count;

    const [result] = await connection.execute(
      "INSERT INTO restab (resJson, reqId, title, timestamp) VALUES (?, ?, ?, ?)",
      [JSON.stringify(resJson), reqId, resTitle, timestamp]
    );

    return {
      id: `${reqId}.${index + 1}`,
      resId: result.insertId,
      reqId,
      resJson,
      title: resTitle,
      timestamp,
    };
  } catch (error) {
    console.error("Error creating response:", error);
    throw error;
  }
}

export async function saveWireMockToMapping(reqId, wireMockId) {
  try {
    const [result] = await connection.execute(
      "UPDATE reqtab SET wireMockId = ? WHERE reqId = ?",
      [wireMockId, reqId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error saving WireMock ID to mapping:", error);
    throw error;
  }
}

export async function clearWireMockIds() {
  try {
    const [result] = await connection.execute(
      "UPDATE reqtab SET wireMockId = NULL WHERE wireMockId IS NOT NULL"
    );
    console.log(`✅ Cleared ${result.affectedRows} wireMockIds from reqtab`);
  } catch (error) {
    console.error("❌ Failed to clear wireMockIds:", error);
  }
}

// Update a mapping's request (in the reqtab table)
export async function updateMappingRequest(reqId, updatedRequest) {
  try {
    const reqJson = JSON.stringify(updatedRequest);
    const [result] = await connection.execute(
      "UPDATE reqtab SET reqJson = ? WHERE reqId = ?",
      [reqJson, reqId]
    );
    if (result.affectedRows === 0) {
      throw new Error("Request not found.");
    }
    return updatedRequest;
  } catch (error) {
    console.error("Error updating request:", error);
    throw error;
  }
}

// Update a response (in the restab table)
export async function updateMappingResponse(resId, updatedResponse) {
  try {
    if (isNaN(parseInt(resId))) {
      // ✅ Ensure resId is a valid integer
      throw new Error(`Invalid resId: ${resId}`);
    }

    console.log(`Updating response with resId: ${resId}`); // Debugging log
    const resJson = JSON.stringify(updatedResponse);

    const [result] = await connection.execute(
      "UPDATE restab SET resJson = ? WHERE resId = ?",
      [resJson, parseInt(resId)] // ✅ Ensure resId is an integer
    );

    if (result.affectedRows === 0) {
      throw new Error(`Response not found for resId: ${resId}`);
    }

    return updatedResponse;
  } catch (error) {
    console.error("Error updating response:", error);
    throw error;
  }
}

// Delete a mapping and its responses
export async function deleteMapping(reqId) {
  try {
    // First, delete the responses that reference this reqId.
    await connection.execute("DELETE FROM restab WHERE reqId = ?", [reqId]);
    // Then, delete the request.
    const [result] = await connection.execute(
      "DELETE FROM reqtab WHERE reqId = ?",
      [reqId]
    );
    if (result.affectedRows === 0) {
      throw new Error("Mapping not found.");
    }
    return true;
  } catch (error) {
    console.error("Error deleting mapping:", error);
    throw error;
  }
}
