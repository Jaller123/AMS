import React, { useState, useEffect } from "react";
import { fetchMappings } from "../../backend/api";
import styles from "./CreateScenario.module.css";

const CreateScenario = () => {
  const [mappings, setMappings] = useState([]);
  const [responses, setResponses] = useState([]);
  const [openMappingId, setOpenMappingId] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [openScenarioId, setOpenScenarioId] = useState(null);

  useEffect(() => {
    const loadMappings = async () => {
      try {
        const data = await fetchMappings();
        console.log("API Response:", data);
        setMappings(data.requests);
        setResponses(data.responses);
      } catch (error) {
        console.error("Error fetching mappings:", error);
      }
    };

    loadMappings();
  }, []);

  const toggleDropdown = (mappingId) => {
    setOpenMappingId(openMappingId === mappingId ? null : mappingId);
  };

  const toggleScenarioDropdown = (scenarioId) => {
    setOpenScenarioId(openScenarioId === scenarioId ? null : scenarioId);
  };

  // Lägg till en mapping som ett nytt scenario
  const useMappingForScenario = (mapping) => {
    const relevantResponses = responses.filter(
      (res) => res.reqId === mapping.id
    );
    const newScenario = {
      id: scenarios.length + 1,
      mapping,
      responses: relevantResponses,
    };
    setScenarios([...scenarios, newScenario]);
  };

  // Ta bort ett scenario
  const deleteScenario = (scenarioId) => {
    const updatedScenarios = scenarios
      .filter((scenario) => scenario.id !== scenarioId) // Ta bort det valda scenariot
      .map((scenario, index) => ({ ...scenario, id: index + 1 })); // Uppdatera numreringen
    setScenarios(updatedScenarios);
  };

  return (
    <div className={styles.container}>
      {/* Vänster sida - Scenarios */}
      <div className={styles.leftPanel}>
        <h1>Create Scenario</h1>
        {scenarios.length === 0 ? (
          <p>No scenarios created yet.</p>
        ) : (
          <div className={styles.scenarioList}>
            {scenarios.map((scenario) => (
              <div key={scenario.id} className={styles.scenarioItem}>
                <div
                  className={styles.scenarioHeader}
                  onClick={() => toggleScenarioDropdown(scenario.id)}
                >
                  <span>Scenario {scenario.id}</span>
                  <span className={styles.arrow}>
                    {openScenarioId === scenario.id ? "▲" : "▼"}
                  </span>
                </div>

                {openScenarioId === scenario.id && (
                  <div className={styles.scenarioDetails}>
                    <h3>Request</h3>
                    <pre className={styles.preFormatted}>
                      {JSON.stringify(scenario.mapping.request, null, 2)}
                    </pre>

                    <h3>Responses</h3>
                    {scenario.responses.length > 0 ? (
                      scenario.responses.map((res) => (
                        <pre key={res.id} className={styles.preFormatted}>
                          {JSON.stringify(res.resJson, null, 2)}
                        </pre>
                      ))
                    ) : (
                      <p>No response found for this scenario.</p>
                    )}

                    <button
                      className={`${styles.button} ${styles.deleteButton}`}
                      onClick={() => deleteScenario(scenario.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Höger sida - Sparade Mappningar */}
      <div className={styles.rightPanel}>
        <h2>Saved Mappings</h2>
        {mappings.length === 0 ? (
          <p>No Mappings Found.</p>
        ) : (
          <div className={styles.mappingList}>
            {mappings.map((mapping) => {
              const relevantResponses = responses.filter(
                (res) => res.reqId === mapping.id
              );

              return (
                <div key={mapping.id} className={styles.mappingItem}>
                  <div
                    className={styles.mappingHeader}
                    onClick={() => toggleDropdown(mapping.id)}
                  >
                    <span>
                      <strong>{mapping.request?.method || "METHOD"}</strong> |{" "}
                      {mapping.request?.url || "No URL"} |{" "}
                      {mapping.request?.title || "No Title"}
                    </span>
                    <span className={styles.arrow}>
                      {openMappingId === mapping.id ? "▲" : "▼"}
                    </span>
                  </div>

                  {openMappingId === mapping.id && (
                    <div className={styles.mappingDetails}>
                      <h3>Request</h3>
                      <pre className={styles.preFormatted}>
                        {JSON.stringify(mapping.request, null, 2)}
                      </pre>

                      <h3>Responses</h3>
                      {relevantResponses.length > 0 ? (
                        relevantResponses.map((res) => (
                          <pre key={res.id} className={styles.preFormatted}>
                            {JSON.stringify(res.resJson, null, 2)}
                          </pre>
                        ))
                      ) : (
                        <p>No response found for this mapping.</p>
                      )}

                      <button
                        className={`${styles.button} ${styles.useButton}`}
                        onClick={() => useMappingForScenario(mapping)}
                      >
                        Use This Mapping
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateScenario;
