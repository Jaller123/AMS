import React from 'react'
import styles from './MockController.module.css'
import { toggleWireMock, fetchMappings} from '../../backend/api'
import { useState, useEffect } from 'react'

const MockController = () => {
  const [wireMockPower, setWireMockPower] = useState() 
  const [status, setStatus] = useState("")

  const handleToggle = async () => {
  setStatus("Toggling...");
  const result = await toggleWireMock();
  if (result.success) {
    setStatus(`WireMock is now ${result.status} ✅`);
  } else {
    setStatus("Failed to toggle WireMock ❌");
  }
  setWireMockPower(result.status === "started");  
};

useEffect(() => {
  const checkWireMockStatus = async () => {
    const result = await fetchMappings();
    setWireMockPower(result.mappings?.length > 0); 
  };
  checkWireMockStatus();
}, []);


  return (
    <div className={styles.btn}>WireMock is currently: {wireMockPower ? "Running ✅" : "OFF ❌"} 
      <button onClick={handleToggle}>{wireMockPower ? true : false}WireMock{status}</button>
    </div>
  )
}

export default MockController