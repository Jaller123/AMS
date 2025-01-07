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
  const [requestData, setRequestData] = useState(null);
  const [responseData, setResponseData] = useState(null);

  useEffect(() => {
    const loadMappings = async () => {
      const data = await fetchMappings();
      setMappings(data);
    };
    loadMappings();
  }, []);

  const handleSaveMapping = async () => {
    if (requestData && responseData) {
      try {
        const newMapping = await saveMapping({
          request: requestData,
          response: responseData,
        });
        setMappings((prevMappings) => [
          ...prevMappings,
          { id: newMapping.id, ...newMapping },
        ]);
        setRequestData(null);
        setResponseData(null);
        alert("Mapping saved successfully");
      } catch (error) {
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
