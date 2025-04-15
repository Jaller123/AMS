import React from 'react'
import AddressModal from './AddressModal'
import styles from './InfraController.module.css'
import { useBackend } from './BackendContext'
import { toggleWireMock, fetchMappings} from '../../backend/api'
import { useState, useEffect } from 'react'

const InfraController = () => {
  const { backendAddress, updateBackendAddress } = useBackend();
  const [wireMockPower, setWireMockPower] = useState() 
  const [status, setStatus] = useState("")
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [showModal, setShowModal] = useState(false)

  const checkBackend = async () => {
    try {
      const res = await fetch(`${backendAddress}/health`);
      if (!res.ok) throw new Error()
      setBackendStatus("Active"); 
    } catch {
      setBackendStatus("Inactive");
    }
  }

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
  checkBackend();
  checkWireMockStatus();
}, [backendAddress]);

const handleConnect = (newAddress) => {
  updateBackendAddress(newAddress);
  setShowModal(false);
  checkBackend();
};


  return (
    <div className={styles.container}>
      <div className={styles.btn}>WireMock is currently: {wireMockPower ? "Running ✅" : "OFF ❌"} 
      <button onClick={handleToggle}>{wireMockPower ? true : false}Restart WireMock</button>
      </div>

      <div className={styles.section}>
      <h2>Backend Address</h2>
      <p><strong>Address:</strong> {backendAddress}</p>
      <p>Status: <span className={backendStatus === "Active" ? styles.active : styles.inactive}>{backendStatus}</span></p>
      <button onClick={() => setShowModal(true)} className={styles.connectBtn}>
        Connect to another backend port
      </button>
      <button onClick={checkBackend} className={styles.restartBtn}>
        🔄 Refresh Backend
      </button>
    </div>

    {showModal && (
      <AddressModal onClose={() => setShowModal(false)} onConnect={handleConnect} />
    )}
    </div>

    
  )
}

export default InfraController