import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReqForm from "./components/ReqForm";
import ResForm from "./components/ResForm";
import mappingsRequests from "./mappings_requests.json";
import mappingsResponses from "./mappings_responses.json";
import MappingsPage from "./components/MappingsPage";

const App = () => {
  const [response, setResponse] = useState({});
  const [mappings, setMappings] = useState(() => {
    const savedMappings = localStorage.getItem("mappings");
    return savedMappings ? JSON.parse(savedMappings) : [];
  });

  useEffect(() => {
    localStorage.setItem("mappings", JSON.stringify(mappings));
  }, [mappings]);


  const handleDelete = (url) => {

    // Letar efter request mappningen.
    const requestToDelete = mappingsRequests.find(
      (request) => request.reqJson.url === url
    )

    if (requestToDelete) {
      
      // Tar bort mappningen.
      const updatedRequests = mappingsRequests.filter(
        (request) => request.id !== requestToDelete.id
      )

      // Tar bort Response mappningen.
      const updatedResponses = mappingsResponses.filter(
        (response) => response.reqId !== requestToDelete.id
      )

        // Uppdatera mappings state
      const updatedMappings = mappings.filter(
        (mapping) => mapping.request.url !== url
      )
      setMappings(updatedMappings)

      alert(`Mapping for ${url} has been deleted.`)
    } else {
      alert(`Mapping for ${url} is not found.`)
    }
  }

  const handleRequestData = async (data) => {
    console.log("Payload to send:", data);
    try {
    // Generera en unik ID för nya mappings
    const newRequestId = mappingsRequests.length
    ? mappingsRequests[mappingsRequests.length - 1].id + 1
    : 1;

    const newRequest = {
      id: newRequestId,
      reqJson: data,
    };

    // Skapar en ny Response Objekt
    const newResponse = {
      id: newRequestId,
      reqId: newRequestId,
      resJson: {
        status: 200,
        headers: data.headers, 
        body: data.body,       
      },
    };

    mappingsRequests.push(newRequest);
    mappingsResponses.push(newResponse);

    console.log("New mapping saved to requests.json and responses.json:", newRequest, newResponse);

    // Updatera responsen so det visar i ResForm.
    setResponse(newResponse.resJson);

    // Uppdatera mappings state för MappingsPage.
    setMappings((prevMappings) => [
      ...prevMappings,
      { request: newRequest.reqJson, response: newResponse.resJson },
    ]);
  } catch (error) {
    console.error("Error handling request data:", error);

    // Visar felmeddelanden.
    setResponse({
      status: 500,
      body: "Error sending request: " + error.message,
      requestDetails: {
        method: data.method,
        url: data.url,
        headers: data.headers,
        body: data.body,
      },
    });
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
          element={<MappingsPage mappings={mappings} handleDelete={handleDelete}/>}
        />
      </Routes>
    </Router>
  );
};

export default App;
