export const getBackendAddress = () => {
  return localStorage.getItem("backendAddress") || "http://localhost:8080";
};