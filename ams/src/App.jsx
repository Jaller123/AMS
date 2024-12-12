import React, { useState } from "react";
import ReqForm from "./components/ReqForm";
import ResForm from "./components/ResForm";

const App = () => {
  const [response, setResponse] = useState({});

  const handleRequestData = async (data) => {
    try {
      const payload = {
        request: {
          method: data.method,
          url: data.url
        },
        response: {
          status: 200,
          headers: data.headers ? data.headers : {},
          
          body: data.body ? JSON.stringify(data.body) : ""
        }
      };

      const res = await fetch("http://localhost:8088/__admin/mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const responseBody = await res.text();
        console.log(responseBody);
        setResponse({
          status: res.status,
          body: responseBody
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
<<<<<<< HEAD
      <ReqForm onRequestChange={handleRequestData} />
      <ResForm response={response} />
=======
      <ReqForm />
      <ResForm />
      <Button />
>>>>>>> 2ba4369f9db74a24e1d741177a8d298391f7f7d8
    </div>
  );
};

export default App;

