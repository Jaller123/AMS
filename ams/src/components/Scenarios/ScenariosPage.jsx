import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchScenarios, deleteScenario } from "../../backend/api";
import styles from "./ScenarioPage.module.css";

const ScenariosPage = () => {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState([]);
  const [expandedScenarioId, setExpandedScenarioId] = useState(null);

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const loadedScenarios = await fetchScenarios();
        console.log("Loaded Scenarios:", loadedScenarios); // 🔍 Debug-logg
        setScenarios(loadedScenarios);
      } catch (error) {
        console.error("Error fetching scenarios:", error);
      }
    };

    loadScenarios();
  }, []);

  const handleDeleteScenario = async (scenarioId) => {
    try {
      await deleteScenario(scenarioId);
      setScenarios((prev) =>
        prev.filter((scenario) => scenario.id !== scenarioId)
      );
    } catch (error) {
      console.error("Error deleting scenario:", error);
    }
  };

  const toggleScenarioDropdown = (scenarioId) => {
    setExpandedScenarioId(
      expandedScenarioId === scenarioId ? null : scenarioId
    );
  };

  return (
    <div className={styles.scenarioPageContainer}>
      <h1>Saved Scenarios</h1>

      {scenarios.length === 0 ? (
        <p>No saved scenarios found.</p>
      ) : (
        <div className={styles.scenarioList}>
          {scenarios.map((scenario) => (
            <div
              key={`scenario-${scenario.id}`}
              className={styles.scenarioItem}
            >
              {/* Scenario Header - Klickbar för att expandera/minimera */}
              <div
                className={styles.scenarioHeader}
                onClick={() => toggleScenarioDropdown(scenario.id)}
              >
                <span className={styles.scenarioTitle}>
                  {scenario.name || "Untitled Scenario"}
                </span>
                <span className={styles.arrow}>
                  {expandedScenarioId === scenario.id ? "▲" : "▼"}
                </span>
              </div>

              {/* Dropdown-innehåll visas om scenariot är expanderat */}
              {expandedScenarioId === scenario.id && (
                <div className={styles.scenarioDetails}>
                  {scenario.mappings.length > 0 ? (
                    scenario.mappings.map((mapping, index) => (
                      <div
                        key={`mapping-${scenario.id}-${index}`}
                        className={styles.mappingItem}
                      >
                        {/* Titel visas i fetstil överst */}
                        <p className={styles.scenarioMappingTitle}>
                          <strong>Title:</strong>{" "}
                          {mapping.request?.title || "No Title"}
                        </p>

                        {/* Method och URL visas under varandra */}
                        <div className={styles.mappingInfo}>
                          <p>
                            <strong>Method:</strong>{" "}
                            {mapping.request?.method || "N/A"}
                          </p>
                          <p>
                            <strong>URL:</strong>{" "}
                            {mapping.request?.url || "N/A"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No mappings found.</p>
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
