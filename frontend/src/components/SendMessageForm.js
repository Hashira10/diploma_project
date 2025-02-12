import React, { useState, useEffect } from "react";

const SendMessageForm = () => {
  const [senders, setSenders] = useState([]);
  const [recipientGroups, setRecipientGroups] = useState([]);
  const [selectedSender, setSelectedSender] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [useTemplate, setUseTemplate] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/senders/")
      .then((response) => response.json())
      .then((data) => setSenders(data))
      .catch((error) => console.error("Error fetching senders:", error));

    fetch("http://localhost:8000/api/recipient_groups/")
      .then((response) => response.json())
      .then((data) => setRecipientGroups(data))
      .catch((error) =>
        console.error("Error fetching recipient groups:", error)
      );
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!selectedSender || !selectedGroup || !subject || !body) {
      setMessage("All fields are required!");
      return;
    }

    const messageData = {
      sender: selectedSender,
      recipient_group: selectedGroup,
      subject,
      body,
      use_template: useTemplate, // Флаг для использования шаблона
    };

    fetch("http://localhost:8000/api/messages/send_message/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.detail) {
          setMessage(`Error: ${data.detail}`);
        } else {
          setMessage("Message sent successfully!");
          setSubject("");
          setBody("");
          setUseTemplate(false);
        }
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        setMessage("Error sending message. Check the console for details.");
      });
  };

  return (
    <div>
      <h2>Send Message</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSendMessage}>
        <label>
          Sender:
          <select
            value={selectedSender}
            onChange={(e) => setSelectedSender(e.target.value)}
          >
            <option value="">Select Sender</option>
            {senders.map((sender) => (
              <option key={sender.id} value={sender.id}>
                {sender.smtp_username}
              </option>
            ))}
          </select>
        </label>
        <br />

        <label>
          Recipient Group:
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">Select Recipient Group</option>
            {recipientGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <br />

        <label>
          Subject:
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </label>
        <br />

        <label>
          Body:
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
          ></textarea>
        </label>
        <br />

        <label>
          Attach Login Template:
          <input
            type="checkbox"
            checked={useTemplate}
            onChange={(e) => setUseTemplate(e.target.checked)}
          />
        </label>
        <br />

        <button type="submit">Send Message</button>
      </form>
    </div>
  );
};

export default SendMessageForm;
