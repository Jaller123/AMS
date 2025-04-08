import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchMappings, fetchScenarios, saveScenario, updateScenario } from "../../backend/api";
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
  const [expandMappingIdLeft, setExpandMappingIdLeft] = useState(null);
  const [expandMappingIdRight, setExpandMappingIdRight] = useState(null);

  const { scenarioId } = useParams()

  useEffect(() => {
    console.log("🌀 useEffect triggered - loading mappings and scenarios");
  
    const loadData = async () => {
      try {
        console.log("📥 Fetching mappings...");
        const { mappings: loadedMappings } = await fetchMappings();
        console.log("✅ Fetched mappings:", loadedMappings);
  
        const normalizedMappings = loadedMappings.map((mapping) => {
          console.log("🔧 Normalizing mapping:", mapping);
          return {
            ...mapping,
            id: mapping.id,
            request: {
              ...mapping.request,
              reqJson: mapping.request?.reqJson || mapping.request,
            },
            title: mapping.request?.title,
            method: mapping.request?.reqJson?.method,
            url: mapping.request?.reqJson?.url || "",
          };
        });
  
        setMappings(normalizedMappings);
  
        const allResponses = loadedMappings.flatMap((m) => m.responses || []);
        console.log("📦 Collected all responses:", allResponses);
        setResponses(allResponses);
  
        const loadedScenarios = await fetchScenarios();
        console.log("📦 Loaded scenarios:", loadedScenarios);
        setScenarios(loadedScenarios);

        // ✅ Säkerställ att currentScenario alltid har en mappings-array
        setCurrentScenario(
          loadedScenarios[0]
            ? {
                ...loadedScenarios[0],
                mappings: loadedScenarios[0].mappings || [],
              }
            : null
        );
  
        const matchedScenario = scenarios.find((s) => s.id == scenarioId);
        console.log("🎯 Matched Scenario by ID:", matchedScenario);
  
        if (matchedScenario) {
          const enrichedMappings = matchedScenario.mappings.map((entry) => {
            const { request, response } = entry;
            console.log("🔁 Processing mapping from scenario:", entry);
  
            const enriched = {
              id: request?.id || entry.reqId,
              request: {
                ...request,
                reqJson: request,
              },
              responses: response
                ? [
                    {
                      id: response.id,
                      resId: response.id,
                      reqId: request.id,
                      resJson: response,
                      title: response.title,
                    },
                  ]
                : [],
            };
  
            console.log("✅ Enriched mapping:", enriched);
            return enriched;
          });
  
          console.log("🧩 Final enriched scenario mappings:", enrichedMappings);
          setAddedMappings(new Set(enrichedMappings.map((m) => m.id)));
  
          setCurrentScenario({
            ...matchedScenario,
            mappings: enrichedMappings,
          });
        } else {
          console.warn("⚠️ No matched scenario found");
          setCurrentScenario(null);
        }
      } catch (error) {
        console.error("❌ Error loading data in useEffect:", error);
      }
    };
  
    loadData();
  }, []);
  
  useEffect(() => {
    if (scenarios.length === 0) return;
  
    console.log("🧩 Searching for scenario:", scenarioId);
    const matchedScenario = scenarios.find((s) => s.id === parseInt(scenarioId));
    console.log("🎯 Matched Scenario by ID:", matchedScenario);
  
    if (matchedScenario) {
      const enrichedMappings = matchedScenario.mappings.map((entry) => {
        const { request, response } = entry;
        const enriched = {
          id: request?.id || entry.reqId,
          request: {
            ...request,
            reqJson: request,
          },
          responses: response
            ? [
                {
                  id: response.id,
                  resId: response.id,
                  reqId: request.id,
                  resJson: response,
                  title: response.title,
                },
              ]
            : [],
        };
        return enriched;
      });
  
      setAddedMappings(new Set(enrichedMappings.map((m) => m.id)));
      setCurrentScenario({ ...matchedScenario, mappings: enrichedMappings });
    } else {
      console.warn("⚠️ No matched scenario found for ID:", scenarioId);
      setCurrentScenario(null);
    }
  }, [scenarios, scenarioId]);
  
  
  
  const toggleMappingDropdownLeft = (id) => {
    setExpandMappingIdLeft((prev) => (prev === id ? null : id));
  };

  const toggleMappingDropdownRight = (id) => {
    setExpandMappingIdRight((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    console.log("Updated scenarios:", scenarios);
  }, [scenarios]);

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

  const handleSaveScenario = async () => {
    if (!currentScenario) return;

    console.log("Current scenario before saving:", currentScenario);

    const newScenarioData = {
  
    const scenarioPayload = {
      name: currentScenario.name,
      mappings: currentScenario.mappings.map((mapping) => ({
        reqId: mapping.id,
        resId: responses.find((res) => res.reqId === mapping.id)?.resId || null,
      })),
    };

    console.log("Scenario data being saved:", newScenarioData);

    const savedScenario = await saveScenario(newScenarioData);
    if (savedScenario) {
  
    let saved;
    if (currentScenario.id) {
      saved = await updateScenario(currentScenario.id, scenarioPayload);
    } else {
      saved = await saveScenario(scenarioPayload);
    }
  
    if (saved) {
      alert("Scenario saved successfully!");
      setCurrentScenario(saved); // Refresh local state with latest backend data
    }
  };

  const handleDropOnDropZone = (e) => {
    e.preventDefault();
    setHighlighted(false);

    const jsonData = e.dataTransfer.getData("application/json");
    if (!jsonData) return;
    const droppedMapping = JSON.parse(jsonData);

    setCurrentScenario((prevScenario) => {
      if (!prevScenario) return prevScenario;
      if (prevScenario.mappings.some((m) => m.id === droppedMapping.id)) {
        return prevScenario;
      }

      return {
        ...prevScenario,
        mappings: [...prevScenario.mappings, droppedMapping],
      };
    });

    setMappings((prevMappings) => {
      return prevMappings.filter((m) => m.id !== droppedMapping.id);
    });

    setAddedMappings((prevAdded) => {
      const newAdded = new Set(prevAdded);
      newAdded.add(droppedMapping.id);
      return newAdded;
    });
  };

  console.log("CurrentScenario:", currentScenario)

  return (
    <div className={styles.container}>
      <div
        className={styles.leftPanel}
        onDragOver={handleDragOverDropZone}
        onDragLeave={handleDragLeaveDropZone}
        onDrop={handleDropOnDropZone}
        style={{ background: highlighted ? "#e6f7ff" : "transparent" }}
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
          expandId={expandMappingIdLeft}
          onToggleExpand={toggleMappingDropdownLeft}
          draggingMappingId={draggingMappingId}
          handleDragStartMapping={handleDragStartMapping}
          handleDragEndMapping={handleDragEndMapping}
          handleRemoveMapping={handleRemoveMappingFromScenario}
        />
        <button className={styles.button} onClick={handleSaveScenario}>
          Save Scenario
        </button>
      </div>

      <div className={styles.rightPanel}>
        <h2>Saved Mappings</h2>
        <ScenarioMappingList
          mappings={mappings.filter(
            (mapping) => !addedMappings.has(mapping.id)
          )}
         mappings={
          mappings.length && addedMappings.size
            ? mappings.filter((m) => !addedMappings.has(m.id))
            : mappings
        }
          responses={responses}
          expandId={expandMappingIdRight}
          onToggleExpand={toggleMappingDropdownRight}
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
