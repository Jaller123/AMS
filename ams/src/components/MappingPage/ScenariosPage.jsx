import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ScenarioPage.module.css"; // Vi använder den specifika CSS-modulen

import ScenarioList from "./ScenarioList";

const ScenariosPage = ({ scenarios, handleDeleteScenario }) => {
  const navigate = useNavigate();
  const [expandedScenarios, setExpandedScenarios] = useState({});

  return (
    <div className={styles.scenarioPageContainer}>
      <section className={styles.savedScenariosContainer}>
        <h2>Saved Scenarios</h2>

        {/* Skickar prop till ScenarioList-komponenten */}
        <ScenarioList
          scenarios={scenarios}
          expandedScenarios={expandedScenarios}
          setExpandedScenarios={setExpandedScenarios}
          handleDeleteScenario={handleDeleteScenario}
        />
      </section>

      {/* Knappen för att skapa ett nytt scenario */}
      <div className={styles.createScenarioContainer}>
        <button
          onClick={() => navigate("/create-scenario")}
          className={styles.createScenarioButton}
        >
          ➕ Add new Scenario
        </button>
      </div>
    </div>
  );
};

export default ScenariosPage;
