import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./MappingDetailPage.module.css";

const ReqDetailPage = ({ mappings, handleSaveResponse }) => {
  const { mappingId } = useParams();
  const navigate = useNavigate();

  // Find the specific request using the mapping ID
  const mapping =
    mappings.find((m) => String(m.id) === String(mappingId)) || null;

  // State for creating a new response
  const [newResponse, setNewResponse] = useState({
    status: "",
    headers: "{}",
    body: "{}",
  });

  const handleSaveNewResponse = () => {
    try {
      const parsedHeaders = JSON.parse(newResponse.headers || "{}");
      const parsedBody = JSON.parse(newResponse.body || "{}");

      handleSaveResponse(mapping?.id, {
        status: newResponse.status,
        headers: parsedHeaders,
        body: parsedBody,
      });

      setNewResponse({ status: "", headers: "{}", body: "{}" });
      alert("New response saved successfully!");
    } catch (error) {
      alert("Invalid JSON in headers or body.");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Request Details</h2>
      {!mapping ? (
        <p>No request found for ID: {mappingId}</p>
      ) : (
        <>
          <div>
            <h3>Request</h3>
            <pre>{JSON.stringify(mapping.request, null, 2)}</pre>
          </div>

          <div className={styles.formContainer}>
            <h3>Create a New Response</h3>
            <div className={styles.inputGroup}>
              <label>Status</label>
              <input
                type="text"
                value={newResponse.status}
                onChange={(e) =>
                  setNewResponse((prev) => ({ ...prev, status: e.target.value }))
                }
                placeholder="e.g., 200"
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Headers (JSON format)</label>
              <textarea
                value={newResponse.headers}
                onChange={(e) =>
                  setNewResponse((prev) => ({
                    ...prev,
                    headers: e.target.value,
                  }))
                }
                placeholder='{"Content-Type": "application/json"}'
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Body (JSON format)</label>
              <textarea
                value={newResponse.body}
                onChange={(e) =>
                  setNewResponse((prev) => ({ ...prev, body: e.target.value }))
                }
                placeholder='{"key": "value"}'
              />
            </div>
            <button onClick={handleSaveNewResponse} className={styles.saveButton}>
              Save Response
            </button>
          </div>
        </>
      )}

      <button onClick={() => navigate("/")} className={styles.backButton}>
        Back to Mappings
      </button>
    </div>
  );
};

export default ReqDetailPage;
