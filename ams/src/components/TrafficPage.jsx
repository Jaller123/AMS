import React, { useState, useEffect } from "react";
import styles from "./TrafficPage.module.css";
import { fetchWireMockTraffic } from "../backend/api"; // Import API function

const TrafficPage = () => {
  const [trafficData, setTrafficData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(""); // Filter for search
  const [error, setError] = useState(null);

  const fetchTrafficData = async () => {
    try {
      setLoading(true);

      // Fetch WireMock traffic data
      const wireMockData = await fetchWireMockTraffic();

      // Combine requests & responses into one array for display
      const formattedData = wireMockData.requests.map((req) => {
        const matchingResponse = wireMockData.responses.find((res) => res.reqId === req.id) || {};
        
        return {
          id: req.id, 
          request: req.request || {},
          response: matchingResponse.resJson || {}, 
          status: matchingResponse.status || "N/A", // Fix: Ensure status is displayed
          timestamp: matchingResponse.timestamp || new Date().toISOString(), 
        };
      });

      setTrafficData(formattedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrafficData();
  }, []);

  const filteredData = trafficData.filter((item) => {
    const method = item.request.method || "";
    const url = item.request.url || "";
    return (
      method.toLowerCase().includes(filter.toLowerCase()) ||
      url.toLowerCase().includes(filter.toLowerCase())
    );
  });

  if (loading)
    return <div className={styles.loading}>Loading traffic data...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.trafficContainer}>
      <h2>WireMock Traffic Overview</h2>
      <input
        type="text"
        placeholder="Filter by URL or Method"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className={styles.filterInput}
      />
      <div className={styles.trafficTable}>
        <div className={styles.tableHeader}>
          <span>Method</span>
          <span>URL</span>
          <span>Status</span> {/* Fix: Display Status Column */}
          <span>Timestamp</span>
        </div>
        {filteredData.map((item) => (
          <div key={item.id} className={styles.tableRow}>
            <span>{item.request.method || "N/A"}</span>
            <span>{item.request.url || "N/A"}</span>
            <span>{item.status || "N/A"}</span> {/* Fix: Show Correct Status */}
            <span>{new Date(item.timestamp).toLocaleString() || "N/A"}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrafficPage;
