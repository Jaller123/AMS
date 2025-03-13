import React, { useState, useEffect } from "react";
import { fetchMappings, fetchScenarios, saveScenario } from "../../backend/api";
import styles from "./CreateScenario.module.css";
import ScenarioMappingList from "./ScenarioMappingList";

const CreateScenario = () => {
  const [mappings, setMappings] = useState([]);
  const [responses, setResponses] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [newScenarioMappings, setNewScenarioMappings] = useState([]);
  const [draggingMappingId, setDraggingMappingId] = useState(null);
  const [expandMappingIdLeft, setExpandMappingIdLeft] = useState(null);
  const [expandMappingIdRight, setExpandMappingIdRight] = useState(null);
  const [scenarioName, setScenarioName] = useState("");
  const [highlighted, setHighlighted] = useState(false);

  useEffect(() => {
    // Load data
    const loadData = async () => {
      try {
        const { requests, responses } = await fetchMappings();
        setMappings(requests);
        setResponses(responses);
      } catch (error) {
        console.error("Error fetching mappings:", error);
      }
      try {
        const loadedScenarios = await fetchScenarios();
        setScenarios(loadedScenarios);
      } catch (error) {
        console.error("Error fetching scenarios:", error);
      }
    };
    loadData();
  }, []);

  // ---------------------
  // Expand/collapse logic
  // ---------------------
  const toggleMappingDropdownLeft = (id) => {
    console.log("Left toggled", id);
    setExpandMappingIdLeft((prev) => (prev === id ? null : id));
  };
  const toggleMappingDropdownRight = (id) => {
    console.log("Right toggled", id);
    setExpandMappingIdRight((prev) => (prev === id ? null : id));
  };

  // ---------------------
  // Drag handlers
  // ---------------------
  const handleDragStartMapping = (e, mapping) => {
    e.dataTransfer.setData("application/json", JSON.stringify(mapping));
    setDraggingMappingId(mapping.id);
  };
  const handleDragEndMapping = () => {
    setDraggingMappingId(null);
  };
  const handleDragOverDropZone = (e) => {
    e.preventDefault();
    setHighlighted(true);
  };
  const handleDragLeaveDropZone = (e) => {
    e.preventDefault();
    setHighlighted(false);
  };
  const handleDropOnDropZone = (e) => {
    e.preventDefault();
    setHighlighted(false);

    const jsonData = e.dataTransfer.getData("application/json");
    if (!jsonData) return;
    const droppedMapping = JSON.parse(jsonData);

    // Possibly find responses, etc.
    // Then push to newScenarioMappings.
    setNewScenarioMappings((prev) => {
      // Avoid duplicates
      const alreadyExists = prev.some((m) => m.id === droppedMapping.id);
      if (alreadyExists) return prev;
      return [...prev, droppedMapping];
    });
  };

  // ---------------------
  // Save logic
  // ---------------------
  const handleSaveNewScenario = async () => {
    if (!scenarioName.trim()) {
      alert("Please enter a scenario name.");
      return;
    }
    if (newScenarioMappings.length === 0) {
      alert("Add at least one mapping before saving.");
      return;
    }
    const newScenarioData = {
      name: scenarioName,
      mappings: newScenarioMappings,
    };
    // Save scenario
    const savedScenario = await saveScenario(newScenarioData);
    if (savedScenario) {
      alert("Scenario saved successfully!");
      setScenarios((prev) => [...prev, savedScenario]);
      setScenarioName("");
      setNewScenarioMappings([]);
    }
  };

  // ---------------------
  // Remove from left list
  // ---------------------
  const handleRemoveMapping = (id) => {
    setNewScenarioMappings((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className={styles.container}>
      {/* LEFT PANEL: New Scenario */}
      <div
        className={styles.leftPanel}
        onDragOver={handleDragOverDropZone}
        onDragLeave={handleDragLeaveDropZone}
        onDrop={handleDropOnDropZone}
        style={{ background: highlighted ? "#e6f7ff" : "" }}
      >
        <h1>Create a New Scenario</h1>
        <h3>Drag and drop the mappings you want to add into a scenario and enter a title.</h3>
        <input 
          className={styles.inputTitle}
          placeholder="Enter Scenario Title Here"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
        />
        <ScenarioMappingList
          // The list on the left is your "new scenario" list
          mappings={newScenarioMappings}
          responses={responses}
          expandId={expandMappingIdRight}
          onToggleExpand={toggleMappingDropdownRight}
          draggingMappingId={draggingMappingId}
          handleDragStartMapping={handleDragStartMapping}
          handleDragEndMapping={handleDragEndMapping}
          handleRemoveMapping={handleRemoveMapping}
        />
        <button className={styles.button} onClick={handleSaveNewScenario}>Save Scenario</button>
      </div>

      {/* RIGHT PANEL: Saved Mappings */}
      <div className={styles.rightPanel}>
        <h2>Saved Mappings</h2>
        <ScenarioMappingList
          // The list on the right is your "existing mappings"
          mappings={mappings}
          responses={responses}
          expandId={expandMappingIdLeft}
          onToggleExpand={toggleMappingDropdownLeft}
          draggingMappingId={draggingMappingId}
          handleDragStartMapping={handleDragStartMapping}
          handleDragEndMapping={handleDragEndMapping}
        />
      </div>
    </div>
  );
};

export default CreateScenario;
