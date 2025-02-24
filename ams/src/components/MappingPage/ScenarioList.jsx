import React from "react";
import ScenarioItem from "./ScenarioItem";
import styles from "./ScenarioPage.module.css";

const ScenarioList = ({
  scenarios = [], // Sätt default värde till en tom array om scenarios inte finns
  expandedScenarios,
  setExpandedScenarios,
  handleDeleteScenario,
  handleSendScenarioToWireMock,
}) => {
  return (
    <ul className={styles.scenarioList}>
      {scenarios.length > 0 ? ( // Kontrollera om scenarios inte är tomt
        scenarios.map((scenario) => (
          <ScenarioItem
            key={scenario.id}
            scenario={scenario}
            expandedScenarios={expandedScenarios}
            setExpandedScenarios={setExpandedScenarios}
            handleDeleteScenario={handleDeleteScenario}
            handleSendScenarioToWireMock={handleSendScenarioToWireMock}
          />
        ))
      ) : (
        <li>No scenarios available</li> // Om inga scenarier finns, visa ett meddelande
      )}
    </ul>
  );
};

export default ScenarioList;
