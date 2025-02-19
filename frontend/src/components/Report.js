import React, { useEffect, useState } from "react";
import { CircularProgress, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Alert, Button, Grid } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

          // Получаем уникальных пользователей, которые ввели данные
          const uniqueCredentialUsers = new Set(
            credentialData
              .filter(log => groupRecipients.some(rec => rec.id === log.recipient?.id))
              .map(log => log.recipient?.id)
          );

          groupedData[group.id] = {
            name: group.name,
            totalRecipients: groupRecipients.length,
            uniqueClickUsers: uniqueClickUsers.size, // Количество уникальных пользователей, кликнувших по ссылке
            uniqueCredentialUsers: uniqueCredentialUsers.size, // Количество уникальных пользователей, вводивших данные
            clickLogs: clickData.filter(log => uniqueClickUsers.has(log.recipient?.id)),
            credentialLogs: credentialData.filter(log => uniqueCredentialUsers.has(log.recipient?.id))
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

  return (
    <Container sx={{ marginBottom: 8 }}>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <>
          <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
            Groups
          </Typography>
          {groups.map((group) => (
            <Button key={group.id} variant="contained" onClick={() => setSelectedGroup(group.id)} sx={{ marginRight: 2 }}>
              {group.name}
            </Button>
          ))}

          {selectedGroup && groupedLogs[selectedGroup] && (
            <>
              <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
                Report for Group: {groupedLogs[selectedGroup].name}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" align="center">Unique Clicks</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Clicked", value: groupedLogs[selectedGroup].uniqueClickUsers },
                          { name: "Not Clicked", value: groupedLogs[selectedGroup].totalRecipients - groupedLogs[selectedGroup].uniqueClickUsers }
                        ]}
                        cx="50%" cy="50%" outerRadius={100} fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        <Cell key="clicked" fill="#82ca9d" />
                        <Cell key="not-clicked" fill="#d0d0d0" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>


                <Grid item xs={12} md={6}>
                  <Typography variant="h6" align="center">Unique Credential Submissions</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Submitted", value: groupedLogs[selectedGroup].uniqueCredentialUsers },
                          { name: "Not Submitted", value: groupedLogs[selectedGroup].totalRecipients - groupedLogs[selectedGroup].uniqueCredentialUsers }
                        ]}
                        cx="50%" cy="50%" outerRadius={100} fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        <Cell key="submitted" fill="#ff7f50" />
                        <Cell key="not-submitted" fill="#d0d0d0" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>

              {/* Основной отчет в виде таблицы */}
              <Typography variant="h5" gutterBottom>
                Click Logs
              </Typography>
              <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>First Name</strong></TableCell>
                      <TableCell><strong>Last Name</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Timestamp</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupedLogs[selectedGroup].clickLogs.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell>{log.recipient?.first_name || "Unknown"}</TableCell>
                        <TableCell>{log.recipient?.last_name || "Unknown"}</TableCell>
                        <TableCell>{log.recipient?.email || "Unknown"}</TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h5" gutterBottom>
                Credential Logs
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>First Name</strong></TableCell>
                      <TableCell><strong>Last Name</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Timestamp</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupedLogs[selectedGroup].credentialLogs.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell>{log.recipient?.first_name || "Unknown"}</TableCell>
                        <TableCell>{log.recipient?.last_name || "Unknown"}</TableCell>
                        <TableCell>{log.recipient?.email || "Unknown"}</TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default Report;



