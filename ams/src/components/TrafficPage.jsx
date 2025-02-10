// TrafficPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./TrafficPage.module.css";
import { fetchWireMockTraffic } from "../backend/api";

const TrafficPage = ({ savedMappings }) => {
  const [trafficData, setTrafficData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [matchFilter, setMatchFilter] = useState("all");
  const [error, setError] = useState(null);

  // Fetch the traffic data and join with savedMappings
  useEffect(() => {
    const loadTraffic = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWireMockTraffic();
        // For each traffic item, if it has a matchedStubId, find the corresponding mapping
        const joinedData = data.trafficData.map((item) => {
          if (item.matchedStubId && savedMappings && savedMappings.length) {
            // Compare using either mapping.uuid or mapping.wireMockUuid
            const foundMapping = savedMappings.find((mapping) => {
              // Use the property that holds the WireMock UUID
              const mappingUuid = mapping.uuid || mapping.wireMockUuid;
              return (
                mappingUuid &&
                mappingUuid.trim().toLowerCase() ===
                  item.matchedStubId.trim().toLowerCase()
              );
            });
            const newMappingId = foundMapping ? foundMapping.id : undefined;
            console.log(
              `For traffic item ${item.id}, matchedStubId: "${item.matchedStubId}" -> mappingId: "${newMappingId}"`
            );
            return { ...item, mappingId: newMappingId };
          }
          return item;
        });
        setTrafficData(joinedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadTraffic();
  }, [savedMappings]);

  const filteredData = trafficData.filter((item) => {
    console.log(`Rendering traffic item ${item.id}: mappingId=${item.mappingId}`);
    const method = item?.request?.method || "";
    const url = item?.request?.url || "";
    const matchesSearch =
      method.toLowerCase().includes(filter.toLowerCase()) ||
      url.toLowerCase().includes(filter.toLowerCase());

    // Apply match filter
    if (matchFilter === "matched" && !item.matchedStubId) return false;
    if (matchFilter === "unmatched" && item.matchedStubId) return false;

    return matchesSearch;
  });

  if (loading)
    return <div className={styles.loading}>Loading traffic data...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (error)
    return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.trafficContainer}>
      <h2>WireMock Traffic Overview</h2>

      {/* Search filter */}
      <input
        type="text"
        placeholder="Filter by URL or Method"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className={styles.filterInput}
      />

      {/* Match Filter Dropdown */}
      <select
        value={matchFilter}
        onChange={(e) => setMatchFilter(e.target.value)}
        className={styles.filterDropdown}
      >
        <option value="all">Show All</option>
        <option value="matched">Matched</option>
        <option value="unmatched">Unmatched</option>
      </select>

      <div className={styles.trafficTable}>
        <div className={styles.tableHeader}>
          <span>Method</span>
          <span>URL</span>
          <span>Status</span>
          <span>Matched</span>
          <span>Timestamp</span>
        </div>
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div key={item.id} className={styles.tableRow}>
              <span>{item?.request?.method || "N/A"}</span>
              <span>{item?.request?.url || "N/A"}</span>
              <span>{item?.response?.status || "N/A"}</span>
              <span>
                {item?.matchedStubId ? (
                  "✅ Matched"
                ) : (
                  <Link to="/mappings">❌ Unmatched</Link>
                )}
              </span>
              <span>
                {item.timestamp
                  ? new Date(item.timestamp).toLocaleString()
                  : "N/A"}
              </span>
            </div>
          ))
        ) : (
          <div className={styles.noData}>No traffic data available.</div>
        )}
      </div>
    </div>
  );
};

export default TrafficPage;
