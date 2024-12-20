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
    if (requestData) {
      try {
        if (requestData.method === "DELETE") {
         
          if (!requestData.id) {
            alert("Please enter an ID to delete.");
            return;
          }
          await handleDeleteMapping(requestData.id); 
        } else if (requestData.method === "PUT") {
          const updatedMapping = await saveMapping({
            id: requestData.id,
            request: requestData,
            response: responseData,
          });
          setMappings((prevMappings) =>
            prevMappings.map((mapping) =>
              mapping.id === updatedMapping.id ? updatedMapping : mapping
            )
          );
        } else {
          const newMapping = await saveMapping({
            request: requestData,
            response: responseData,
          });
          setMappings((prevMappings) => [...prevMappings, newMapping]);
        }
        setRequestData(null);
        setResponseData(null);
      } catch (error) {
        alert("Failed to save mapping. Please try again.");
      }
    } else {
      alert("Request data is required.");
    }
  };
  

  const handleDeleteMapping = async (id) => {
    if (!id) {
      console.error("Invalid ID for deletion:", id);
      alert("Failed to delete mapping. Invalid ID.");
      return;
    }

    try {
      console.log(`Deleting mapping with ID: ${id}`);
      const success = await deleteMapping(id);
      if (success) {
        setMappings((prevMappings) =>
          prevMappings.filter((mapping) => mapping?.id !== id)
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
            <div>
              <ReqForm setRequestData={setRequestData} />
              <ResForm setResponseData={setResponseData} />
              <Button onClick={handleSaveMapping}>Save Mapping</Button>
            </div>
          }
        />
        <Route
          path="/mappings"
          element={
            <MappingsPage
              mappings={mappings}
              handleDelete={handleDeleteMapping}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
