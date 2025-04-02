// TrafficPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./TrafficPage.module.css";
import { fetchWireMockTraffic } from "../backend/api";

const TrafficPage = ({ savedMappings }) => {
  // Add savedMappings here
  const location = useLocation()
  const [trafficData, setTrafficData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [matchFilter, setMatchFilter] = useState("all");
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  console.log("Saved mappings:", savedMappings.map(m => ({ id: m.id, wireMockId: m.wireMockId })));

  useEffect(() => {
    const state = location.state || {};
    setFilter(state.filterTraffic || "");
    setMatchFilter(state.matchOnly ? "matched" : "all");
  }, [location]);
  

  useEffect(() => {
    const loadTraffic = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWireMockTraffic();
        const joinedData = data.trafficData.map((item) => {
          if (item.matchedStubId && savedMappings && savedMappings.length) {   
            const foundMapping = savedMappings.find((mapping) => {
              console.log("Matching:", {
                stubId: item.matchedStubId,
                mappingId: mapping.wireMockId,
                equal: mapping.wireMockId?.trim().toLowerCase() === item.matchedStubId?.trim().toLowerCase()
              });
              
              return (
                mapping.wireMockId &&
                mapping.wireMockId.trim().toLowerCase() ===
                  item.matchedStubId.trim().toLowerCase()
                  
              );
            });  
            console.log(`🧪 Comparing traffic.matchedStubId "${item.matchedStubId}" with mappings:`);
savedMappings.forEach(m => {
  console.log(`→ Mapping ${m.id}: wireMockId=${m.wireMockId}`);
});
          
            const newMappingId = foundMapping ? foundMapping.id : undefined;
            console.log(
              `For traffic item ${item.id}, matchedStubId: "${item.matchedStubId}" -> mappingId: "${newMappingId}"`
            );
            return { ...item, mappingId: newMappingId };
          }
          return item;
        });
        console.log("🚦 Final joined trafficData:", joinedData);
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

    if (matchFilter === "matched" && filter) {
      console.log(item.matchedStubId)
      return (
        item.matchedStubId &&
        item.matchedStubId.trim().toLowerCase() === filter.trim().toLowerCase()
      );
    }
    
    const method = item?.request?.method || "";
    const url = item?.request?.url || "";
    const timestampRaw = item.timestamp;

    if (!timestampRaw) return false; // Ignorera poster utan timestamp

    // Konvertera timestamp till millisekunder
    const timestampDate = new Date(timestampRaw);
    const timestampMs = timestampDate.getTime();

    // Funktion för att parsa tid korrekt
    const parseDateTimeInput = (dateStr, timeStr) => {
      if (!dateStr && !timeStr) return null;

      let dateTimeStr = "";

      if (dateStr) {
        dateTimeStr = dateStr;
      } else {
        dateTimeStr = new Date().toISOString().split("T")[0]; // Använd dagens datum om inget anges
      }

      if (timeStr) {
        dateTimeStr += ` ${timeStr}`;
      } else {
        dateTimeStr += " 00:00:00.000"; // Om ingen tid anges, sätt start på dagen
      }

      return new Date(dateTimeStr.replace(" ", "T")).getTime();
    };

    const startMs = parseDateTimeInput(startDate, startTime);
    const endMs = parseDateTimeInput(endDate, endTime);

    // Filtrera trafiken baserat på användarens val
    const isInTimeRange =
      (!startMs || timestampMs >= startMs) && (!endMs || timestampMs <= endMs);

    const matchesSearch =
      method.toLowerCase().includes(filter.toLowerCase()) ||
      url.toLowerCase().includes(filter.toLowerCase());

    if (matchFilter === "matched" && !item.matchedStubId) return false;
    if (matchFilter === "unmatched" && item.matchedStubId) return false;

    return matchesSearch && isInTimeRange;
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
        <label>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label>Start Time:</label>
        <input
          type="text"
          placeholder="HH:MM:SS.SSS"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <label>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <label>End Time:</label>
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
            <div key={item.id} data-testid="table-row" className={styles.tableRow}>
              <span>{item?.request?.method || "N/A"}</span>
              <span>{item?.request?.url || "N/A"}</span>
              <span>{item?.response?.status || "N/A"}</span>

              <span>
              {item.mappingId ? (
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
