import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SenderList = () => {
  const [senders, setSenders] = useState([]);

  useEffect(() => {
    axios.get('/api/senders/')
      .then(response => {
        setSenders(response.data);
      })
      .catch(error => {
        console.error('Error fetching senders:', error);
      });
  }, []);

  return (
    <div>
      <h2>Sender List</h2>
      <ul>
        {senders.map(sender => (
          <li key={sender.id}>
            {sender.smtp_username} - {sender.smtp_host}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SenderList;
