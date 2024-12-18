// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReqForm from "./components/ReqForm";
import ResForm from "./components/ResForm";
import MappingsPage from "./components/MappingsPage";
import Button from "./components/Button";
import useMappingState from "./hooks/useMappingState";

const App = () => {
  const { requestData, responseData, setRequestData, setResponseData } =
    useMappingState();
  const [mappings, setMappings] = useState([]);

  const handleSaveMapping = () => {
    if (requestData && responseData) {
      const newMapping = { request: requestData, response: responseData };
      setMappings((prevMappings) => [...prevMappings, newMapping]);
      setRequestData(null); // Reset request data after save
      setResponseData(null); // Reset response data after save
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
