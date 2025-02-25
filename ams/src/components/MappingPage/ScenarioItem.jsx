import React from "react";
import styles from "./ScenarioPage.module.css";

const ScenarioItem = ({
  scenario,
  expandedScenarios,
  setExpandedScenarios,
  handleDeleteScenario,
  handleSendScenarioToWireMock,
}) => {
  const handleDelete = () => {
    handleDeleteScenario(scenario.id);
  };

  return (
    <li className={styles.scenarioItem}>
      <div>
        <strong>{scenario.name}</strong>
        {/* Om du vill ha en expanderbar vy */}
        <button
          onClick={() =>
            setExpandedScenarios((prev) => ({
              ...prev,
              [scenario.id]: !prev[scenario.id],
            }))
          }
        >
          {expandedScenarios[scenario.id] ? "Collapse" : "Expand"}
        </button>
      </div>

      {expandedScenarios[scenario.id] && (
        <div>
          <p>{scenario.description}</p>
          {/* Lägg till mer detaljer här om du vill */}
        </div>
      )}

      <div>
        <button onClick={handleDelete}>Delete</button>
        {handleSendScenarioToWireMock && (
          <button onClick={() => handleSendScenarioToWireMock(scenario)}>
            Send to WireMock
          </button>
        )}
      </div>
    </li>
  );
};

// Se till att exportera som default
export default ScenarioItem;
