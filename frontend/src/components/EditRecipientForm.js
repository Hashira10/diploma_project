import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './EditRecipientForm.css';

const EditRecipientForm = () => {
  const { recipientId } = useParams(); // Получаем ID получателя из параметров URL
  const navigate = useNavigate();
  const [recipientData, setRecipientData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    position: ''
  });

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/recipients/${recipientId}/`)
      .then(response => {
        setRecipientData(response.data);
      })
      .catch(error => {
        console.error('Error fetching recipient data:', error);
      });
  }, [recipientId]); // Эта зависимость обновит данные при изменении recipientId
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipientData({ ...recipientData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Отправляем обновленные данные
    axios.put(`http://127.0.0.1:8000/api/recipients/${recipientId}/`, recipientData)
        .then(() => {
            navigate('/recipient-groups'); // Переход на страницу групп после сохранения
        })
        .catch(error => {
            console.error('Error updating recipient:', error);
        });

  };

  return (
    <div>
      <h2>Edit Recipient</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="first_name"
          value={recipientData.first_name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="last_name"
          value={recipientData.last_name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          value={recipientData.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="position"
          value={recipientData.position}
          onChange={handleChange}
        />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditRecipientForm;

