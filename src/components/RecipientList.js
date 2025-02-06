import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const RecipientList = () => {
  const { groupId } = useParams(); // Получаем ID группы из параметров URL
  const [recipients, setRecipients] = useState([]);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/recipient_groups/${groupId}/`)
      .then(response => {
        setRecipients(response.data.recipients); // Получаем список получателей из выбранной группы
      })
      .catch(error => {
        console.error('Error fetching recipients:', error);
      });
  }, [groupId]);

  return (
    <div>
      <h2>Recipients in Group</h2>
      <ul>
        {recipients.map((recipient) => (
          <li key={recipient.id}>
            {recipient.first_name} {recipient.last_name} - {recipient.email} - {recipient.position}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecipientList;
