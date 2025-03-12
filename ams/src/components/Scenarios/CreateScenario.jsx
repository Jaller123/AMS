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
  const [scenarioName, setScenarioName] = useState("");
  const [expandedMappingId, setExpandedMappingId] = useState(null); // New state for expanded mapping ID

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
        const loadedScenarios = await fetchScenarios();
        setScenarios(loadedScenarios);
      } catch (error) {
        console.error("Error fetching scenarios:", error);
      }
    };
    loadData();
  }, []);

  // Function to toggle the dropdown for a specific mapping
  const toggleMappingDropdown = (mappingId) => {
    setExpandedMappingId((prevExpandedMappingId) =>
      prevExpandedMappingId === mappingId ? null : mappingId
    );
  };

  // Handle drag start
  const handleDragStartMapping = (e, mapping) => {
    setDraggingMappingId(mapping.id);
  };

  const handleRemoveMapping = (mappingId) => {
    setNewScenarioMappings((prevMappings) =>
      prevMappings.filter((mapping) => mapping.id !== mappingId)
    );
  };

  // Handle drag end
  const handleDragEndMapping = () => {
    setDraggingMappingId(null);
  };

  // Handle dropping of the mapping
  const handleDropMapping = (e) => {
    e.preventDefault();
    if (!draggingMappingId) return;

    const draggedMapping = mappings.find(
      (mapping) => mapping.id === draggingMappingId
    );
    setNewScenarioMappings((prevMappings) => [...prevMappings, draggedMapping]);
  };

  // Save the new scenario
  const handleSaveNewScenario = async () => {
    if (!scenarioName.trim()) {
      alert("Please enter a scenario name.");
      return;
    }
    if (newScenarioMappings.length === 0) {
      alert("Please add at least one mapping to create a scenario.");
      return;
    }

    const newScenarioData = {
      name: scenarioName,
      mappings: newScenarioMappings,
    };

    try {
      const savedScenario = await saveScenario(newScenarioData);
      if (savedScenario) {
        setScenarios([...scenarios, savedScenario]);
        setNewScenarioMappings([]);
        setScenarioName("");
        alert("New Scenario Saved Successfully!");
      }
    } catch (error) {
      console.error("Error saving scenario:", error);
      alert("Failed to save scenario.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.scenarioInput}>
        <input
          type="text"
          placeholder="Enter Scenario Name"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
        />
        <button onClick={handleSaveNewScenario}>Save Scenario</button>
      </div>

      <div
        className={styles.leftPanel}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropMapping}
      >
        <h2>Scenario Mappings</h2>
        <ul>
          {newScenarioMappings.map((mapping) => (
            <li key={mapping.id}>
              <div
                className={styles.mappingHeader}
                onClick={() => toggleMappingDropdown(mapping.id)} // Call the function here
              >
                <span>
                  <strong>{mapping.request?.method || "METHOD"}</strong> |{" "}
                  {mapping.request?.url || "No URL"} |{" "}
                  {mapping.request?.title || "No Title"}
                </span>
                <button
                  className={styles.removeMapping}
                  onClick={() => handleRemoveMapping(mapping.id)}
                >
                  ❌
                </button>
              </div>
              {expandedMappingId === mapping.id && (
                <div className={styles.mappingDetails}>
                  <h3>Request</h3>
                  <pre className={styles.preFormatted}>
                    {JSON.stringify(mapping.request, null, 2)}
                  </pre>
                  <h3>Response</h3>
                  <pre className={styles.preFormatted}>
                    {JSON.stringify(mapping.response, null, 2)}
                  </pre>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.rightPanel}>
        <h2>Saved Mappings</h2>
        <ScenarioMappingList
          mappings={mappings}
          responses={responses}
          handleDragStartMapping={handleDragStartMapping}
          handleDragEndMapping={handleDragEndMapping}
          draggingMappingId={draggingMappingId}
          toggleMappingDropdown={toggleMappingDropdown}
        />
      </div>
    </div>
  );
};

export default CreateScenario;
