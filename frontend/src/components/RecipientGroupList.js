import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Select,
  MenuItem,
  TextField,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupIcon from "@mui/icons-material/Group";

const RecipientGroupList = () => {
  const [recipientGroups, setRecipientGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [recipientId, setRecipientId] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [newRecipient, setNewRecipient] = useState({ first_name: "", last_name: "", email: "", position: "" });
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/recipient_groups/")
      .then(response => setRecipientGroups(response.data))
      .catch(error => console.error("Error fetching recipient groups:", error));

    axios.get("http://127.0.0.1:8000/api/recipients/")
      .then(response => setRecipients(response.data))
      .catch(error => console.error("Error fetching recipients:", error));
  }, []);

  const handleDeleteGroup = (groupId) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      axios.delete(`http://127.0.0.1:8000/api/recipient_groups/${groupId}/`)
        .then(() => {
          setRecipientGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
          setMessage({ text: "Group deleted successfully!", severity: "success" });
          setOpenSnackbar(true);
        })
        .catch(error => {
          console.error("Error deleting recipient group:", error);
          setMessage({ text: "Error deleting group.", severity: "error" });
          setOpenSnackbar(true);
        });
    }
  };

  const handleAddRecipient = () => {
    if (!selectedGroup || !recipientId) {
      setMessage({ text: "Please select a group and a recipient.", severity: "warning" });
      setOpenSnackbar(true);
      return;
    }

    axios.post(`http://127.0.0.1:8000/api/recipient_groups/${selectedGroup}/add_recipient/`, { recipient_id: recipientId })
      .then(() => {
        setMessage({ text: "Recipient added successfully!", severity: "success" });
        setRecipientId("");
        setOpenSnackbar(true);
      })
      .catch(error => {
        console.error("Error adding recipient:", error);
        setMessage({ text: "Error adding recipient.", severity: "error" });
        setOpenSnackbar(true);
      });
  };

  const handleCreateRecipient = () => {
    if (!selectedGroup || !newRecipient.first_name || !newRecipient.last_name || !newRecipient.email || !newRecipient.position) {
      setMessage({ text: "Please fill in all fields.", severity: "warning" });
      setOpenSnackbar(true);
      return;
    }

    axios.post("http://127.0.0.1:8000/api/recipients/", newRecipient)
      .then(response => {
        const createdRecipient = response.data;
        setRecipients([...recipients, createdRecipient]);

        return axios.post(`http://127.0.0.1:8000/api/recipient_groups/${selectedGroup}/add_recipient/`, { recipient_id: createdRecipient.id });
      })
      .then(() => {
        setMessage({ text: "New recipient created and added to the group!", severity: "success" });
        setNewRecipient({ first_name: "", last_name: "", email: "", position: "" });
        setOpenSnackbar(true);
      })
      .catch(error => {
        console.error("Error creating recipient:", error);
        setMessage({ text: "Error creating recipient.", severity: "error" });
        setOpenSnackbar(true);
      });
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recipient Group List
        </Typography>

        <List>
          {recipientGroups.map(group => (
            <ListItem key={group.id} divider>
              <ListItemText primary={group.name} secondary={`${group.recipients.length} recipients`} />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDeleteGroup(group.id)} color="error">
                  <DeleteIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => setSelectedGroup(group.id)} color="primary">
                  <GroupIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {selectedGroup && (
          <Paper elevation={2} sx={{ padding: 2, marginTop: 3 }}>
            <Typography variant="h6">Manage Recipients for Group ID: {selectedGroup}</Typography>

            <Grid container spacing={2} sx={{ marginTop: 2 }}>
              <Grid item xs={12}>
                <Select value={recipientId} onChange={(e) => setRecipientId(e.target.value)} fullWidth>
                  <MenuItem value="">Select a recipient</MenuItem>
                  {recipients.map(recipient => (
                    <MenuItem key={recipient.id} value={recipient.id}>
                      {recipient.first_name} {recipient.last_name} ({recipient.email})
                    </MenuItem>
                  ))}
                </Select>
                <Button variant="contained" color="primary" onClick={handleAddRecipient} fullWidth sx={{ marginTop: 2 }}>
                  Add Recipient
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6">Create New Recipient</Typography>
                <TextField label="First Name" fullWidth value={newRecipient.first_name} onChange={(e) => setNewRecipient({ ...newRecipient, first_name: e.target.value })} sx={{ marginBottom: 2 }} />
                <TextField label="Last Name" fullWidth value={newRecipient.last_name} onChange={(e) => setNewRecipient({ ...newRecipient, last_name: e.target.value })} sx={{ marginBottom: 2 }} />
                <TextField label="Email" type="email" fullWidth value={newRecipient.email} onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })} sx={{ marginBottom: 2 }} />
                <TextField label="Position" fullWidth value={newRecipient.position} onChange={(e) => setNewRecipient({ ...newRecipient, position: e.target.value })} sx={{ marginBottom: 2 }} />
                <Button variant="contained" color="success" onClick={handleCreateRecipient} fullWidth>
                  Create & Add
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Paper>

      {/* Snackbar Notification */}
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity={message.severity} onClose={() => setOpenSnackbar(false)}>
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RecipientGroupList;
