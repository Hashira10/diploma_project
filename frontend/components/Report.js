import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Button,
  Grid
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { API_BASE_URL } from '../config';

const Report = () => {
  const [messages, setMessages] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [credentialLogs, setCredentialLogs] = useState([]);
  const [groupedLogs, setGroupedLogs] = useState({});
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [messageResponse, clickResponse, credentialResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/messages/`),  
          fetch(`${API_BASE_URL}/api/click_logs/`),
          fetch(`${API_BASE_URL}/api/credential_logs/`)
        ]);
  
        if (!messageResponse.ok || !clickResponse.ok || !credentialResponse.ok) {
          throw new Error("Failed to fetch data");
        }
  
        const [messageData, clickData, credentialData] = await Promise.all([
          messageResponse.json(),
          clickResponse.json(),
          credentialResponse.json()
        ]);
  
        setMessages(messageData);
        setClickLogs(clickData);
        setCredentialLogs(credentialData);
  
        const groupedData = {};
        messageData.forEach((message) => {
          const campaign = message.campaign_name;
          if (!groupedData[campaign]) {
            groupedData[campaign] = {
              name: campaign,
              totalRecipients: 0,
              uniqueClickUsers: new Set(),
              uniqueCredentialUsers: new Set()
            };
          }
          const recipients = message.recipients || [];
  
          groupedData[campaign].totalRecipients += recipients.length;
  
          recipients.forEach((recipient) => {
            clickData.forEach(log => {
              if (log.recipient?.id === recipient.id && log.message === message.id) {  
                groupedData[campaign].uniqueClickUsers.add(recipient.id);
              }
            });
  
            credentialData.forEach(log => {
              if (log.recipient?.id === recipient.id && log.message === message.id) {  
                groupedData[campaign].uniqueCredentialUsers.add(recipient.id);
              }
            });
          });
        });
  
        Object.keys(groupedData).forEach(campaign => {
          groupedData[campaign].uniqueClickUsers = groupedData[campaign].uniqueClickUsers.size;
          groupedData[campaign].uniqueCredentialUsers = groupedData[campaign].uniqueCredentialUsers.size;
        });
  
        setGroupedLogs(groupedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  

  const COLORS = ["#7b8bff", "#242c6c"];

  return (
    <Container maxWidth="lg" sx={{ marginBottom: 8 }}>
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: "bold", marginBottom: 3 }}>
          Campaign Report Overview
        </Typography>

        {loading && <CircularProgress sx={{ display: "block", margin: "20px auto" }} />}
        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <>
            <Typography variant="h6" align="center" sx={{ marginBottom: 2 }}>
              Select a Campaign:
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {Object.keys(groupedLogs)
              .sort((a, b) => a.localeCompare(b))
              .map((campaign) => (
                <Grid item key={campaign}>
                  <Button
                    variant="contained"
                    onClick={() => setSelectedCampaign(campaign)}
                    sx={{
                      background: "#354d78",
                      color: "#fff",
                      "&:hover": { background: "linear-gradient(135deg, #01102c, #9fb7d3)" }
                    }}
                  >
                    {campaign}
                  </Button>
                </Grid>
              ))}
            </Grid>

            {selectedCampaign && groupedLogs[selectedCampaign] && (
              <>
                <Typography variant="h5" align="center" sx={{ marginTop: 4 }}>
                  Report for Campaign: {groupedLogs[selectedCampaign].name}
                </Typography>

                <Grid container spacing={3} sx={{ marginTop: 2 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" align="center">User Interactions</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { name: "Clicked", value: groupedLogs[selectedCampaign].uniqueClickUsers },
                        { name: "Not Clicked", value: groupedLogs[selectedCampaign].totalRecipients - groupedLogs[selectedCampaign].uniqueClickUsers },
                        { name: "Submitted", value: groupedLogs[selectedCampaign].uniqueCredentialUsers },
                        { name: "Not Submitted", value: groupedLogs[selectedCampaign].totalRecipients - groupedLogs[selectedCampaign].uniqueCredentialUsers }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#50d6db" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" align="center">Click vs Submission Distribution</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={[
                          { name: "Clicked", value: groupedLogs[selectedCampaign].uniqueClickUsers },
                          { name: "Submitted", value: groupedLogs[selectedCampaign].uniqueCredentialUsers }
                        ]} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>
                </Grid>

                <Typography variant="h6" sx={{ marginTop: 4 }}>
                  Summary Table
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Campaign Name</strong></TableCell>
                        <TableCell><strong>Total Recipients</strong></TableCell>
                        <TableCell><strong>Clicked (%)</strong></TableCell>
                        <TableCell><strong>Submitted (%)</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{groupedLogs[selectedCampaign].name}</TableCell>
                        <TableCell>{groupedLogs[selectedCampaign].totalRecipients}</TableCell>
                        <TableCell>{((groupedLogs[selectedCampaign].uniqueClickUsers / groupedLogs[selectedCampaign].totalRecipients) * 100).toFixed(2)}%</TableCell>
                        <TableCell>{((groupedLogs[selectedCampaign].uniqueCredentialUsers / groupedLogs[selectedCampaign].totalRecipients) * 100).toFixed(2)}%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Report;






