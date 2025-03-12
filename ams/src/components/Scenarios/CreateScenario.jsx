import React, { useState, useEffect } from "react";
import { fetchMappings, fetchScenarios, saveScenario } from "../../backend/api";
import styles from "./CreateScenario.module.css";
import ScenarioMappingList from "./ScenarioMappingList";

const CreateScenario = () => {
  const [mappings, setMappings] = useState([]);
  const [responses, setResponses] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [newScenarioMappings, setNewScenarioMappings] = useState([])
  const [draggingMappingId, setDraggingMappingId] = useState(null);
  const [expandMappingIdLeft, setExpandMappingIdLeft] = useState(null)
  const [expandMappingIdRight, setExpandMappingIdRight] = useState(null)
  const [scenarioName, setScenarioName] = useState("");
  const [highlighted, setHighlighted] = useState(false)


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

  const droppedMappingResponse = responses.find(
    (res) => res.reqId === droppedMapping.id
  ) || {}
  

  const cleanMapping = {
    ReqId: droppedMapping.id,
    request: droppedMapping.request,
    response: droppedMappingResponse
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
    if (newScenarioMappings.length === 0) {
      alert("Please add atleast one mapping to create a new Scenario.")
      return
    }

    if (!scenarioName.trim()) {
      alert("Please enter a Title.")
    }

    else {
      const newScenarioData = {
        name: scenarioName,
        mappings: newScenarioMappings
      };
      

    const savedScenario = await saveScenario(newScenarioData);
    if (savedScenario) {
      setScenarios([...scenarios, savedScenario]);
      setNewScenarioMappings([])
      setScenarioName("")
      alert("New Scenario Saved Succesfully!")
    }
    }
  };
  
  const handleRemoveMapping = (mappingId) => {
    setNewScenarioMappings((prevMappings) => {
     return  prevMappings.filter((mapping) => mapping.id !== mappingId)
    })
  }

  return (

      <div>
        <h2>Saved Mappings</h2>
        <ScenarioMappingList
          mappings={mappings}
          responses={responses}
          scenarioName={scenarioName}
          setScenarioName={setScenarioName}
          newScenarioMappings={newScenarioMappings}
          handleDragStartMapping={handleDragStartMapping}
          handleDragEndMapping={handleDragEndMapping}
          draggingMappingId={draggingMappingId}
          handleDragOverDropZone={handleDragOverDropZone}
          handleDragLeaveDropZone={handleDragLeaveDropZone}
          expandMappingIdLeft={expandMappingIdLeft}
          expandMappingIdRight={expandMappingIdRight}
          handleDropOnDropZone={handleDropOnDropZone}
          highlighted={highlighted}
          toggleMappingDropdownLeft={toggleMappingDropdownLeft}
          toggleMappingDropdownRight={toggleMappingDropdownRight}
          handleRemoveMapping={handleRemoveMapping}
          handleSaveNewScenario={handleSaveNewScenario}
        />
      </div>
  );
};

export default CreateScenario;
