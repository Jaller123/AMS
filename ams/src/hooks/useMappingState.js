// src/hooks/useMappingState.js
import { useState, useEffect } from "react";

const useMappingState = () => {
  const [requestData, setRequestData] = useState(null);
  const [responseData, setResponseData] = useState(null);

  useEffect(() => {
    if (requestData && responseData) {
      console.log("Mapping ready:", { requestData, responseData });
    }
  }, [requestData, responseData]);

  return {
    requestData,
    responseData,
    setRequestData,
    setResponseData,
  };
};

export default useMappingState;
