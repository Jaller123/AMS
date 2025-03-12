import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchScenarios,
  deleteScenario,
  handleSendScenarioToWireMock,
} from "../../backend/api";
import ScenarioList from "./ScenarioList";
import styles from "./ScenarioPage.module.css";

const ScenariosPage = ({ mappings }) => {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState([]);
  const [expandedScenarioId, setExpandedScenarioId] = useState(null);

  // Fetch scenarios from backend on component mount
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const loadedScenarios = await fetchScenarios();
        console.log("Loaded Scenarios:", loadedScenarios); // Debugging
        setScenarios(loadedScenarios);
      } catch (error) {
        console.error("Error fetching scenarios:", error);
      }
    };
    loadScenarios();
  }, []);

  // Send scenario to WireMock
  const handleSendScenario = async (scenarioId) => {
    try {
      const result = await handleSendScenarioToWireMock(scenarioId);
      if (result?.success) {
        alert("Scenario sent successfully!");
      } else {
        alert("Failed to send scenario.");
      }
    } catch (error) {
      console.error("Error sending scenario:", error);
      alert("An error occurred while sending the scenario.");
    }
  };

  // Delete scenario from backend
  const handleDeleteScenario = async (scenarioId) => {
    try {
      await deleteScenario(scenarioId);
      setScenarios((prev) =>
        prev.filter((scenario) => scenario.id !== scenarioId)
      );
      alert("Scenario deleted successfully!");
    } catch (error) {
      console.error("Error deleting scenario:", error);
      alert("Failed to delete scenario.");
    }
  };

  // Toggle dropdown to show scenario details
  const toggleScenarioDropdown = (scenarioId) => {
    setExpandedScenarioId((prevId) =>
      prevId === scenarioId ? null : scenarioId
    );
  };

  return (
    <div className={styles.scenarioPageContainer}>
      <h1>Saved Scenarios</h1>

      {scenarios.length === 0 ? (
        <p>No saved scenarios found.</p>
      ) : (
        <ScenarioList
          mappings={mappings}
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
