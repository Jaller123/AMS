import React from "react";
import ScenarioItem from "./ScenarioItem";
import styles from "./ScenarioPage.module.css";

const ScenarioList = ({
  scenarios = [],
  expandedScenarioId,
  toggleScenarioDropdown,
  handleDeleteScenario,
  handleSendScenarioToWireMock,
  mappings,
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
            mappings={mappings}
          />
        ))
      ) : (
        <li>No scenarios available</li>
      )}
    </ul>
  );
};

export default ScenarioList;
