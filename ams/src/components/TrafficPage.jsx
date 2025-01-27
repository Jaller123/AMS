import React, { useState, useEffect } from "react";
import styles from "./TrafficPage.module.css";

const TrafficPage = () => {
  const [trafficData, setTrafficData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(""); // Filter for search
  const [error, setError] = useState(null);

  const fetchTrafficData = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/mappings"); // Your API endpoint
      if (!response.ok) throw new Error("Failed to fetch traffic data");

      const data = await response.json();

      const combinedData = data.responses.map((res) => {
        const request = data.requests.find((req) => req.id === res.reqId);
        return {
          id: res.id,
          request: request?.resJson || {},
          response: res.resJson || {},
          timestamp: res.timestamp,
        };
      });

      setTrafficData(combinedData);
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
      <h2>Traffic Overview</h2>
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
          <span>Status</span>
          <span>Timestamp</span>
        </div>
        {filteredData.map((item) => (
          <div key={item.id} className={styles.tableRow}>
            <span>{item.request.method || "N/A"}</span>
            <span>{item.request.url || "N/A"}</span>
            <span>{item.response.status || "N/A"}</span>
            <span>{item.timestamp || "N/A"}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrafficPage;
