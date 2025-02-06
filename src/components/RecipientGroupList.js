import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RecipientGroupList = () => {
  const [recipientGroups, setRecipientGroups] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/recipient_groups/')
      .then(response => {
        setRecipientGroups(response.data);
      })
      .catch(error => {
        console.error('Error fetching recipient groups:', error);
      });
  }, []);

  return (
    <div>
      <h2>Recipient Group List</h2>
      <ul>
        {recipientGroups.map(group => (
          <li key={group.id}>
            <Link to={`/recipient-groups/${group.id}`}>
              {group.name} - {group.recipients.length} recipients
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecipientGroupList;
