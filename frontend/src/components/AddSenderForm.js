import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert
} from "@mui/material";

const AddSenderForm = () => {
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const senderData = {
      smtp_host: smtpHost,
      smtp_port: smtpPort,
      smtp_username: smtpUsername,
      smtp_password: smtpPassword,
    };

    try {
      await axios.post("http://127.0.0.1:8000/api/senders/", senderData);

      setMessage({ text: "Sender added successfully!", severity: "success" });
      setSmtpHost("");
      setSmtpPort("");
      setSmtpUsername("");
      setSmtpPassword("");
    } catch (error) {
      console.error("Error adding sender:", error);
      setMessage({ text: "Failed to add sender", severity: "error" });
    }
    setOpenSnackbar(true);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add Sender
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="SMTP Host"
            fullWidth
            value={smtpHost}
            onChange={(e) => setSmtpHost(e.target.value)}
            required
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="SMTP Port"
            type="number"
            fullWidth
            value={smtpPort}
            onChange={(e) => setSmtpPort(e.target.value)}
            required
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="SMTP Username"
            fullWidth
            value={smtpUsername}
            onChange={(e) => setSmtpUsername(e.target.value)}
            required
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="SMTP Password"
            type="password"
            fullWidth
            value={smtpPassword}
            onChange={(e) => setSmtpPassword(e.target.value)}
            required
            sx={{ marginBottom: 2 }}
          />

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Add Sender
          </Button>
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

export default AddSenderForm;
