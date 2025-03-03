import React, { useState, useEffect } from "react";
import { Container, Paper, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Button, Grid, Snackbar, Alert, Box, CircularProgress } from "@mui/material";
import { API_BASE_URL } from '../config';

const Campaigns = () => {
  const [senders, setSenders] = useState([]);
  const [recipientGroups, setRecipientGroups] = useState([]);
  const [campaignName, setCampaignName] = useState("");
  const [selectedSender, setSelectedSender] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [useTemplate, setUseTemplate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sendersRes, groupsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/senders/`),
          fetch(`${API_BASE_URL}/api/recipient_groups/`)
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

    if (!campaignName || !selectedSender || !selectedGroup || !subject || !body) {
      setMessage({ text: "All fields are required!", severity: "warning" });
      setOpenSnackbar(true);
      return;
    }

    setSending(true);

    const messageData = {
      sender: selectedSender,
      recipient_group: selectedGroup,
      campaign_name: campaignName,
      subject,
      body,
      use_template: useTemplate,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/send_message/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      const data = await response.json();
      console.log("Response from API:", data);

      if (!response.ok) {
        setMessage({ text: `Error: ${data.detail || "Unknown error"}`, severity: "error" });
      } else {
        setMessage({ text: "Message sent successfully!", severity: "success" });
        setCampaignName("");
        setSubject("");
        setBody("");
        setUseTemplate(false);
      }
    } catch (error) {
      setMessage({ text: "Error sending message!", severity: "error" });
    } finally {
      setSending(false); 
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginBottom: 8 }}>
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
        <Typography variant="h5" gutterBottom>
          Send Message
        </Typography>

        <Grid item xs={12} sx={{ marginBottom: 2 }}>
          <TextField label="Campaign Name" fullWidth value={campaignName} onChange={(e) => setCampaignName(e.target.value)} required />
        </Grid>

        <form onSubmit={handleSendMessage}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Sender</InputLabel>
                <Select value={selectedSender} onChange={(e) => setSelectedSender(e.target.value)} disabled={loading || sending}>
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
                <Select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} disabled={loading || sending}>
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
              <TextField label="Subject" fullWidth value={subject} onChange={(e) => setSubject(e.target.value)} required disabled={sending} />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Body" fullWidth multiline rows={4} value={body} onChange={(e) => setBody(e.target.value)} required disabled={sending} />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox checked={useTemplate} onChange={(e) => setUseTemplate(e.target.checked)} disabled={sending} />} label="Attach Login Template" />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={sending} 
                  sx={{ 
                    width: "180px",
                    height: "36px", 
                    fontSize: "0.875rem",
                    background: sending ? "gray" : "linear-gradient(135deg, #011843,rgb(127, 161, 220))", 
                    color: "#fff", 
                    "&:hover": { background: sending ? "gray" : "linear-gradient(135deg, #01102c,rgb(137, 174, 216))" }
                  }}
                >
                  {sending ? (
                    <>
                      <CircularProgress size={20} sx={{ color: "white", marginRight: 1 }} /> Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity={message.severity} onClose={() => setOpenSnackbar(false)}>
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Campaigns;
