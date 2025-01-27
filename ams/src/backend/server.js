import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(bodyParser.json());
app.use(cors());

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

// Hämta alla mappings
app.get("/mappings", (req, res) => {
  const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"));
  console.log("GET /mappings:", { requests, responses });
  res.json({ requests, responses });
});

// Skapa ny mapping
app.post("/mappings", (req, res) => {
  const { request, response } = req.body;

  const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"));

  // Kontrollera om request redan finns
  const existingRequest = requests.find(
    (req) => JSON.stringify(req.resJson) === JSON.stringify(request)
  );

  let requestId;
  if (existingRequest) {
    requestId = existingRequest.id;
  } else {
    requestId = getNextId(requests);
    requests.push({ id: requestId, resJson: request });
    fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2));
  }

  // Skapa nytt response-ID
  const matchingResponses = responses.filter((res) => res.reqId === requestId);
  const responseId = `${requestId}.${matchingResponses.length + 1}`;

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

app.post("/responses", (req, res) => {
  const { reqId, resJson, timestamp } = req.body;

  if (!reqId || !resJson || !resJson.status || !resJson.headers || !resJson.body) {
    return res.status(400).json({ success: false, message: "Invalid data. Ensure reqId and resJson fields are valid." });
  }

  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"));

  const matchingResponses = responses.filter((response) => response.reqId === reqId);
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
  const updatedRequests = requests.filter((req) => String(req.id) !== String(id));
  const updatedResponses = responses.filter((res) => String(res.reqId) !== String(id));

  // Write the updated data back to files
  fs.writeFileSync(requestsFile, JSON.stringify(updatedRequests, null, 2));
  fs.writeFileSync(responseFile, JSON.stringify(updatedResponses, null, 2));

  res.json({ success: true });
});


app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});
