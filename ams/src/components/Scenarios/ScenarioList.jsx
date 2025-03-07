import React from "react";
import ScenarioItem from "./ScenarioItem";
import styles from "./ScenarioPage.module.css";

const ScenarioList = ({
  scenarios = [],
  expandedScenarioId,
  toggleScenarioDropdown,
  handleDeleteScenario,
  handleSendScenarioToWireMock,
}) => {
  return (
    <ul className={styles.scenarioList}>
      {scenarios.length > 0 ? (
        scenarios.map((scenario) => (
          <ScenarioItem
            key={scenario.id}
            scenario={scenario}
            expanded={expandedScenarioId === scenario.id}
            toggleScenarioDropdown={toggleScenarioDropdown}
            handleDeleteScenario={handleDeleteScenario}
            handleSendScenario={handleSendScenarioToWireMock}
          />
        ))
      ) : (
        <li>No scenarios available</li>
      )}
    </ul>
  );
};

export default ScenarioList;
