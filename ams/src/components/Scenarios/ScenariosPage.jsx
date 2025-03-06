import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchScenarios, deleteScenario, handleSendToWireMock } from "../../backend/api";
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

 const handleSendScenarioToWireMock = async (scenario) => {
    if (!scenario.mappings || scenario.mappings.length === 0) {
      console.warn("No mappings to send for this scenario.");
      return;
    }

   const results = await Promise.all(
    scenario.mappings.map((mappings) => {
      const mappingId = mappings.request.reqId
      return handleSendToWireMock(mappingId)
    })
   )

    if (results.every((result) => result && result.success)) {
      alert("All mappings sent to WireMock successfully!");
      return{ ...mapping, wireMockId: results.wireMockId}
    } 
    else {
      alert("Some mappings failed to send to WireMock.");
    }

    setScenarios((prevScenarios) => 
    prevScenarios.map((s) => 
    s.id === scenario.id ? { ...s, mappings: updatedMappings } : s))
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
        handleSendScenarioToWireMock={handleSendScenarioToWireMock}
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
