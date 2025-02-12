import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './SenderList.css';

const SenderList = () => {
  const [senders, setSenders] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/senders/')
      .then(response => {
        setSenders(response.data);
      })
      .catch(error => {
        console.error('Error fetching senders:', error);
      });
  }, []);

  const handleDeleteSender = (senderId) => {
    axios.delete(`http://127.0.0.1:8000/api/senders/${senderId}/`)
      .then(() => {
        setSenders(senders.filter(sender => sender.id !== senderId)); // Обновляем список после удаления
      })
      .catch(error => {
        console.error('Error deleting sender:', error);
      });
  };

  return (
    <div>
      <h2>Sender List</h2>
      <ul>
        {senders.map(sender => (
          <li key={sender.id}>
            {sender.smtp_username} - {sender.smtp_host}
            <button onClick={() => handleDeleteSender(sender.id)}>Delete</button>
            <Link to={`/edit-sender/${sender.id}`}>Edit</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SenderList;


