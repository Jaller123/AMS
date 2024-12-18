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

app.get("/mappings", (req, res) => {
  const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"))
  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"))
  res.json({ requests, responses })
})

app.post("/mappings", (req, res) => {
  const { request, response } = req.body
  const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"))
  const responses = JSON.parse(fs.readFileSync(responseFile, "utf-8"))

  const newId = request.length ? requests[requests.length -1].id +1 : 1

  const newRequest = { id: newId, resJson: request }
  const newResponse = { id: newId, reqId: newId, resJson: response }

  requests.push(newRequest)
  responses.push(newResponse)

  fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2))
  fs.writeFileSync(responseFile, JSON.stringify(responses, null, 2))

  res.json({ success: true, newRequest, newResponse })
})

app.listen(8080, () => {
  console.log("Server running on http://localhost:8080")
})