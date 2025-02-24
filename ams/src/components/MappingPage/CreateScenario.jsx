import React, { useEffect, useState } from "react";
import { fetchMappings } from "../../backend/api";

const CreateScenario = () => {
  const [mappings, setMappings] = useState([]);
  const [selectedMapping, setSelectedMapping] = useState(null);

  useEffect(() => {
    const loadMappings = async () => {
      try {
        const { requests } = await fetchMappings();
        setMappings(requests);
      } catch (error) {
        console.error("Error fetching mappings:", error);
        xa;
      }
    };

    loadMappings();
  }, []);

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* Vänster sida: Scenarios */}
      <div style={{ flex: 1, borderRight: "1px solid #ccc", padding: "20px" }}>
        <h1>Create Scenario</h1>
        {/* Här kan du lägga till UI för att skapa scenarion */}
      </div>

      {/* Höger sida: Sparade mappningar */}
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
                {mapping.request.url}
              </li>
            ))}
          </ul>
        )}

        {/* Detaljerad vy av vald mappning */}
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
            <p>
              <strong>URL:</strong> {selectedMapping.request.url}
            </p>
            <p>
              <strong>Title:</strong> {selectedMapping.request.title}
            </p>
            <h4>Request:</h4>
            <pre style={{ background: "#eee", padding: "10px" }}>
              {JSON.stringify(selectedMapping.request, null, 2)}
            </pre>
            <h4>Response:</h4>
            {selectedMapping.response ? (
              <pre style={{ background: "#eee", padding: "10px" }}>
                {JSON.stringify(selectedMapping.response, null, 2)}
              </pre>
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
