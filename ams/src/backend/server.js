import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express()
app.use(bodyParser.json())
app.use(cors())

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requestsFile = path.join(__dirname, "./mappings_requests.json");
const responseFile = path.join(__dirname, "./mappings_responses.json");

const getNextId = (mappings) => {
  if (mappings.length === 0) return 1
  const maxId = Math.max(...mappings.map((item) => item.id))
  return maxId + 1
}

app.get("/mappings", (req, res) => {
  const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"))
  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"))
  res.json({ requests, responses })
})

app.post("/mappings", (req, res) => {
  const { request, response } = req.body
  const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"))
  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"))

  //existingRequest kollar om request redan finns inann det skickar mapping
  const existingRequest = requests.find(
    (req) => JSON.stringify(req.resJson) === JSON.stringify(request)
  );

  let requestId
  if (existingRequest) {
    //Om det finns, använder den samma ID
    requestId = existingRequest.id
  } else {
    //Ifall det inte finns, lägg till en ny ID
    requestId = getNextId(requests)
    requests.push({ id: requestId, resJson: request })
    fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2))
  }

  //Detta är för att hantera ID Logiken för REQ och RES
  const matchingResponses = responses.filter((res) => res.reqId === requestId)
  const responseId = `${requestId}.${matchingResponses.length + 1}` // Skapa en ny decimal för respons ID
  
  const newResponse = { id: responseId, reqId: requestId, resJson: response }
  responses.push(newResponse)

  fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2))
  fs.writeFileSync(responseFile, JSON.stringify(responses, null, 2))

  res.json({ success: true, newRequest: { id: requestId, resJson: request }, newResponse })
})



app.delete("/mappings/:id", (req, res) => {
  const { id } = req.params
  if (!id) {
    return res.status(400).json({ success: false, message: "Invalid ID" })
  }

  console.log(`Deleting mapping with ID: ${id}`);

  const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"))
  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"))
  
  const updatedResponses = responses.filter((res) => res.id !== id)
  const remainingResponseIds = updatedResponses.map((res) => res.reqId);
  const updatedRequests = requests.filter((req) =>
    remainingResponseIds.includes(req.id)
  );

  fs.writeFileSync(requestsFile, JSON.stringify(updatedRequests, null, 2))
  fs.writeFileSync(responseFile, JSON.stringify(updatedResponses, null, 2))

  res.json({ success: true })
});


app.listen(8080, () => {
  console.log("Server running on http://localhost:8080")
})