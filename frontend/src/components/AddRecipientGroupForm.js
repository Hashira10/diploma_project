import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const AddRecipientGroupForm = () => {
  const [groupName, setGroupName] = useState("");
  const [recipients, setRecipients] = useState([
    { firstName: "", lastName: "", email: "", position: "" },
  ]);
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleRecipientChange = (index, field, value) => {
    const updatedRecipients = [...recipients];
    updatedRecipients[index][field] = value;
    setRecipients(updatedRecipients);
  };

  const addRecipient = () => {
    setRecipients([...recipients, { firstName: "", lastName: "", email: "", position: "" }]);
  };

  const removeRecipient = (index) => {
    const updatedRecipients = recipients.filter((_, i) => i !== index);
    setRecipients(updatedRecipients);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const groupData = {
      name: groupName,
      recipients: recipients.map((r) => ({
        first_name: r.firstName,
        last_name: r.lastName,
        email: r.email,
        position: r.position,
      })),
    };

    try {
      await axios.post("http://127.0.0.1:8000/api/recipient_groups/", groupData);
      setMessage({ text: "Recipient group added successfully!", severity: "success" });
      setGroupName("");
      setRecipients([{ firstName: "", lastName: "", email: "", position: "" }]);
    } catch (error) {
      console.error("Error adding recipient group:", error.response?.data || error.message);
      setMessage({ text: "Failed to add recipient group.", severity: "error" });
    }
    setOpenSnackbar(true);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add Recipient Group
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Group Name"
            fullWidth
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            sx={{ marginBottom: 2 }}
          />

          <Typography variant="h6">Recipients</Typography>

          {recipients.map((recipient, index) => (
            <Paper key={index} elevation={2} sx={{ padding: 2, marginBottom: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="First Name"
                    fullWidth
                    value={recipient.firstName}
                    onChange={(e) => handleRecipientChange(index, "firstName", e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    value={recipient.lastName}
                    onChange={(e) => handleRecipientChange(index, "lastName", e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={recipient.email}
                    onChange={(e) => handleRecipientChange(index, "email", e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={10}>
                  <TextField
                    label="Position"
                    fullWidth
                    value={recipient.position}
                    onChange={(e) => handleRecipientChange(index, "position", e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={2} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconButton onClick={() => removeRecipient(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}

          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                startIcon={<AddCircleIcon />}
                onClick={addRecipient}
                sx={{
                  width: "100%",
                  borderColor: "#011843",
                  color: "#011843",
                  "&:hover": { background: "linear-gradient(135deg, #011843, #bac8e0)", color: "#fff" },
                }}
              >
                Add Recipient
              </Button>
            </Grid>

            <Grid item xs={6}>
              <Button 
                type="submit" 
                variant="contained" 
                sx={{ 
                  width: "100%",
                  background: "linear-gradient(135deg, #011843,rgb(127, 161, 220))", // Gradient Background
                  color: "#fff", // White Text for contrast
                  "&:hover": { background: "linear-gradient(135deg, #01102c,rgb(137, 174, 216))" } // Slightly darker gradient on hover
              }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
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

export default AddRecipientGroupForm;
