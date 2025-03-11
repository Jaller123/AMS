import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  fetchMappings,
  fetchScenarios,
  updateScenario,
} from "../../backend/api";
import styles from "./CreateScenario.module.css"; // You can reuse the same CSS as CreateScenario if desired
import useMappingSearch from "./useMappingSearch";
import SortControls from "../MappingPage/SortControls";

const EditScenario = () => {
  // Get the scenarioId from the URL (e.g. "/edit-scenario/1")
  const { scenarioId } = useParams();

  const [mappings, setMappings] = useState([]);
  const [responses, setResponses] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [editScenarioMappings, setEditScenarioMappings] = useState([]);
  const [draggingMappingId, setDraggingMappingId] = useState(null);
  const [expandMappingIdLeft, setExpandMappingIdLeft] = useState(null);
  const [expandMappingIdRight, setExpandMappingIdRight] = useState(null);
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
        const loadedScenarios = await fetchScenarios();
        setScenarios(loadedScenarios);
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

  // Left-panel: Toggle dropdown for a mapping
  const toggleMappingDropdownLeft = (mappingId) => {
    setExpandMappingIdLeft(
      expandMappingIdLeft === mappingId ? null : mappingId
    );
  };

  // Right-panel: Toggle dropdown for a mapping
  const toggleMappingDropdownRight = (mappingId) => {
    setExpandMappingIdRight(
      expandMappingIdRight === mappingId ? null : mappingId
    );
  };

  // Drag and drop handlers
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

    const fullMapping = mappings.find((m) => m.id === droppedMapping.id) || {};

    const cleanMapping = {
      request: { reqId: droppedMapping.id },
      response:
        fullMapping && fullMapping.id
          ? { resId: droppedMapping.id + ".1" }
          : {},
    };

    // Check by mapping id to avoid duplicates
    const alreadyExists = editScenarioMappings.some(
      (m) => m.request.reqId === cleanMapping.request.reqId
    );
    if (!alreadyExists) {
      setEditScenarioMappings([...editScenarioMappings, cleanMapping]);
    }
  };

  // Save handler: always updates the existing scenario
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
        <p style={{ color: highlighted ? "#666" : "white" }}>
          Drag and drop the mappings you want to update, then adjust the title.
        </p>
        <input
          placeholder="Enter Scenario Title Here"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          className={styles.inputTitle}
        />
        {editScenarioMappings.length === 0 ? (
          <p style={{ color: "white" }}>No Mappings added yet</p>
        ) : (
          <ul className={styles.mappingList}>
            {editScenarioMappings.map((mapping) => {
              // Use mapping.request.reqId as the unique identifier
              const mappingId = mapping.request.reqId;
              const fullMapping = getFullMapping(mappingId);
              return (
                <div key={mapping.request.reqId} className={styles.mappingItem}>
                  <div
                    className={styles.mappingHeader}
                    onClick={() => toggleMappingDropdownLeft(mappingId)}
                    draggable
                    onDragStart={(e) => handleDragStartMapping(e, mapping)}
                    onDragEnd={handleDragEndMapping}
                    style={{
                      cursor: "grab",
                      opacity: draggingMappingId === mappingId ? 0.6 : 1,
                      transition: "opacity 0.2s ease, transform 0.2s ease",
                    }}
                  >
                    <span>
                      <strong>{fullMapping.request?.method || "METHOD"}</strong>{" "}
                      |{" "}
                      {fullMapping.request?.url ||
                        fullMapping.request?.urlPath ||
                        "No URL"}{" "}
                      | {fullMapping.request?.title || "No Title"}
                    </span>
                    <button
                      className={styles.removeMapping}
                      onClick={() => handleRemoveMapping(mappingId)}
                    >
                      ❌
                    </button>
                  </div>
                  {expandMappingIdLeft === mappingId && (
                    <div className={styles.mappingDetails}>
                      <h3>Request</h3>
                      <pre className={styles.preFormatted}>
                        {JSON.stringify(fullMapping.request, null, 2)}
                      </pre>
                      <h3>Responses</h3>
                      {responses.filter((res) => res.reqId === mappingId)
                        .length > 0 ? (
                        responses
                          .filter((res) => res.reqId === mappingId)
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
              );
            })}
          </ul>
        )}
        <button onClick={handleSaveScenario} className={styles.button}>
          Update Scenario
        </button>
      </div>

      {/* Right Panel – Saved Mappings */}
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
        {filteredMappings.length === 0 ? (
          <p>No Mappings Found.</p>
        ) : (
          <div className={styles.mappingList}>
            {filteredMappings.map((mapping) => (
              <div key={mapping.id} className={styles.mappingItem}>
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
