// TrafficPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./TrafficPage.module.css";
import { fetchWireMockTraffic } from "../backend/api";

const TrafficPage = ({ savedMappings }) => {
  // Add savedMappings here
  const [trafficData, setTrafficData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [matchFilter, setMatchFilter] = useState("all");
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(""); // Start time input
  const [endTime, setEndTime] = useState(""); // End time input

  useEffect(() => {
    const loadTraffic = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWireMockTraffic();
        const joinedData = data.trafficData.map((item) => {
          if (item.matchedStubId && savedMappings && savedMappings.length) {
            const foundMapping = savedMappings.find((mapping) => {
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
  }, [savedMappings]); // add savedMappings to the dependency array

  const filteredData = trafficData.filter((item) => {
    const method = item?.request?.method || "";
    const url = item?.request?.url || "";
    const timestampRaw = item.timestamp;

    if (!timestampRaw) return false; // Ignore items without a timestamp

    // Convert timestamp to Date object
    const timestampDate = new Date(timestampRaw);
    const timestampHours = timestampDate.getHours().toString().padStart(2, "0");
    const timestampMinutes = timestampDate
      .getMinutes()
      .toString()
      .padStart(2, "0");
    const timestampFormatted = `${timestampHours}:${timestampMinutes}`;

    // Convert filter times to comparable formats
    const isInTimeRange =
      (!startTime || timestampFormatted >= startTime) &&
      (!endTime || timestampFormatted <= endTime);

    const matchesSearch =
      method.toLowerCase().includes(filter.toLowerCase()) ||
      url.toLowerCase().includes(filter.toLowerCase());

    if (matchFilter === "matched" && !item.matchedStubId) return false;
    if (matchFilter === "unmatched" && item.matchedStubId) return false;
    return matchesSearch, isInTimeRange;
  });

  if (loading)
    return <div className={styles.loading}>Loading traffic data...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.trafficContainer}>
      <h2>WireMock Traffic Overview</h2>
      <div className={styles.filterContainer}>
        <label>Start Time:</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <label>End Time:</label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      <input
        type="text"
        placeholder="Filter by URL or Method"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className={styles.filterInput}
      />

      <div className={styles.trafficTable}>
        <select
          value={matchFilter}
          onChange={(e) => setMatchFilter(e.target.value)}
          className={styles.filterDropdown}
        >
          <option value="all">Show All</option>
          <option value="matched">Matched</option>
          <option value="unmatched">Unmatched</option>
        </select>
      </div>

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
                {item?.matchedStubId && item.mappingId ? (
                  <Link
                    to="/"
                    state={{ expandMappingId: item.mappingId }}
                    onClick={() =>
                      console.log("Navigating with mappingId:", item.mappingId)
                    }
                  >
                    ✅ Matched
                  </Link>
                ) : (
                  <Link to="/mappings">❌ Unmatched</Link>
                )}
              </span>
              <span>
                {item.timestamp
                  ? `${new Date(item.timestamp).toLocaleString()}.${new Date(
                      item.timestamp
                    ).getMilliseconds()}`
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
