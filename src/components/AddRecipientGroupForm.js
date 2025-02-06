import React, { useState } from "react";
import axios from "axios";

const AddRecipientGroupForm = () => {
  const [groupName, setGroupName] = useState("");
  const [recipients, setRecipients] = useState([
    { firstName: "", lastName: "", email: "", position: "" },
  ]);

  const handleRecipientChange = (index, field, value) => {
    const updatedRecipients = [...recipients];
    updatedRecipients[index][field] = value;
    setRecipients(updatedRecipients);
  };

  const addRecipient = () => {
    setRecipients([
      ...recipients,
      { firstName: "", lastName: "", email: "", position: "" },
    ]);
  };

  const removeRecipient = (index) => {
    const updatedRecipients = recipients.filter((_, i) => i !== index);
    setRecipients(updatedRecipients);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const groupData = {
      name: groupName,
      recipients: recipients.map((r) => ({
        first_name: r.firstName,
        last_name: r.lastName,
        email: r.email,
        position: r.position,
      })),
    };

    try {
      await axios.post("http://127.0.0.1:8000/api/recipient_groups/", groupData);
      alert("Recipient group added successfully!");
      setGroupName("");
      setRecipients([{ firstName: "", lastName: "", email: "", position: "" }]);
    } catch (error) {
      console.error("Error adding recipient group:", error.response?.data || error.message);
      alert("Failed to add recipient group");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Recipient Group</h2>

      <div>
        <label>Group Name:</label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
        />
      </div>

      <h3>Recipients:</h3>
      {recipients.map((recipient, index) => (
        <div key={index} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
          <label>First Name:</label>
          <input
            type="text"
            value={recipient.firstName}
            onChange={(e) =>
              handleRecipientChange(index, "firstName", e.target.value)
            }
            required
          />

          <label>Last Name:</label>
          <input
            type="text"
            value={recipient.lastName}
            onChange={(e) =>
              handleRecipientChange(index, "lastName", e.target.value)
            }
            required
          />

          <label>Email:</label>
          <input
            type="email"
            value={recipient.email}
            onChange={(e) =>
              handleRecipientChange(index, "email", e.target.value)
            }
            required
          />

          <label>Position:</label>
          <input
            type="text"
            value={recipient.position}
            onChange={(e) =>
              handleRecipientChange(index, "position", e.target.value)
            }
            required
          />

          <button type="button" onClick={() => removeRecipient(index)}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={addRecipient}>
        Add Recipient
      </button>

      <button type="submit">Submit</button>
    </form>
  );
};

export default AddRecipientGroupForm;
