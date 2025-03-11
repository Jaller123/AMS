import React, { useState } from "react";
import styles from "./ScenarioForm.module.css";

const ScenarioForm = ({ onSave }) => {
  const [scenarioName, setScenarioName] = useState("");

  const handleSave = () => {
    if (!scenarioName.trim()) {
      alert("Please enter a title.");
      return;
    }
    onSave(scenarioName);
    setScenarioName("");
  };

  return (
    <div className={styles.scenarioFormContainer}>
      <input
        type="text"
        placeholder="Enter Scenario Title Here"
        value={scenarioName}
        onChange={(e) => setScenarioName(e.target.value)}
        className={styles.inputTitle}
      />
      <button onClick={handleSave} className={styles.button}>
        Save Scenario
      </button>
    </div>
  );
};

export default ScenarioForm;
