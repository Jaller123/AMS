import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchScenarios, deleteScenario, handleSendToWireMock, handleSendScenarioToWireMock } from "../../backend/api";
import ScenarioList from "./ScenarioList"
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

  const handleSendScenario = async(scenarioId) => {
    const result = await handleSendScenarioToWireMock(scenarioId);
    if (result && result.success) {
      alert("Scenario sent Succesfully")
    }
  }

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
    setExpandedScenarioId(expandedScenarioId === scenarioId ? null : scenarioId);
  };

  return (
    <div className={styles.scenarioPageContainer}>
    <h1>Saved Scenarios</h1>
    {scenarios.length === 0 ? (
      <p>No saved scenarios found.</p>
    ) : (
      <ScenarioList
        scenarios={scenarios}
        expandedScenarioId={expandedScenarioId}
        handleDeleteScenario={handleDeleteScenario}
        handleSendScenarioToWireMock={handleSendScenario}
        toggleScenarioDropdown={toggleScenarioDropdown}
      />
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
