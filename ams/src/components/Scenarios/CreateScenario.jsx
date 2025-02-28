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
  const [newScenarioMappings, setNewScenarioMappings] = useState([])
  const [draggingMappingId, setDraggingMappingId] = useState(null);
  const [expandMappingIdLeft, setExpandMappingIdLeft] = useState(null)
  const [expandMappingIdRight, setExpandMappingIdRight] = useState(null)
  const [highlighted, setHighlighted] = useState(false)
  
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
  const toggleMappingDropdownLeft = (mappingId) => {
    setExpandMappingIdLeft(expandMappingIdLeft === mappingId ? null : mappingId);
  };

  const toggleMappingDropdownRight = (mappingId) => {
    setExpandMappingIdRight(expandMappingIdRight === mappingId ? null : mappingId);
  };
  

  // When a mapping is dragged, set its data and mark it as dragging.
  const handleDragStartMapping = (e, mapping) => {
    e.dataTransfer.setData("application/json", JSON.stringify(mapping));
    setDraggingMappingId(mapping.id);
  };

  const handleDragEndMapping = () => {
    setDraggingMappingId(null);
  };

  const handleDragOverDropZone = (e) => {
    e.preventDefault()
    setHighlighted(true)
  }

  const handleDragLeaveDropZone = (e) => {
    e.preventDefault()
    setHighlighted(false)
  }

  const handleDropOnDropZone = (e) => {
    e.preventDefault()
    setHighlighted(false)
    const jsonData = e.dataTransfer.getData("application/json")
    if (!jsonData) return
    const droppedMapping = JSON.parse(jsonData)
  

  const cleanMapping = {
    request: droppedMapping.request,
    response: droppedMapping.response,
    id: droppedMapping.id
  }

  const cleanResponses = responses.filter(
    (res) => res.reqId === droppedMapping.id
  )


  const alreadyExists = newScenarioMappings.some(
    (m) => m.request.title === cleanMapping.request.title
  )
  if (!alreadyExists) {
    setNewScenarioMappings([...newScenarioMappings, cleanMapping]);
  }
}



  // Create a new scenario with empty mappings/responses
  const handleSaveNewScenario = async () => {
    const newScenarioData = {
      name: `New Scenario ${scenarios.length + 1}`,
      mappings: newScenarioMappings,
      responses: []
    };

    const savedScenario = await saveScenario(newScenarioData);
    if (savedScenario) {
      setScenarios([...scenarios, savedScenario]);
      setNewScenarioMappings([])
      alert("New Scenario Saved Succesfully!")
    }
  };
  return (
    <div className={styles.container}>
      {/* Left Panel – Scenarios */}
      <div className={styles.leftPanel}
      onDragOver={handleDragOverDropZone}
      onDragLeave={handleDragLeaveDropZone}
      onDrop={handleDropOnDropZone}
      style={{ background: highlighted ? "#e6f7ff" : "" }}>
        
        <h1>Create a New Scenario</h1>
        <p>Drag over which mappings you want to add to the right panel to create a new Scenario.</p>
        {newScenarioMappings.length === 0 ? (
          <p>No Mappings added yet</p>
        ) : (
          <ul className={styles.mappingList}>
            {newScenarioMappings.map((mapping, index) => (
              <div key={mapping.id || index} className={styles.mappingItem}>
                <div
                  className={styles.mappingHeader}
                  onClick={() => toggleMappingDropdownLeft(mapping.id)}
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
                {expandMappingIdLeft === mapping.id && (
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
          </ul>
        )}
        <button onClick={handleSaveNewScenario} className={styles.button}>
          Save Scenario
        </button>
          
 
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

export default CreateScenario;
