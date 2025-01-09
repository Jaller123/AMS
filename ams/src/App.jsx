import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReqForm from "./components/ReqForm";
import ResForm from "./components/ResForm";
import MappingsPage from "./components/MappingsPage";
import Button from "./components/Button";
import { fetchMappings, saveMapping, deleteMapping } from "./backend/api.js";

const App = () => {
  const [mappings, setMappings] = useState([]);
  const [responses, setResponses] = useState([]);
  const [requestData, setRequestData] = useState(null);
  const [responseData, setResponseData] = useState(null);

  // Fetch existing mappings and responses from the backend
  useEffect(() => {
    const loadMappingsAndResponses = async () => {
      const data = await fetchMappings();
      setMappings(data.requests || []); // Ensure it's always an array
      setResponses(data.responses || []); // Ensure it's always an array
    };
    loadMappingsAndResponses();
  }, []);
  

  const handleSaveMapping = async () => {
    if (requestData && responseData) {
      try {
        const newMapping = await saveMapping({
          request: requestData,
          response: responseData,
        });
  
        const { id, request, response } = newMapping;
  
        setMappings((prevMappings) => {
          // Check if the mapping already exists by `id`
          const exists = prevMappings.some((mapping) => mapping.id === id);
          if (exists) return prevMappings;
          return [...prevMappings, { id, request }];
        });
  
        setResponses((prevResponses) => [
          ...prevResponses,
          { id: `${id}.${prevResponses.filter((r) => r.reqId === id).length + 1}`, reqId: id, resJson: response },
        ]);
  
        setRequestData(null);
        setResponseData(null);
        alert("Mapping saved successfully");
      } catch (error) {
        console.error("Error saving mapping:", error);
        alert("Failed to save mapping. Please try again.");
      }
    } else {
      alert("Both request and response data are required.");
    }
  };
  
  

  const handleDeleteMapping = async (id) => {
    try {
      const success = await deleteMapping(id);
      if (success) {
        setMappings((prevMappings) =>
          prevMappings.filter((mapping) => mapping.id !== id)
        );
        alert("Mapping deleted successfully!");
      }
    } catch (error) {
      alert("Failed to delete mapping. Please try again.");
    }
  };
  
  
  

  
  
  

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <MappingsPage
              mappings={mappings}
              responses={responses}
              handleDelete={handleDeleteMapping}
            />
          }
        />
        <Route
          path="/mappings"
          element={
            <div>
              <ReqForm setRequestData={setRequestData} />
              <ResForm setResponseData={setResponseData} />
              <Button onClick={handleSaveMapping}>Save Mapping</Button>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
