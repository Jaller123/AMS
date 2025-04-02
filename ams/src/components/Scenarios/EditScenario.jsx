import React, { useState, useEffect } from "react";
import { fetchMappings, fetchScenarios, saveScenario } from "../../backend/api";
import styles from "./CreateScenario.module.css";
import ScenarioMappingList from "./ScenarioMappingList";

const EditScenario = () => {
  const [mappings, setMappings] = useState([]); // Alla sparade mappningar
  const [responses, setResponses] = useState([]); // Svar på mappningar
  const [scenarios, setScenarios] = useState([]); // Alla scenarion
  const [currentScenario, setCurrentScenario] = useState(null); // Det aktuella scenariot som redigeras
  const [draggingMappingId, setDraggingMappingId] = useState(null);
  const [highlighted, setHighlighted] = useState(false); // För att markera drag-and-drop zon
  const [addedMappings, setAddedMappings] = useState(new Set()); // För att hålla koll på tillagda mappningar

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
        // Här sätter vi det första scenariot som vi ska editera om inget är valt
        setCurrentScenario(loadedScenarios[0] || null);
      } catch (error) {
        console.error("Error fetching scenarios:", error);
      }
    };

    loadData();
  }, []);

  // Funktioner för att hantera drag-and-drop
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

  // Funktion för att lägga till mappningar till scenariot
  const handleAddMappingToScenario = (mappingId) => {
    const mappingToAdd = mappings.find((m) => m.id === mappingId);
    if (!mappingToAdd) return;

    setAddedMappings((prevAdded) => {
      const newAdded = new Set(prevAdded);
      newAdded.add(mappingId);
      return newAdded;
    });

    setCurrentScenario((prevScenario) => ({
      ...prevScenario,
      mappings: [...(prevScenario.mappings || []), mappingToAdd],
    }));
  };

  // Funktion för att ta bort en mappning från det aktuella scenariot
  const handleRemoveMappingFromScenario = (mappingId) => {
    setAddedMappings((prevAdded) => {
      const newAdded = new Set(prevAdded);
      newAdded.delete(mappingId);
      return newAdded;
    });

    setCurrentScenario((prevScenario) => ({
      ...prevScenario,
      mappings: prevScenario.mappings.filter((m) => m.id !== mappingId),
    }));
  };

  // Funktion för att spara scenariot
  const handleSaveScenario = async () => {
    if (!currentScenario) return;

    const newScenarioData = {
      name: currentScenario.name,
      mappings: currentScenario.mappings.map((mapping) => ({
        reqId: mapping.id,
        resId: responses.find((res) => res.reqId === mapping.id)?.resId || null,
      })),
    };

    const savedScenario = await saveScenario(newScenarioData);
    if (savedScenario) {
      alert("Scenario saved successfully!");
      setScenarios((prevScenarios) => [...prevScenarios, savedScenario]);
    }
  };

  const handleDropOnDropZone = (e) => {
    e.preventDefault();
    setHighlighted(false);

    const jsonData = e.dataTransfer.getData("application/json");
    if (!jsonData) return;
    const droppedMapping = JSON.parse(jsonData);

    // Lägg till mappningen till det aktuella scenariot
    setCurrentScenario((prevScenario) => {
      // Kolla om mappningen redan är tillagd för att undvika duplicering
      if (!prevScenario) return prevScenario;
      if (prevScenario.mappings.some((m) => m.id === droppedMapping.id)) {
        return prevScenario;
      }

      return {
        ...prevScenario,
        mappings: [...prevScenario.mappings, droppedMapping],
      };
    });

    // Ta bort den tillagda mappningen från listan med sparade mappningar
    setMappings((prevMappings) => {
      return prevMappings.filter((m) => m.id !== droppedMapping.id);
    });

    // Lägg till den till den lista över redan tillagda mappningar för att förhindra att den dras till igen
    setAddedMappings((prevAdded) => {
      const newAdded = new Set(prevAdded);
      newAdded.add(droppedMapping.id);
      return newAdded;
    });
  };

  return (
    <div className={styles.container}>
      {/* LEFT PANEL: Edit Scenario */}
      <div
        className={styles.leftPanel}
        onDragOver={handleDragOverDropZone}
        onDragLeave={handleDragLeaveDropZone}
        onDrop={handleDropOnDropZone}
        style={{ background: highlighted ? "#e6f7ff" : "transparent" }} // Säkerställ att det är ett korrekt stilobjekt
      >
        <h1>Edit Scenario</h1>
        <input
          className={styles.inputTitle}
          placeholder="Enter Scenario Title"
          value={currentScenario ? currentScenario.name : ""}
          onChange={(e) =>
            setCurrentScenario((prevScenario) => ({
              ...prevScenario,
              name: e.target.value,
            }))
          }
        />
        <h2>Scenario Mappings</h2>
        <ScenarioMappingList
          mappings={currentScenario ? currentScenario.mappings : []}
          responses={responses}
          draggingMappingId={draggingMappingId}
          handleDragStartMapping={handleDragStartMapping}
          handleDragEndMapping={handleDragEndMapping}
          handleRemoveMapping={handleRemoveMappingFromScenario}
        />
        <button className={styles.button} onClick={handleSaveScenario}>
          Save Scenario
        </button>
      </div>

      {/* RIGHT PANEL: Saved Mappings */}
      <div className={styles.rightPanel}>
        <h2>Saved Mappings</h2>
        <ScenarioMappingList
          mappings={mappings.filter(
            (mapping) => !addedMappings.has(mapping.id) // Exclude mappings already added to the scenario
          )}
          responses={responses}
          draggingMappingId={draggingMappingId}
          handleDragStartMapping={handleDragStartMapping}
          handleDragEndMapping={handleDragEndMapping}
          handleAddToScenario={handleAddMappingToScenario}
        />
      </div>
    </div>
  );
};

export default EditScenario;
