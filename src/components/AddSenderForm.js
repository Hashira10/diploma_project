import React, { useState } from 'react';
import axios from 'axios';

const AddSenderForm = () => {
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const senderData = { 
      smtp_host: smtpHost, 
      smtp_port: smtpPort, 
      smtp_username: smtpUsername, 
      smtp_password: smtpPassword 
    };
    
    try {
      await axios.post('/api/senders/', senderData);
      alert('Sender added successfully!');
      setSmtpHost('');
      setSmtpPort('');
      setSmtpUsername('');
      setSmtpPassword('');
    } catch (error) {
      console.error('Error adding sender:', error);
      alert('Failed to add sender');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        placeholder="SMTP Host" 
        value={smtpHost} 
        onChange={(e) => setSmtpHost(e.target.value)} 
        required 
      />
      <input 
        type="number" 
        placeholder="SMTP Port" 
        value={smtpPort} 
        onChange={(e) => setSmtpPort(e.target.value)} 
        required 
      />
      <input 
        type="text" 
        placeholder="SMTP Username" 
        value={smtpUsername} 
        onChange={(e) => setSmtpUsername(e.target.value)} 
        required 
      />
      <input 
        type="password" 
        placeholder="SMTP Password" 
        value={smtpPassword} 
        onChange={(e) => setSmtpPassword(e.target.value)} 
        required 
      />
      <button type="submit">Add Sender</button>
    </form>
  );
};

export default AddSenderForm;
