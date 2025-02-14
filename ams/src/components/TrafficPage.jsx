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
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showEndDropdown, setShowEndDropdown] = useState(false);

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

    if (!timestampRaw) return false; // Ignorera poster utan timestamp

    // Konvertera timestamp till millisekunder
    const timestampDate = new Date(timestampRaw);
    const timestampMs = timestampDate.getTime();

    // Funktion för att parsa tid korrekt
    const parseTimeInput = (timeStr) => {
      if (!timeStr || !/^\d{2}:\d{2}:\d{2}(\.\d{1,3})?$/.test(timeStr))
        return null; // Bara acceptera korrekt format
      const [hh, mm, ssMs] = timeStr.split(":");
      const [ss, ms] = (ssMs || "0").split(".");
      const now = new Date();
      now.setHours(Number(hh), Number(mm), Number(ss), Number(ms) || 0);
      return now.getTime();
    };

    const startMs = parseTimeInput(startTime);
    const endMs = parseTimeInput(endTime);

    // Kolla om timestamp ligger inom intervallet
    const isInTimeRange =
      (!startMs || timestampMs >= startMs) &&
      (!endMs || timestampMs <= endMs + 1);

    const matchesSearch =
      method.toLowerCase().includes(filter.toLowerCase()) ||
      url.toLowerCase().includes(filter.toLowerCase());

    if (matchFilter === "matched" && !item.matchedStubId) return false;
    if (matchFilter === "unmatched" && item.matchedStubId) return false;

    return matchesSearch && isInTimeRange;
  });

  const timeOptions = Array.from({ length: 24 * 60 * 60 }, (_, i) => {
    const hours = String(Math.floor(i / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((i % 3600) / 60)).padStart(2, "0");
    const seconds = String(i % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}.000`; // Skapa tider i format HH:mm:ss.SSS
  });

  const getHeaderValue = (headers, headerName) => {
    const key = Object.keys(headers).find(
      (key) => key.toLowerCase() === headerName.toLowerCase()
    );
    return key ? headers[key] : null;
  };

  if (loading)
    return <div className={styles.loading}>Loading traffic data...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.trafficContainer}>
      <h2>WireMock Traffic Overview</h2>
      <div className={styles.filterContainer}>
        <label htmlFor="startTime">Start Time</label>
        <div className={styles.dropdownContainer}>
          <input
            id="startTime"
            type="text"
            placeholder="HH:MM:SS.SSS"
            value={startTime}
            onFocus={() => setShowStartDropdown(true)}
            onBlur={() => setTimeout(() => setShowStartDropdown(false), 200)}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <label>End Time :</label>
        <input
          type="text"
          placeholder="HH:MM:SS.SSS"
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
                  <Link
                    to="/mappings"
                    state={{
                      prefillMapping: {
                        url: item?.request.url,
                        method: item?.request.method,
                        headers: {
                          "Content-Type": getHeaderValue(
                            item?.request?.headers,
                            "Content-Type"
                          ),
                        },
                        body: item?.request.body,
                      },
                    }}
                  >
                    ❌ Unmatched
                  </Link>
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
