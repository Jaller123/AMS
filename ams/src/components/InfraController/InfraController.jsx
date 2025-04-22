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
      <div className={styles.section}>
      <h3>Infrastructure Controller</h3>
      <p>Please refresh the page for the backend/wiremock to take effect.</p>
      <div className={styles.wireMockStatus}>WireMock is currently: {wireMockPower ? "Running ✅" : "OFF ❌"} 
      <button className={styles.btn} onClick={handleToggle}>{wireMockPower ? true : false}WireMock Power</button>
      </div>
      </div>

      <div className={styles.section}>
      <div className={styles.backendPortText}>
      <h2>Backend Address</h2>
      <p><strong>Address:</strong> {backendAddress}</p>
      <p>Status: <span className={backendStatus === "Active" ? styles.active : styles.inactive}>{backendStatus}</span></p>
      <button onClick={() => setShowModal(true)} className={styles.backendBtn}>
        Connect to another backend port
      </button>
      </div>
    </div>

    {showModal && (
      <AddressModal onClose={() => setShowModal(false)} onConnect={handleConnect} />
    )}
    </div>

    
  )
}

export default InfraController