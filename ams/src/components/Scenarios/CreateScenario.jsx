import React, { useState, useEffect } from "react";
import { fetchMappings, fetchScenarios, saveScenario } from "../../backend/api";
import styles from "./CreateScenario.module.css";
import useMappingSearch from "./useMappingSearch";
import SortControls from "../MappingPage/SortControls";
import ScenarioForm from "./ScenarioMappingList";
import ScenarioMappingList from "./ScenarioMappingList";

const CreateScenario = () => {
  const [mappings, setMappings] = useState([]);
  const [responses, setResponses] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [newScenarioMappings, setNewScenarioMappings] = useState([]);
  const [draggingMappingId, setDraggingMappingId] = useState(null);
  const [scenarioName, setScenarioName] = useState("");

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

  const {
    filteredMappings,
    search,
    setSearch,
    searchFilters,
    setSearchFilters,
    sortCriterion,
    setSortCriterion,
  } = useMappingSearch(mappings);

  // Handle drag start (set the dragging ID)
  const handleDragStartMapping = (e, mapping) => {
    setDraggingMappingId(mapping.id);
  };

  // Handle drag end (reset the dragging ID)
  const handleDragEndMapping = () => {
    setDraggingMappingId(null);
  };

  // Handle dropping of the mapping into the new scenario container
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
    if (newScenarioMappings.length === 0) {
      alert("Please add at least one mapping to create a new Scenario.");
      return;
    }
    if (!scenarioName.trim()) {
      alert("Please enter a Title.");
      return;
    }
    const newScenarioData = {
      name: scenarioName,
      mappings: newScenarioMappings,
    };
    const savedScenario = await saveScenario(newScenarioData);
    if (savedScenario) {
      setScenarios([...scenarios, savedScenario]);
      setNewScenarioMappings([]);
      setScenarioName("");
      alert("New Scenario Saved Successfully!");
    }
  };

  return (
    <div className={styles.container}>
      <ScenarioForm
        scenarioName={scenarioName}
        setScenarioName={setScenarioName}
        newScenarioMappings={newScenarioMappings}
        setNewScenarioMappings={setNewScenarioMappings}
        handleSaveNewScenario={handleSaveNewScenario}
      />
      <div
        className={styles.leftPanel}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropMapping}
      >
        <h2>Scenario Mappings</h2>
        <ul>
          {newScenarioMappings.map((mapping) => (
            <li key={mapping.id}>{mapping.request?.url || "No URL"}</li>
          ))}
        </ul>
      </div>
      <div className={styles.rightPanel}>
        <h2>Saved Mappings</h2>
        <SortControls
          setSortCriterion={setSortCriterion}
          searchFilters={searchFilters}
          setSearchFilters={setSearchFilters}
          search={search}
          filteredMappings={filteredMappings}
          setSearch={setSearch}
          sortCriterion={sortCriterion}
        />
        <ScenarioMappingList
          mappings={filteredMappings}
          responses={responses}
          handleDragStartMapping={handleDragStartMapping}
          handleDragEndMapping={handleDragEndMapping}
          draggingMappingId={draggingMappingId}
        />
      </div>
    </div>
  );
};

export default CreateScenario;
