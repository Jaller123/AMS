import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchScenarios, deleteScenario } from "../../backend/api";
import styles from "./ScenarioPage.module.css";

const ScenariosPage = () => {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState([]);
  const [expandedScenarios, setExpandedScenarios] = useState({});

  // Hämta sparade scenarier vid sidladdning
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const loadedScenarios = await fetchScenarios();
        setScenarios(loadedScenarios);
      } catch (error) {
        console.error("Error fetching scenarios:", error);
      }
    };

    loadScenarios();
  }, []);

  // Hantera borttagning av scenario
  const handleDeleteScenario = async (scenarioId) => {
    try {
      await deleteScenario(scenarioId);
      setScenarios(scenarios.filter((scenario) => scenario.id !== scenarioId));
    } catch (error) {
      console.error("Error deleting scenario:", error);
    }
  };

  // Expandera/minimera scenarier
  const toggleExpandScenario = (scenarioId) => {
    setExpandedScenarios((prev) => ({
      ...prev,
      [scenarioId]: !prev[scenarioId],
    }));
  };

  return (
    <div className={styles.scenarioPageContainer}>
      <h1>Saved Scenarios</h1>

      {scenarios.length === 0 ? (
        <p>No saved scenarios found.</p>
      ) : (
        <div className={styles.scenarioList}>
          {scenarios.map((scenario, index) => (
            <div
              key={`scenario-${scenario.id}-${scenario.name}-${index}`}
              className={styles.scenarioItem}
            >
              <div
                className={styles.scenarioHeader}
                onClick={() => toggleExpandScenario(scenario.id)}
              >
                <span>
                  <strong>{scenario.name}</strong>
                </span>
                <span className={styles.arrow}>
                  {expandedScenarios[scenario.id] ? "▲" : "▼"}
                </span>
              </div>

              {expandedScenarios[scenario.id] && (
                <div className={styles.scenarioDetails}>
                  <h3>Requests</h3>
                  {scenario.mappings && scenario.mappings.length > 0 ? (
                    scenario.mappings.map((m) => (
                      <pre
                        key={`mapping-${m.id}`}
                        className={styles.preFormatted}
                      >
                        {JSON.stringify(m.request, null, 2)}
                      </pre>
                    ))
                  ) : (
                    <p>No requests found.</p>
                  )}

                  <h3>Responses</h3>
                  {scenario.responses && scenario.responses.length > 0 ? (
                    scenario.responses.map((res) => (
                      <pre
                        key={`response-${res.id}`}
                        className={styles.preFormatted}
                      >
                        {JSON.stringify(res.resJson, null, 2)}
                      </pre>
                    ))
                  ) : (
                    <p>No responses found.</p>
                  )}

                  <button
                    className={`${styles.button} ${styles.deleteButton}`}
                    onClick={() => handleDeleteScenario(scenario.id)}
                  >
                    Delete Scenario
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
