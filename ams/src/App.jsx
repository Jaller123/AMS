import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReqForm from "./components/ReqForm";
import ResForm from "./components/ResForm";
import MappingsPage from "./components/MappingsPage";
import Button from "./components/Button";
import { fetchMappings, saveMapping } from "./backend/api.js";

const App = () => {
  const [mappings, setMappings] = useState([]);
  const [requestData, setRequestData] = useState(null);
  const [responseData, setResponseData] = useState(null);

  // Fetch existing mappings from the backend
  useEffect(() => {
    const loadMappings = async () => {
      const data = await fetchMappings();
      setMappings(data);
    };
    loadMappings();
  }, []);

  // Save new mappings to the backend
  const handleSaveMapping = async () => {
    if (requestData && responseData) {
      try {
        const newMapping = await saveMapping({ request: requestData, response: responseData });
        setMappings((prevMappings) => [...prevMappings, newMapping]);
        setRequestData(null); // Reset request data
        setResponseData(null); // Reset response data
      } catch (error) {
        alert("Failed to save mapping. Please try again.");
      }
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