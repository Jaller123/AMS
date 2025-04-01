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
  const [addButton, setAddButton] = useState()

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
  const handleAddToScenarios = (mappingId, e) => {

    const fullMapping = mappings.find((m) => m.id === mappingId.id) || {};

    const cleanMapping = {
      request: { reqId: mappingId },
      response:
        fullMapping && fullMapping.id
          ? { resId: mappingId + ".1" }
          : {},
    };

    // Check by mapping id to avoid duplicates
    const alreadyExists = editScenarioMappings.some(
      (m) => m.request.reqId === cleanMapping.request.reqId
    );
    if (!alreadyExists) {
      setEditScenarioMappings([...editScenarioMappings, cleanMapping]);
    }
  }

  const handleRemoveMapping = (mappingId) => {
    setEditScenarioMappings((prevMappings) =>
      prevMappings.filter((mapping) => mapping.request.reqId !== mappingId)
    );
  };

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
        {filteredMappings.length === 0 ? (
          <p>No Mappings Found.</p>
        ) : (
          <div className={styles.mappingList}>
            {filteredMappings.map((mapping) => (
              <div key={mapping.id} className={styles.mappingItem}
              placeholder="mappingItem">
                <div
                  className={styles.mappingHeader}
                  onClick={() => toggleMappingDropdownRight(mapping.id)}
                  draggable
                  onDragStart={(e) => handleDragStartMapping(e, mapping)}
                  onDragEnd={handleDragEndMapping}
                  style={{
                    cursor: "grab",
                    opacity: draggingMappingId === mapping.id ? 0.6 : 1,
                    transition: "opacity 0.2s ease, transform 0.2s ease",
                  }}
                >
                 
                  <span>
                    <strong>{mapping.request?.method || "METHOD"}</strong> |{" "}
                    {mapping.request?.url ||
                      mapping.request?.urlPath ||
                      mapping.request?.urlPathPattern ||
                      mapping.request?.urlPathTemplate ||
                      mapping.request?.urlPattern ||
                      "No URL"}{" "}
                    | {mapping.request?.title || "No Title"}
                  </span>
                  <button placeholder="Add button"
                  onClick={() => handleAddtoScenario (mapping.id)}> +</button>
                </div>
                {expandMappingIdRight === mapping.id && (
                  <div className={styles.mappingDetails}>
                    <h3>Request</h3>
                    <pre className={styles.preFormatted}>
                      {JSON.stringify(mapping.request, null, 2)}
                    </pre>
                    <h3>Responses</h3>
                    {responses.filter((res) => res.reqId === mapping.id)
                      .length > 0 ? (
                      responses
                        .filter((res) => res.reqId === mapping.id)
                        .map((res) => (
                          <pre key={res.id} className={styles.preFormatted}>
                            {JSON.stringify(res.resJson, null, 2)}
                          </pre>
                        ))
                    ) : (
                      <p>No response found for this mapping.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditScenario;
