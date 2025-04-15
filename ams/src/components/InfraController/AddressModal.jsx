import React from 'react'
import styles from './InfraController.module.css'
import { useState, useEffect } from 'react'

const AddressModal = ({ onClose, onConnect }) => {
  const [input, setInput] = useState("")

  const handleSubmit = () => {
    if (input.trim()) {
      onConnect(input.trim())
    } 
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>Connect to a Backend Address</h3>
        <input
          type="text"
          placeholder='http://localhost:8080'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={styles.input}
        />
        <div className={styles.modalActions}>
          <button onClick={handleSubmit} className={styles.modalConnectBtn}>
            Connect
          </button>
          <button onClick={onClose} className={styles.modalCloseBtn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddressModal