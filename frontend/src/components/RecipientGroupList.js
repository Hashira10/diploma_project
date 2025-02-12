import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './RecipientGroupList.css';

const RecipientGroupList = () => {
  const [recipientGroups, setRecipientGroups] = useState([]);

  // Загрузка данных групп получателей
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/recipient_groups/')
      .then(response => {
        setRecipientGroups(response.data);
      })
      .catch(error => {
        console.error('Error fetching recipient groups:', error);
      });
  }, []);

  // Функция для удаления группы

  const handleDeleteGroup = (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      axios.delete(`http://127.0.0.1:8000/api/recipient_groups/${groupId}/`)
        .then((response) => {
          // Успешное удаление
          console.log('Group deleted successfully');
          setRecipientGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
        })
        .catch((error) => {
          console.error('Error deleting recipient group:', error);
          if (error.response) {
            // Показываем информацию о том, что именно не так
            console.error('Error from server:', error.response.data);
          } else if (error.request) {
            // Если запрос был отправлен, но не было ответа
            console.error('No response received:', error.request);
          } else {
            // Другие ошибки
            console.error('Error setting up the request:', error.message);
          }
        });
    }
  };
  
  

  return (
    <div>
      <h2>Recipient Group List</h2>
      <ul>
        {recipientGroups.map(group => (
          <li key={group.id}>
            <Link to={`/recipient-groups/${group.id}`}>
              {group.name} - {group.recipients.length} recipients
            </Link>
            <button onClick={() => handleDeleteGroup(group.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecipientGroupList;
