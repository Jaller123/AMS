import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, toast, Bounce } from 'react-toastify';

import Navbar from "./components/Navbar";
import ReqForm from "./components/ReqForm";
import ResForm from "./components/ResForm";
import MappingsPage from "./components/MappingPage/MappingPage.jsx";
import MappingDetailPage from "./components/MappingDetailPage";
import TrafficPage from "./components/TrafficPage";

import ReqDetailPage from "./components/ReqDetailPage";
import Button from "./components/Button";
import {
  fetchMappings,
  saveMapping,
  deleteMapping,
  saveResponse,
} from "./backend/api.js";

const App = () => {
  const [mappings, setMappings] = useState([]);
  const [responses, setResponses] = useState([]);
  const [requestData, setRequestData] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [resetForm, setResetForm] = useState(false);

  useEffect(() => {
    const loadMappingsAndResponses = async () => {
      try {
        const data = await fetchMappings();
        setMappings(data.requests || []); // Make sure 'requests' exists in your data
        setResponses(data.responses || []); // Ensure 'responses' exists
      } catch (error) {
        console.error("Failed to load mappings and responses:", error);
        alert("Failed to load data from the server. Please check the console.");
      }
    };

    loadMappingsAndResponses();
  }, []);

  const handleSaveResponse = async (reqId, newResponse) => {
    const responseToSave = {
      reqId,
      resJson: newResponse,
      timestamp: new Date().toISOString(),
    };

    try {
      const savedResponse = await saveResponse(responseToSave);
      setResponses((prevResponses) => [...prevResponses, savedResponse]);
      alert("Response saved successfully!");
    } catch (error) {
      console.error("Failed to save response:", error);
      alert("Failed to save response. Please try again.");
    }
  };

  const handleSaveMapping = async () => {
    if (requestData && responseData) {
      try {
        // ✅ Call `saveMapping`
        const newMapping = await saveMapping({
          request: requestData,
          response: responseData,
        });
  
        const { id, request, response, wireMockUuid } = newMapping;
  
        // ✅ Update UI instantly
        setMappings((prevMappings) => [
          ...prevMappings,
          {
            id,
            request,
            wireMockUuid,
            isActive: true, // ✅ Show as active immediately
          },
        ]);
  
        setResponses((prevResponses) => [
          ...prevResponses,
          {
            id: `${id}.${prevResponses.filter((r) => r.reqId === id).length + 1}`,
            reqId: id,
            resJson: response,
          },
        ]);
  
        // ✅ **Clear input fields**
        setRequestData(null);
        setResponseData(null);
        setResetForm(true); // ✅ Reset form state
        setTimeout(() => setResetForm(false), 0); // ✅ Ensure UI updates
  
        // ✅ Fetch mappings after a short delay
        setTimeout(async () => {
          const updatedData = await fetchMappings();
          setMappings(updatedData.requests);
        }, 500);
  
        toast.success("Mapping saved successfully!");
      } catch (error) {
        console.error("Error saving mapping:", error);
        toast.error("Failed to save mapping. Please try again.");
      }
    } else {
      toast.warn("Both request and response data are required.");
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

  const handleUpdateMapping = (id, updatedRequest, updatedResponse) => {
    setMappings((prevMappings) =>
      prevMappings.map((mapping) =>
        mapping.id === id ? { ...mapping, request: updatedRequest } : mapping
      )
    );
    setResponses((prevResponses) =>
      prevResponses.map((response) =>
        response.reqId === id
          ? { ...response, resJson: updatedResponse }
          : response
      )
    );
  };

  const handleUpdateRequest = async (requestId, updatedRequest) => {
    try {
      const response = await fetch(
        `http://localhost:8080/requests/${requestId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resJson: updatedRequest }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update request.");
      }

      const { updatedRequest: updatedRequestFromServer } =
        await response.json();

      setMappings((prevMappings) =>
        prevMappings.map((mapping) =>
          mapping.id === requestId
            ? { ...mapping, request: updatedRequestFromServer.resJson }
            : mapping
        )
      );
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Failed to update request. Please try again.");
    }
  };

  const handleUpdateResponse = async (responseId, updatedResponse) => {
    try {
      const res = await fetch(`http://localhost:8080/responses/${responseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resJson: updatedResponse }),
      });

      if (!res.ok) {
        throw new Error("Failed to update response.");
      }

      const { updatedResponse: updatedResponseFromServer } = await res.json();

      setResponses((prevResponses) =>
        prevResponses.map((response) =>
          response.id === responseId ? updatedResponseFromServer : response
        )
      );
    } catch (error) {
      console.error("Error updating response:", error);
      alert("Failed to update response. Please try again.");
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
              handleUpdateRequest={handleUpdateRequest}
              handleUpdateResponse={handleUpdateResponse}
            />
          }
        />
        <Route
          path="/mappings"
          element={
            <div>
              <ReqForm setRequestData={setRequestData} resetForm={resetForm} />
              <ResForm
                setResponseData={setResponseData}
                resetForm={resetForm}
              />
              <Button onClick={handleSaveMapping}>Save Mapping</Button>
              <ToastContainer />
            </div>
          }
        />
        <Route
          path="/mapping/:mappingId"
          element={
            <MappingDetailPage
              mappings={mappings}
              responses={responses}
              handleUpdate={handleUpdateMapping}
              handleDelete={handleDeleteMapping}
            />
          }
        />
        <Route
          path="/request/:mappingId"
          element={
            <ReqDetailPage
              mappings={mappings}
              handleSaveResponse={handleSaveResponse}
            />
          }
        />
        <Route path="/traffic" element={<TrafficPage savedMappings={mappings} />} />
      </Routes>
    </Router>
  );
};

export default App;