<<<<<<< HEAD
=======
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReqForm from "./components/ReqForm";
import ResForm from "./components/ResForm";
import MappingsPage from "./components/MappingsPage";
import Button from "./components/Button";

const App = () => {
  const [mappings, setMappings] = useState([]);
  const [requestData, setRequestData] = useState(null);
  const [responseData, setResponseData] = useState(null);

  // Fetch existing mappings from the backend
  useEffect(() => {
    fetch("http://localhost:8080/mappings")
      .then((response) => response.json())
      .then(({ requests, responses }) => {
        const mergedMappings = requests.map((req) => {
          const matchingResponse = responses.find(
            (res) => res.reqId === req.id
          );
          return {
            request: req.resJson,
            response: matchingResponse?.resJson || {},
          };
        });
        setMappings(mergedMappings);
      })
      .catch((error) => console.error("Error fetching mappings:", error));
  }, []);

  // Save new mappings to the backend
  const handleSaveMapping = () => {
    if (requestData && responseData) {
      const mapping = { request: requestData, response: responseData };

      fetch("http://localhost:8080/mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapping),
      })
        .then((response) => response.json())
        .then(({ newRequest, newResponse }) => {
          const newMapping = {
            request: newRequest.resJson,
            response: newResponse.resJson,
          };
          setMappings((prevMappings) => [...prevMappings, newMapping]);
          setRequestData(null); // Reset request data
          setResponseData(null); // Reset response data
        })
        .catch((error) => console.error("Error saving mapping:", error));
    } else {
      alert("Both request and response data are required.");
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
              <ReqForm setRequestData={setRequestData} />
              <ResForm setResponseData={setResponseData} />
              <Button onClick={handleSaveMapping}>Save Mapping</Button>
            </div>
          }
        />
        <Route
          path="/mappings"
          element={<MappingsPage mappings={mappings} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
>>>>>>> 32d219b966a66ae00f858f3cbb29310fdb052121
