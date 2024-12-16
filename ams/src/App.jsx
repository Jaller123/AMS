import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReqForm from "./components/ReqForm";
import ResForm from "./components/ResForm";
import MappingsPage from "./components/MappingsPage";

const App = () => {
  const [response, setResponse] = useState({});
  const [mappings, setMappings] = useState([]); // Sparade mappningar

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
          headers: data.headers ? data.headers : {},
          body: data.body ? JSON.stringify(data.body) : "",
        },
      };

      console.log("Payload for WireMock:", payload);

      const res = await fetch("http://localhost:8088/__admin/mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const responseBody = await res.text();
        console.log("Response Body:", responseBody);
        setResponse({
          status: res.status,
          body: responseBody,
        });

        // Spara mappningen i state
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
        {/* Defaultvy med formulär och respons */}
        <Route
          path="/"
          element={
            <div>
              <ReqForm onRequestChange={handleRequestData} />
              <ResForm response={response} />
            </div>
          }
        />
        {/* Vy för sparade mappningar */}
        <Route
          path="/mappings"
          element={<MappingsPage mappings={mappings} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
