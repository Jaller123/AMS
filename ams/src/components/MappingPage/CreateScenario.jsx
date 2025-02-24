import React, { useState, useEffect } from "react";
import { fetchMappings } from "../../backend/api";

const CreateScenario = () => {
  const [mappings, setMappings] = useState([]);
  const [responses, setResponses] = useState([]);
  const [selectedMapping, setSelectedMapping] = useState(null);

  useEffect(() => {
    const loadMappings = async () => {
      try {
        const data = await fetchMappings();
        console.log("API Response:", data); // Debug-logga API-datan
        setMappings(data.requests);
        setResponses(data.responses); // Spara responses separat
      } catch (error) {
        console.error("Error fetching mappings:", error);
      }
    };

    loadMappings();
  }, []);

  // Filtrera ut rätt response för det valda mapping-id:t
  const relevantResponses = responses.filter(
    (res) => res.reqId === selectedMapping?.id
  );

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div style={{ flex: 1, borderRight: "1px solid #ccc", padding: "20px" }}>
        <h1>Create Scenario</h1>
      </div>

      <div style={{ flex: 1, padding: "20px" }}>
        <h2>Saved Mappings</h2>
        {mappings.length === 0 ? (
          <p>Inga mappningar hittades.</p>
        ) : (
          <ul>
            {mappings.map((mapping) => (
              <li
                key={mapping.id}
                onClick={() => setSelectedMapping(mapping)}
                style={{
                  cursor: "pointer",
                  padding: "10px",
                  border: "1px solid #ddd",
                  marginBottom: "10px",
                  background:
                    selectedMapping?.id === mapping.id ? "#f0f0f0" : "white",
                }}
              >
                <strong>ID:</strong> {mapping.id} - <strong>URL:</strong>{" "}
                {mapping.resJson?.url || "Ingen URL"}
              </li>
            ))}
          </ul>
        )}

        {selectedMapping && (
          <div
            style={{
              marginTop: "20px",
              borderTop: "1px solid #ccc",
              paddingTop: "10px",
            }}
          >
            <h3>Details</h3>
            <p>
              <strong>ID:</strong> {selectedMapping.id}
            </p>
            <h4>Request:</h4>
            <pre style={{ background: "#eee", padding: "10px" }}>
              {JSON.stringify(selectedMapping.request, null, 2)}
            </pre>

            <h4>Responses:</h4>
            {relevantResponses.length > 0 ? (
              relevantResponses.map((res) => (
                <pre
                  key={res.id}
                  style={{
                    background: "#eee",
                    padding: "10px",
                    marginTop: "10px",
                  }}
                >
                  {JSON.stringify(res.resJson, null, 2)}
                </pre>
              ))
            ) : (
              <p>Ingen respons hittades för denna mappning.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateScenario;
