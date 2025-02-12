import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './EditSenderForm.css'; 

const EditSenderForm = () => {
  const { senderId } = useParams(); // Получаем ID отправителя из URL
  const navigate = useNavigate(); // Для редиректа после сохранения
  const [senderData, setSenderData] = useState({
    smtp_username: '',
    smtp_host: '',
    smtp_port: '',
    smtp_password: ''
  });

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/senders/${senderId}/`)
      .then(response => {
        setSenderData(response.data);
      })
      .catch(error => {
        console.error('Error fetching sender data:', error);
      });
  }, [senderId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSenderData({ ...senderData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`http://127.0.0.1:8000/api/senders/${senderId}/`, senderData)
      .then(() => {
        navigate('/senders'); // Редирект на страницу списка отправителей
      })
      .catch(error => {
        console.error('Error updating sender:', error);
      });
  };

  return (
    <div>
      <h2>Edit Sender</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="smtp_username"
          value={senderData.smtp_username}
          onChange={handleChange}
        />
        <input
          type="text"
          name="smtp_host"
          value={senderData.smtp_host}
          onChange={handleChange}
        />
        <input
          type="number"
          name="smtp_port"
          value={senderData.smtp_port}
          onChange={handleChange}
        />
        <input
          type="password"
          name="smtp_password"
          value={senderData.smtp_password}
          onChange={handleChange}
        />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditSenderForm;
