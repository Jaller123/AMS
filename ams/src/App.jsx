import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReqForm from "./components/ReqForm";
import ResForm from "./components/ResForm";

import MappingsPage from "./components/MappingsPage";

const App = () => {
  const [response, setResponse] = useState({});
  const [mappings, setMappings] = useState([]);

  const handleRequestData = async (data) => {
    console.log("Payload to send:", data);
    try {
      const payload = {
        request: {
          method: data.method,
          url: data.url,
        },
        response: {
          status: 200,
          headers: data.headers ? data.headers : {}, // Kontrollera headers här
          body: data.body ? JSON.stringify(data.body) : "",
        },
      };

      console.log("Payload for WireMock:", payload);

      // Simulera en fetch eller anropa en server (kan anpassas)
      const res = await fetch("http://localhost:8088/__admin/mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const responseBody = await res.text();
        console.log("Response Body:", responseBody);

        // Uppdatera response med headers
        setResponse({
          status: res.status,
          headers: payload.response.headers, // Lägg till headers
          body: responseBody,
        });

        // Lägg till mappningen i listan
        setMappings((prevMappings) => [...prevMappings, payload]);
      } else {
        console.error("WireMock responded with error status:", res.status);
      }
    } catch (error) {
      console.error("Request failed!", error);
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
          element={<MappingsPage mappings={mappings} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
