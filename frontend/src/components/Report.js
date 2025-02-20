import React, { useEffect, useState } from "react";
import { CircularProgress, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Alert, Button, Grid } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const Report = () => {
  const [groups, setGroups] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [credentialLogs, setCredentialLogs] = useState([]);
  const [groupedLogs, setGroupedLogs] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupResponse, clickResponse, credentialResponse] = await Promise.all([
          fetch("http://localhost:8000/api/recipient_groups/"),
          fetch("http://localhost:8000/api/click_logs/"),
          fetch("http://localhost:8000/api/credential_logs/")
        ]);

        if (!groupResponse.ok || !clickResponse.ok || !credentialResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [groupData, clickData, credentialData] = await Promise.all([
          groupResponse.json(),
          clickResponse.json(),
          credentialResponse.json()
        ]);

        setGroups(groupData);
        setClickLogs(clickData);
        setCredentialLogs(credentialData);

        const groupedData = {};
        groupData.forEach((group) => {
          const groupRecipients = group.recipients || [];

          const uniqueClickUsers = new Set(
            clickData
              .filter(log => groupRecipients.some(rec => rec.id === log.recipient?.id))
              .map(log => log.recipient?.id)
          );

          const uniqueCredentialUsers = new Set(
            credentialData
              .filter(log => groupRecipients.some(rec => rec.id === log.recipient?.id))
              .map(log => log.recipient?.id)
          );

          groupedData[group.id] = {
            name: group.name,
            totalRecipients: groupRecipients.length,
            uniqueClickUsers: uniqueClickUsers.size,
            uniqueCredentialUsers: uniqueCredentialUsers.size,
          };
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

  const COLORS = ["#354d78", "#7f9acd"]; // ✅ Обновленные цвета графиков

  return (
    <Container maxWidth="lg" sx={{ marginBottom: 8 }}>
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: "bold", marginBottom: 3 }}>
          Report Overview
        </Typography>

        {loading && <CircularProgress sx={{ display: "block", margin: "20px auto" }} />}
        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <>
            <Typography variant="h6" align="center" sx={{ marginBottom: 2 }}>
              Select a Group:
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {groups.map((group) => (
                <Grid item key={group.id}>
                  <Button
                    variant="contained"
                    onClick={() => setSelectedGroup(group.id)}
                    sx={{
                      background: "#354d78",
                      color: "#fff",
                      "&:hover": { background: "linear-gradient(135deg, #01102c, #9fb7d3)" }
                    }}
                  >
                    {group.name}
                  </Button>
                </Grid>
              ))}
            </Grid>

            {selectedGroup && groupedLogs[selectedGroup] && (
              <>
                <Typography variant="h5" align="center" sx={{ marginTop: 4 }}>
                  Report for Group: {groupedLogs[selectedGroup].name}
                </Typography>

                <Grid container spacing={3} sx={{ marginTop: 2 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" align="center">User Interactions</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { name: "Clicked", value: groupedLogs[selectedGroup].uniqueClickUsers },
                        { name: "Not Clicked", value: groupedLogs[selectedGroup].totalRecipients - groupedLogs[selectedGroup].uniqueClickUsers },
                        { name: "Submitted", value: groupedLogs[selectedGroup].uniqueCredentialUsers },
                        { name: "Not Submitted", value: groupedLogs[selectedGroup].totalRecipients - groupedLogs[selectedGroup].uniqueCredentialUsers }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#354d78" /> {/* ✅ Темно-синий цвет графика */}
                      </BarChart>
                    </ResponsiveContainer>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" align="center">Click vs Submission Distribution</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={[
                          { name: "Clicked", value: groupedLogs[selectedGroup].uniqueClickUsers },
                          { name: "Submitted", value: groupedLogs[selectedGroup].uniqueCredentialUsers }
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

                {/* ✅ Таблица отчета */}
                <Typography variant="h6" sx={{ marginTop: 4 }}>
                  Summary Table
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Group Name</strong></TableCell>
                        <TableCell><strong>Total Recipients</strong></TableCell>
                        <TableCell><strong>Clicked (%)</strong></TableCell>
                        <TableCell><strong>Submitted (%)</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{groupedLogs[selectedGroup].name}</TableCell>
                        <TableCell>{groupedLogs[selectedGroup].totalRecipients}</TableCell>
                        <TableCell>{((groupedLogs[selectedGroup].uniqueClickUsers / groupedLogs[selectedGroup].totalRecipients) * 100).toFixed(2)}%</TableCell>
                        <TableCell>{((groupedLogs[selectedGroup].uniqueCredentialUsers / groupedLogs[selectedGroup].totalRecipients) * 100).toFixed(2)}%</TableCell>
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




