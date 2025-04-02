import React from "react";
import styles from "./ScenarioPage.module.css";
import { useNavigate } from "react-router-dom";

const ScenarioItem = ({
  scenario,
  mappings = [],
  expanded,
  toggleScenarioDropdown,
  handleDeleteScenario,
  handleSendScenario,
}) => {
  const navigate = useNavigate();

  return (
    <li className={styles.scenarioItem}>
      <div
        className={styles.scenarioHeader}
        onClick={() => toggleScenarioDropdown(scenario.id)}
      >
        <span className={styles.scenarioTitle}>
          {scenario.name || "Untitled Scenario"}
        </span>
      </div>

      {expanded && (
        <div className={styles.scenarioDetails}>
          {scenario.mappings && scenario.mappings.length > 0 ? (
            scenario.mappings.map((mapping, index) => {
              console.log("Scenario Data:", scenario);
              console.log("Mappings:", scenario.mappings);
              // 👈 Lägg till detta för att debugga
              const request = mapping.request || {}; // Använd direkt, ingen reqJson

              return (
                <div
                  key={`mapping-${scenario.id}-${index}`}
                  className={styles.mappingItem}
                >
                  <p className={styles.scenarioMappingTitle}>
                    {request.title || "No Title"}
                  </p>
                  <div className={styles.mappingInfo}>
                    <p>
                      <strong>Method:</strong> {request.method || "N/A"}
                    </p>
                    <p>
                      <strong>URL:</strong> {request.url || "N/A"}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No mappings found.</p>
          )}

          <button
            onClick={() => navigate(`/edit-scenario/${scenario.id}`)}
            className={`${styles.button} ${styles.wireMockButton}`}
          >
            Edit Scenario
          </button>
          {handleSendScenario && (
            <button
              onClick={() => handleSendScenario(scenario.id)}
              className={`${styles.button} ${styles.wireMockButton}`}
            >
              Send to WireMock
            </button>
          )}
          <button
            onClick={() => handleDeleteScenario(scenario.id)}
            className={`${styles.button} ${styles.deleteButton}`}
          >
            Delete Scenario
          </button>
        </div>
      )}
    </li>
  );
};

export default ScenarioItem;
