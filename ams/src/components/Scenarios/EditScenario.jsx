import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  fetchMappings,
  fetchScenarios, // Den uppdaterade fetchScenarios-funktionen
  updateScenario,
} from "../../backend/api"; // Kontrollera att importen är korrekt
import styles from "./CreateScenario.module.css";
import useMappingSearch from "./useMappingSearch";
import SortControls from "../MappingPage/SortControls";

const EditScenario = () => {
  const { scenarioId } = useParams();
  const [mappings, setMappings] = useState([]);
  const [responses, setResponses] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [editScenarioMappings, setEditScenarioMappings] = useState([]);
  const [scenarioName, setScenarioName] = useState("");
  const [highlighted, setHighlighted] = useState(false);

  // Load mappings and scenarios on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { requests, responses } = await fetchMappings();
        setMappings(requests);
        setResponses(responses);
      } catch (error) {
        console.error("Error fetching mappings:", error);
      }
      try {
        const loadedScenarios = await fetchScenarios(); // Laddar alla scenarier
        setScenarios(loadedScenarios); // Sätt alla scenarier i state
      } catch (error) {
        console.error("Error fetching scenarios:", error);
      }
    };
    loadData();
  }, []);

  // Prepopulate the editor if a scenarioId is provided and found
  useEffect(() => {
    if (scenarioId) {
      const editingScenario = scenarios.find((s) => s.id === scenarioId);
      if (editingScenario) {
        setScenarioName(editingScenario.name);
        setEditScenarioMappings(editingScenario.mappings);
      }
    }
  }, [scenarioId, scenarios]);

  const getFullMapping = (reqId) => mappings.find((m) => m.id === reqId) || {};

  const {
    filteredMappings,
    search,
    setSearch,
    searchFilters,
    setSearchFilters,
    sortCriterion,
    setSortCriterion,
  } = useMappingSearch(mappings);

  const handleSaveScenario = async () => {
    if (editScenarioMappings.length === 0) {
      alert("Please add at least one mapping to update the Scenario.");
      return;
    }
    if (!scenarioName.trim()) {
      alert("Please enter a Title.");
      return;
    }

    const updatedScenarioData = {
      name: scenarioName,
      mappings: editScenarioMappings,
    };

    const result = await updateScenario(scenarioId, updatedScenarioData);

    if (result) {
      alert("Scenario updated successfully!");
      // Optionally, you might redirect or update local state here.
    }
  };

  // Lägg till här andra funktioner som du har i din kod för att hantera drag and drop och lägga till mappings

  return (
    <div className={styles.container}>
      {/* Left Panel – Scenario Editor */}
      <div
        className={styles.leftPanel}
        onDragOver={handleDragOverDropZone}
        onDragLeave={handleDragLeaveDropZone}
        onDrop={handleDropOnDropZone}
        style={{ background: highlighted ? "#e6f7ff" : "" }}
      >
        <h1 style={{ color: highlighted ? "#2c3e50" : "white" }}>
          Edit Scenario
        </h1>
        <input
          placeholder="Enter Scenario Title Here"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          className={styles.inputTitle}
        />
        {/* Render mappings and scenario UI here */}
      </div>

      {/* Right Panel – Saved Mappings */}
      <div className={styles.rightPanel}>
        {/* Render saved mappings and sorting controls */}
      </div>
    </div>
  );
};

export default EditScenario;
