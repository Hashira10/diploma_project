import React, { useState, useEffect } from "react";
import { Container, Paper, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Button, Grid, Snackbar, Alert, Box } from "@mui/material";

const SendMessageForm = () => {
  const [senders, setSenders] = useState([]);
  const [recipientGroups, setRecipientGroups] = useState([]);
  const [selectedSender, setSelectedSender] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [useTemplate, setUseTemplate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sendersRes, groupsRes] = await Promise.all([
          fetch("http://localhost:8000/api/senders/"),
          fetch("http://localhost:8000/api/recipient_groups/")
        ]);

        const sendersData = await sendersRes.json();
        const groupsData = await groupsRes.json();

        setSenders(sendersData);
        setRecipientGroups(groupsData);
      } catch (error) {
        setMessage({ text: "Error fetching data!", severity: "error" });
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!selectedSender || !selectedGroup || !subject || !body) {
      setMessage({ text: "All fields are required!", severity: "warning" });
      setOpenSnackbar(true);
      return;
    }

    const messageData = {
      sender: selectedSender,
      recipient_group: selectedGroup,
      subject,
      body,
      use_template: useTemplate,
    };

    try {
      const response = await fetch("http://localhost:8000/api/messages/send_message/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      const data = await response.json();

      if (data.detail) {
        setMessage({ text: `Error: ${data.detail}`, severity: "error" });
      } else {
        setMessage({ text: "Message sent successfully!", severity: "success" });
        setSubject("");
        setBody("");
        setUseTemplate(false);
      }
    } catch (error) {
      setMessage({ text: "Error sending message!", severity: "error" });
    } finally {
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginBottom: 8 }}>
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
        <Typography variant="h5" gutterBottom>
          Send Message
        </Typography>
        <form onSubmit={handleSendMessage}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Sender</InputLabel>
                <Select value={selectedSender} onChange={(e) => setSelectedSender(e.target.value)} disabled={loading}>
                  <MenuItem value="">Select Sender</MenuItem>
                  {senders.map((sender) => (
                    <MenuItem key={sender.id} value={sender.id}>
                      {sender.smtp_username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Recipient Group</InputLabel>
                <Select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} disabled={loading}>
                  <MenuItem value="">Select Recipient Group</MenuItem>
                  {recipientGroups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField label="Subject" fullWidth value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Body" fullWidth multiline rows={4} value={body} onChange={(e) => setBody(e.target.value)} required />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox checked={useTemplate} onChange={(e) => setUseTemplate(e.target.checked)} />} label="Attach Login Template" />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                sx={{ 
                  width: "180px", // Smaller Button
                    height: "36px", // Reduced Height
                    fontSize: "0.875rem", // Smaller Font
                  background: "linear-gradient(135deg, #011843,rgb(127, 161, 220))", // Gradient Background
                  color: "#fff", // White Text for contrast
                  "&:hover": { background: "linear-gradient(135deg, #01102c,rgb(137, 174, 216))" } // Slightly darker gradient on hover
              }}
              >
                Send Message
              </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity={message.severity} onClose={() => setOpenSnackbar(false)}>
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SendMessageForm;

