import React from "react";
import styles from "./ScenarioPage.module.css";

const ScenarioItem = ({
  scenario,
  expanded,
  toggleScenarioDropdown,
  handleDeleteScenario,
  handleSendScenarioToWireMock,
}) => {
  return (
    <li className={styles.scenarioItem}>
      {/* The header is clickable and toggles the expanded state */}
      <div className={styles.scenarioHeader} onClick={() => toggleScenarioDropdown(scenario.id)}>
        <span className={styles.scenarioTitle}>
          {scenario.name || "Untitled Scenario"}
        </span>
      </div>
      
      {expanded && (
        <div className={styles.scenarioDetails}>
          {scenario.mappings && scenario.mappings.length > 0 ? (
            scenario.mappings.map((mapping, index) => (
              <div key={`mapping-${scenario.id}-${index}`} className={styles.mappingItem}>
                <p className={styles.scenarioMappingTitle}>
                  {mapping.request?.title || "No Title"}
                </p>
                <div className={styles.mappingInfo}>
                  <p>
                    <strong>Method:</strong> {mapping.request?.method || "N/A"}
                  </p>
                  <p>
                    <strong>URL:</strong> {mapping.request?.url || "N/A"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>No mappings found.</p>
          )}
           {handleSendScenarioToWireMock && (
            <button onClick={() => handleSendScenarioToWireMock(scenario)} className={`${styles.button} ${styles.wireMockButton}`}>
              Send to WireMock
            </button>
          )}
          <button onClick={() => handleDeleteScenario(scenario.id)} className={`${styles.button} ${styles.deleteButton}`}>
            Delete Scenario
          </button>
        </div>
      )}
    </li>
  );
};

export default ScenarioItem;
