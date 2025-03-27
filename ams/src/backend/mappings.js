// mappings.js
import e from 'express';
import connection from './db.js';

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
    const [reqRows] = await connection.execute('SELECT * FROM reqtab');
    // Get all responses
    const [resRows] = await connection.execute('SELECT * FROM restab');
    
    // Join responses with their corresponding request using reqId
    const mappings = reqRows.map(req => {
        const responses = resRows
          .filter(res => res.reqId === req.reqId)
          .map((res, index) => ({
            id: `${req.reqId}.${index + 1}`, // composite id for display
            resId: res.resId,               
            reqId: res.reqId,
            title: res.title || `Response ${index + 1}`,
            resJson: typeof res.resJson === "string" ? JSON.parse(res.resJson) : res.resJson, // parse JSON if stored as string
            timestamp: res.timestamp,
          }));
        const parsedReqJson = typeof req.reqJson === "string" ? JSON.parse(req.reqJson) : req.reqJson;
        return {
          id: req.reqId,
          title: req.title,
          request: { reqJson: parsedReqJson },
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
  
  


export async function createMapping(mapping) {
  try {
    const rawRequest = {...mapping.request}

    const title = mapping.title || rawRequest.title || null; // Fallback in case title is nested

    delete rawRequest.title

    const transformedHeaders = {} 
    if (rawRequest.headers) {
      for (const [key, value] of Object.entries(rawRequest.headers)) {
        transformedHeaders[key] = {equalTo: value}
      }
    }

    const bodyPatterns = rawRequest.body
    ? [{equalToJson: rawRequest.body}]
    : undefined

    const wireMockRequest = {
      method: rawRequest.method,
      url: rawRequest.url,
      headers: transformedHeaders,
      bodyPatterns,
    }
    const [reqResult] = await connection.execute(
      'INSERT INTO reqtab (title, reqJson, wireMockId) VALUES (?, ?, ?)',
      [title, JSON.stringify(wireMockRequest), mapping.wireMockId || null]
    );

    const reqId = reqResult.insertId;

    let newResponse = null;
    if (mapping.response) {
      const resJson = JSON.stringify(mapping.response);
      const resTitle = mapping.response.title || "Untitled Response";
      const [resResult] = await connection.execute(
        'INSERT INTO restab (resJson, reqId, title) VALUES (?, ?, ?)',
        [resJson, reqId, resTitle]
      );
      newResponse = {
        dbId: resResult.insertId,
        reqId,
        resJson: mapping.response,
        title: resTitle
      };
    }

    return { reqId, request: mapping.request, response: newResponse };
  } catch (error) {
    console.error("Error creating mapping:", error);
    throw error;
  }
}

  

// Update a mapping's request (in the reqtab table)
export async function updateMappingRequest(reqId, updatedRequest) {
  try {
    const reqJson = JSON.stringify(updatedRequest);
    const [result] = await connection.execute(
      'UPDATE reqtab SET reqJson = ? WHERE reqId = ?',
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
    if (isNaN(parseInt(resId))) {  // ✅ Ensure resId is a valid integer
      throw new Error(`Invalid resId: ${resId}`);
    }

    console.log(`Updating response with resId: ${resId}`);  // Debugging log
    const resJson = JSON.stringify(updatedResponse);

    const [result] = await connection.execute(
      'UPDATE restab SET resJson = ? WHERE resId = ?',
      [resJson, parseInt(resId)]  // ✅ Ensure resId is an integer
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
    await connection.execute('DELETE FROM restab WHERE reqId = ?', [reqId]);
    // Then, delete the request.
    const [result] = await connection.execute('DELETE FROM reqtab WHERE reqId = ?', [reqId]);
    if (result.affectedRows === 0) {
      throw new Error("Mapping not found.");
    }
    return true;
  } catch (error) {
    console.error("Error deleting mapping:", error);
    throw error;
  }
}
