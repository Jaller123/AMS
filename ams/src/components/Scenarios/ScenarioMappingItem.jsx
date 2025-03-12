import React from "react";
import styles from "./CreateScenario.module.css";


const ScenarioMappingItem = ({
  mappings = [], // Ensure mappings is always an array
  responses = [],
  scenarioName,
  setScenarioName,
  newScenarioMappings,
  filteredMappings,
  expandedMappingId,
  toggleMappingDropdown,
  handleDragStartMapping,
  handleDragEndMapping,
  handleDragOverDropZone,
  handleDragLeaveDropZone,
  handleDropOnDropZone,
  highlighted,
  handleRemoveMapping,
  draggingMappingId,
  expandMappingIdLeft,
  expandMappingIdRight,
  toggleMappingDropdownLeft,
  toggleMappingDropdownRight,
  handleSaveNewScenario
}) => {
  
  
  return (
    <div className={styles.container}>
    {/* Left Panel – Scenarios */}
    <div className={styles.leftPanel}
    onDragOver={handleDragOverDropZone}
    onDragLeave={handleDragLeaveDropZone}
    onDrop={handleDropOnDropZone}
    style={{ background: highlighted ? "#e6f7ff" : "" }}>
      <input placeholder="Enter Scenario Title Here"
      value={scenarioName}
      onChange={(e) => setScenarioName(e.target.value)}
      >
      </input>
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
                <button 
                className={styles.removeMapping}
                onClick={() => handleRemoveMapping(mapping.id)}>
                  ❌
                </button>
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

export default ScenarioMappingItem;
