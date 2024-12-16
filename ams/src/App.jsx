import React, { useState } from "react";
import ReqForm from "./components/ReqForm";
import Button from "./components/Button";
import ResForm from "./components/ResForm";
import Navbar from "./components/Navbar";

const App = () => {
  const [response, setResponse] = useState({});

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

      console.log("Fetch response:", res);

      if (res.ok) {
        const responseBody = await res.text();
        console.log("Response Body:", responseBody);
        console.log(responseBody);
        setResponse({
          status: res.status,
          body: responseBody,
        });
      } else {
        console.error("WireMock responded with error status:", res.status);
        const errorBody = await res.text();
        console.error("Error details:", errorBody);
      }
    } catch (error) {
      console.error("Request failed!", error);
    }
  };

  return (
    <div>
      <Navbar />
      <Button />
      <ReqForm onRequestChange={handleRequestData} />
      <ResForm response={response} />
    </div>
  );
};

export default App;
