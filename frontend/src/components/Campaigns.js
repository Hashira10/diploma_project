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
  const [platform, setPlatform] = useState("facebook");
  const [generating, setGenerating] = useState(false);
  const [customHost, setCustomHost] = useState("");


  const getPlatformLinks = (host) => ({
    facebook: `${host}/track/{recipient_id}/{message_id}/facebook/`,
    instagram: `${host}/track/{recipient_id}/{message_id}/instagram/`,
    google: `${host}/track/{recipient_id}/{message_id}/google/`,
    microsoft: `${host}/track/{recipient_id}/{message_id}/microsoft/`
  });


  const replaceLinksInMessage = (message, platform, recipientId, messageId) => {
    const links = getPlatformLinks(customHost || API_BASE_URL);
    const templateLink = links[platform]
      ? links[platform].replace("{recipient_id}", recipientId).replace("{message_id}", messageId)
      : "#";

  
    return message
      .replace(/\[.*?\]\(http.*?\)/g, `[Verify Your Account](${templateLink})`) 
      .replace(/http:\/\/[^\s]+/g, templateLink); 
  };
  
  
  


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

  const handleGenerateMessage = async () => {
    setGenerating(true);
    try {
      console.log("Отправка запроса на:", `${API_BASE_URL}/generate/`);
      const response = await fetch(`${API_BASE_URL}/generate/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
  
      const data = await response.json();
      console.log("Ответ API:", data);
  
      if (response.ok) {
        const fullMessage = data.phishing_email;
  
        // Разбираем сообщение
        const subjectMatch = fullMessage.match(/^Subject:\s*(.*)/m); // Находим строку с "Subject:"
        const extractedSubject = subjectMatch ? subjectMatch[1].trim() : "No Subject"; // Извлекаем текст после "Subject:"
        const bodyText = fullMessage.replace(/^Subject:.*\n/, "").trim(); // Убираем строку "Subject:" из текста
  
        setSubject(extractedSubject);
        setBody(bodyText);
  
        setMessage({ text: "Message generated successfully!", severity: "success" });
      } else {
        setMessage({ text: "Failed to generate message.", severity: "error" });
      }
    } catch (error) {
      console.error("Ошибка при запросе:", error);
      setMessage({ text: "Error generating message!", severity: "error" });
    } finally {
      setGenerating(false);
      setOpenSnackbar(true);
    }
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
  
    if (!campaignName || !selectedSender || !selectedGroup || !subject || !body) {
      setMessage({ text: "All fields are required!", severity: "warning" });
      setOpenSnackbar(true);
      return;
    }
  
    setSending(true);
  
    try {
      const previewResponse = await fetch(`${API_BASE_URL}/api/messages/preview/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: selectedSender,
          recipient_group: selectedGroup,
          campaign_name: campaignName,
          subject,
          body,
          platform,
          host: customHost || API_BASE_URL
        }),
      });
  
      const previewData = await previewResponse.json();
      if (!previewResponse.ok) {
        throw new Error(previewData.detail || "Error getting message preview");
      }
  
      const updatedBody = replaceLinksInMessage(body, platform, previewData.recipient_id, previewData.message_id, customHost || API_BASE_URL);

      const finalResponse = await fetch(`${API_BASE_URL}/api/messages/send_message/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: selectedSender,
          recipient_group: selectedGroup,
          campaign_name: campaignName,
          subject,
          body: updatedBody,  // <-- Теперь body с правильными ссылками
          platform
        }),
      });
  
      const finalData = await finalResponse.json();
      if (!finalResponse.ok) {
        throw new Error(finalData.detail || "Error sending message");
      }
  
      setMessage({ text: "Message sent successfully!", severity: "success" });
      setCampaignName("");
      setSubject("");
      setBody("");
      setUseTemplate(false);
    } catch (error) {
      setMessage({ text: `Error: ${error.message}`, severity: "error" });
    } finally {
      setSending(false);
      setOpenSnackbar(true);
    }
  };
  
  
  
  return (
    <Container maxWidth="md" sx={{ marginBottom: 8 }}>
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
              <TextField
                label="Body"
                fullWidth
                multiline
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                disabled={sending}
                sx={{ minHeight: "200px" }}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleGenerateMessage}
                  disabled={generating || sending}
                  sx={{
                    background: generating ? "gray" : "linear-gradient(135deg, #011843,rgb(127, 161, 220))",
                    color: "#fff",
                    "&:hover": { background: generating ? "gray" : "linear-gradient(135deg, #01102c,rgb(137, 174, 216))" }
                  }}
                >
                  {generating ? (
                    <>
                      <CircularProgress size={20} sx={{ color: "white", marginRight: 1 }} /> Generating...
                    </>
                  ) : (
                    "Generate Message"
                  )}
                </Button>
              </Box>
            </Grid>


            <Grid item xs={12}>
              <FormControl fullWidth>
                  <InputLabel>Platform</InputLabel>
                  <Select value={platform} onChange={(e) => setPlatform(e.target.value)} disabled={sending}>
                      <MenuItem value="facebook">Facebook</MenuItem>
                      <MenuItem value="instagram">Instagram</MenuItem>
                      <MenuItem value="google">Google</MenuItem>
                      <MenuItem value="microsoft">Microsoft</MenuItem>
                  </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField 
                label="Custom Host (optional)" 
                fullWidth 
                value={customHost} 
                onChange={(e) => setCustomHost(e.target.value)} 
                disabled={sending} 
              />
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