import React, { createContext, useContext, useState, useEffect } from "react";

const BackendContext = createContext();

export const BackendProvider = ({ children }) => {
  const [backendAddress, setBackendAddress] = useState("http://localhost:8080");

  useEffect(() => {
    const stored = localStorage.getItem("backendAddress");
    if (stored) setBackendAddress(stored);
  }, []);

  const updateBackendAddress = (newAddress) => {
    setBackendAddress(newAddress);
    localStorage.setItem("backendAddress", newAddress);
  };
  

  return (
    <BackendContext.Provider value={{ backendAddress, updateBackendAddress }}>
      {children}
    </BackendContext.Provider>
  );
};

export const useBackend = () => useContext(BackendContext);
