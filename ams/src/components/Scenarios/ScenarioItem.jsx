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
  
  const getMappingDetails = (reqId) =>
    mappings.find(mapping => mapping.id === reqId) || {};

  const navigate = useNavigate()

  console.log(mappings)
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
              const fullMapping = getMappingDetails(mapping.request.reqId);
              return (
                <div
                  key={`mapping-${scenario.id}-${index}`}
                  className={styles.mappingItem}
                >
                  <p className={styles.scenarioMappingTitle}>
                    {fullMapping.request?.title || "No Title"}
                  </p>
                  <div className={styles.mappingInfo}>
                    <p>
                      <strong>Method:</strong>{" "}
                      {fullMapping.request?.method || "N/A"}
                    </p>
                    <p>
                      <strong>URL:</strong>{" "}
                      {fullMapping.request?.url || fullMapping.request?.urlPath || "N/A"}
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
          className={`${styles.button} ${styles.wireMockButton}`}>
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
