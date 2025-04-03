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
  const [addedMappings, setAddedMappings] = useState(new Set()); // Track added mappings

  useEffect(() => {
    const loadData = async () => {
      try {
        const { mappings: loadedMappings, responses } = await fetchMappings();
        setMappings(loadedMappings);

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

  const toggleMappingDropdownLeft = (id) => {
    setExpandMappingIdLeft((prev) => (prev === id ? null : id));
  };

  const toggleMappingDropdownRight = (id) => {
    setExpandMappingIdRight((prev) => (prev === id ? null : id));
  };

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

    setNewScenarioMappings((prev) => {
      const alreadyExists = prev.some((m) => m.id === droppedMapping.id);
      if (alreadyExists) return prev;
      return [...prev, droppedMapping];
    });
  };

  const handleAddToScenario = (mappingId) => {
    const mappingToAdd = mappings.find((m) => m.id === mappingId);

    if (!mappingToAdd) return;

    setNewScenarioMappings((prevMappings) => {
      const alreadyExists = prevMappings.some((m) => m.id === mappingToAdd.id);
      if (alreadyExists) return prevMappings;
      return [...prevMappings, mappingToAdd];
    });

    // Add to addedMappings state
    setAddedMappings((prevAdded) => new Set(prevAdded).add(mappingId));
  };

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
      mappings: newScenarioMappings.map((mapping) => {
        return {
          reqId: mapping.id,
          resId: mapping.responses?.[0]?.resId || null,
        };
      }),
    };
    
    
    const savedScenario = await saveScenario(newScenarioData);
    if (savedScenario) {
      alert("Scenario saved successfully!");
      setScenarios((prev) => [...prev, savedScenario]);
      setScenarioName("");
      setNewScenarioMappings([]);
    }
  };

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
        <h3>
          Drag and drop the mappings you want to add into a scenario and enter a
          title.
        </h3>
        <input
          className={styles.inputTitle}
          placeholder="Enter Scenario Title Here"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
        />
        <ScenarioMappingList
          mappings={newScenarioMappings}
          responses={responses}
          expandId={expandMappingIdRight}
          onToggleExpand={toggleMappingDropdownRight}
          draggingMappingId={draggingMappingId}
          handleDragStartMapping={handleDragStartMapping}
          handleDragEndMapping={handleDragEndMapping}
          handleRemoveMapping={handleRemoveMapping} // Don't pass handleAddToScenario here
        />
        <button className={styles.button} onClick={handleSaveNewScenario}>
          Save Scenario
        </button>
      </div>

      {/* RIGHT PANEL: Saved Mappings */}
      <div className={styles.rightPanel}>
        <h2>Saved Mappings</h2>
        <ScenarioMappingList
          mappings={mappings.filter(
            (mapping) => !addedMappings.has(mapping.id)
          )} // Exclude the ones already added
          responses={responses}
          expanded={expandMappingIdLeft}
          expandId={expandMappingIdLeft}
          onToggleExpand={toggleMappingDropdownLeft}
          draggingMappingId={draggingMappingId}
          handleDragStartMapping={handleDragStartMapping}
          handleDragEndMapping={handleDragEndMapping}
          handleAddToScenario={handleAddToScenario} // Pass handleAddToScenario here
        />
      </div>
    </div>
  );
};

export default CreateScenario;
