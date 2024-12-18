import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReqForm from "./components/ReqForm";
import ResForm from "./components/ResForm";
import MappingsPage from "./components/MappingsPage";

const App = () => {
  const [response, setResponse] = useState({});
  const [mappings, setMappings] = useState(() => {
    const savedMappings = localStorage.getItem("mappings");
    return savedMappings ? JSON.parse(savedMappings) : [];
  });

  const [requests, setRequests] = useState([]);
  const [responses, setResponses] = useState([]);

  // Fetch all mappings from backend
  const fetchMappings = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8080/mappings");
      const data = await res.json();

      setRequests(data.requests);
      setResponses(data.responses);

      const combinedMappings = data.requests.map((req) => {
        const resObj = data.responses.find((res) => res.reqId === req.id);
        return { request: req.reqJson, response: resObj.resJson };
      });

      setMappings(combinedMappings);
    } catch (error) {
      console.error("Error fetching mappings:", error);
    }
  }, []);

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  useEffect(() => {
    localStorage.setItem("mappings", JSON.stringify(mappings));
  }, [mappings]);

  const handleRequestData = async (data) => {
    console.log("Payload to send:", data);
    try {
      const newRequestId = requests.length
        ? requests[requests.length - 1].id + 1
        : 1;

      const newRequest = {
        id: newRequestId,
        reqJson: data,
      };

      const newResponse = {
        id: newRequestId,
        reqId: newRequestId,
        resJson: {
          status: 200,
          headers: data.headers,
          body: data.body,
        },
      };

      // Send data to backend
      const res = await fetch("http://localhost:8080/mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: newRequest.reqJson, response: newResponse.resJson }),
      });

      const result = await res.json();
      console.log("New mapping saved:", result);

      // Update state
      setRequests((prev) => [...prev, newRequest]);
      setResponses((prev) => [...prev, newResponse]);
      setMappings((prevMappings) => [
        ...prevMappings,
        { request: newRequest.reqJson, response: newResponse.resJson },
      ]);

      setResponse(newResponse.resJson);
    } catch (error) {
      console.error("Error handling request data:", error);
      setResponse({
        status: 500,
        body: "Error sending request: " + error.message,
      });
    }
  };

  const handleDelete = async (url) => {
    try {
      const res = await fetch(`http://localhost:8080/mappings/${url}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (result.success) {
        alert(`Mapping for ${url} has been deleted.`);
        fetchMappings(); // Refresh mappings
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting mapping:", error);
    }
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <ReqForm onRequestChange={handleRequestData} />
              <ResForm response={response} />
            </div>
          }
        />
        <Route
          path="/mappings"
          element={<MappingsPage mappings={mappings} handleDelete={handleDelete} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
