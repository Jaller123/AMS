import React, { useState, useEffect } from "react";
import {
  fetchMappings,
  fetchScenarios,
  saveScenario,
  updateScenario
} from "../../backend/api";
import styles from "./CreateScenario.module.css";

const CreateScenario = () => {
  const [mappings, setMappings] = useState([]);
  const [responses, setResponses] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [expandMappingId, setExpandMappingId] = useState(null);
  const [openScenarioId, setOpenScenarioId] = useState(null);
  const [highlightedScenarioId, setHighlightedScenarioId] = useState(null);
  const [draggingMappingId, setDraggingMappingId] = useState(null);
  const [droppingScenarioId, setDroppingScenarioId] = useState(null);

  // Load mappings and scenarios on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { requests, responses } = await fetchMappings();
        console.log("Mapping API Response:", { requests, responses });
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

  // Toggle expanded state for a mapping
  const toggleMappingDropdown = (mappingId) => {
    setExpandMappingId(expandMappingId === mappingId ? null : mappingId);
  };

  // Toggle expanded state for a scenario
  const toggleScenarioDropdown = (scenarioId) => {
    setOpenScenarioId(openScenarioId === scenarioId ? null : scenarioId);
  };

  // Create a new scenario with empty mappings/responses
  const handleCreateNewScenario = async () => {
    const newScenarioData = {
      name: `New Scenario ${scenarios.length + 1}`,
      mappings: [],
      responses: []
    };
    const savedScenario = await saveScenario(newScenarioData);
    if (savedScenario) {
      setScenarios([...scenarios, savedScenario]);
    }
  };

  // When a mapping is dragged, set its data and mark it as dragging.
  const handleDragStartMapping = (e, mapping) => {
    e.dataTransfer.setData("application/json", JSON.stringify(mapping));
    setDraggingMappingId(mapping.id);
  };

  const handleDragEndMapping = () => {
    setDraggingMappingId(null);
  };

  // Allow dropping by preventing default on the scenario header.
  const handleDragOverScenario = (e) => {
    e.preventDefault();
  };

  // When a mapping enters a scenario drop target, highlight it.
  const handleDragEnterScenario = (e, scenario) => {
    e.preventDefault();
    setHighlightedScenarioId(scenario.id);
  };

  // Remove highlight when the draggable leaves the scenario drop target.
  const handleDragLeaveScenario = (e, scenario) => {
    setHighlightedScenarioId(null);
  };

  // When a mapping is dropped on a scenario, merge it into that scenario.
  const handleDropOnScenario = async (e, scenario) => {
    e.preventDefault();
    setHighlightedScenarioId(null);
    const jsonData = e.dataTransfer.getData("application/json");
    if (!jsonData) return;
    const droppedMapping = JSON.parse(jsonData);
    const relevantResponses = responses.filter(
      (res) => res.reqId === droppedMapping.id
    );
    const updatedScenarioData = {
      // If you need the name updated, you can include scenario.name here
      mappings: [droppedMapping],
      responses: relevantResponses,
    };
    
    const updatedScenario = await updateScenario(scenario.id, updatedScenarioData);

    if (updatedScenario) {
      // Update local state with the new scenario data.
      setScenarios(scenarios.map((sc) => (sc.id === scenario.id ? updatedScenario : sc)));
      // Trigger slide-in animation
      setDroppingScenarioId(scenario.id);
      setTimeout(() => {
        setDroppingScenarioId(null);
      }, 500); // duration matches CSS animation duration
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Panel – Scenarios */}
      <div className={styles.leftPanel}>
        <h1>Create Scenario</h1>
        <button onClick={handleCreateNewScenario} className={styles.button}>
          Create New Scenario
        </button>
        {scenarios.length === 0 ? (
          <p>No scenarios created yet.</p>
        ) : (
          <div className={styles.scenarioList}>
            {scenarios.map((scenario) => (
              <div key={scenario.id} className={styles.scenarioItem}>
                <div
                  className={`${styles.scenarioHeader} ${
                    highlightedScenarioId === scenario.id ? styles.dropHighlight : ""
                  } ${droppingScenarioId === scenario.id ? styles.slideIn : ""}`}
                  onClick={() => toggleScenarioDropdown(scenario.id)}
                  onDragOver={handleDragOverScenario}
                  onDragEnter={(e) => handleDragEnterScenario(e, scenario)}
                  onDragLeave={(e) => handleDragLeaveScenario(e, scenario)}
                  onDrop={(e) => handleDropOnScenario(e, scenario)}
                >
                  <span>
                    Scenario {scenario.id}: {scenario.name}
                  </span>
                  <span className={styles.arrow}>
                    {openScenarioId === scenario.id ? "▲" : "▼"}
                  </span>
                </div>
                {openScenarioId === scenario.id && (
                  <div className={styles.scenarioDetails}>
                    <h3>Mappings</h3>
                    {scenario.mappings && scenario.mappings.length > 0 ? (
                      scenario.mappings.map((m) => (
                        <pre key={m.id} className={styles.preFormatted}>
                          {JSON.stringify(m.request, null, 2)}
                        </pre>
                      ))
                    ) : (
                      <p>No mappings in this scenario.</p>
                    )}
                    <h3>Responses</h3>
                    {scenario.responses && scenario.responses.length > 0 ? (
                      scenario.responses.map((res) => (
                        <pre key={res.id} className={styles.preFormatted}>
                          {JSON.stringify(res.resJson, null, 2)}
                        </pre>
                      ))
                    ) : (
                      <p>No responses in this scenario.</p>
                    )}
                    <button
                      className={`${styles.button} ${styles.deleteButton}`}
                      onClick={() =>
                        setScenarios(scenarios.filter((sc) => sc.id !== scenario.id))
                      }
                    >
                      Delete Scenario
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel – Saved Mappings */}
      <div className={styles.rightPanel}>
        <h2>Saved Mappings</h2>
        {mappings.length === 0 ? (
          <p>No Mappings Found.</p>
        ) : (
          <div className={styles.mappingList}>
            {mappings.map((mapping) => (
              <div key={mapping.id} className={styles.mappingItem}>
                <div
                  className={styles.mappingHeader}
                  onClick={() => toggleMappingDropdown(mapping.id)}
                  draggable
                  onDragStart={(e) => handleDragStartMapping(e, mapping)}
                  onDragEnd={handleDragEndMapping}
                  style={{
                    cursor: "grab",
                    opacity: draggingMappingId === mapping.id ? 0.6 : 1,
                    transition: "opacity 0.2s ease, transform 0.2s ease"
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
                  <span className={styles.arrow}>
                    {expandMappingId === mapping.id ? "▲" : "▼"}
                  </span>
                </div>
                {expandMappingId === mapping.id && (
                  <div className={styles.mappingDetails}>
                    <h3>Request</h3>
                    <pre className={styles.preFormatted}>
                      {JSON.stringify(mapping.request, null, 2)}
                    </pre>
                    <h3>Responses</h3>
                    {responses.filter((res) => res.reqId === mapping.id).length > 0 ? (
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

export default CreateScenario;
