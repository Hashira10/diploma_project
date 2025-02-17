import React, { useEffect, useState } from "react";
import { CircularProgress, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Alert } from "@mui/material";


const Report = () => {
  const [clickLogs, setClickLogs] = useState([]);
  const [credentialLogs, setCredentialLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const [clickResponse, credentialResponse] = await Promise.all([
          fetch("http://localhost:8000/api/click_logs/"),
          fetch("http://localhost:8000/api/credential_logs/")
        ]);

        if (!clickResponse.ok || !credentialResponse.ok) {
          throw new Error("Failed to fetch logs");
        }

        const [clickData, credentialData] = await Promise.all([
          clickResponse.json(),
          credentialResponse.json()
        ]);

        setClickLogs(clickData);
        setCredentialLogs(credentialData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <Container>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <>
          <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
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
                {clickLogs.map((log) => (
                  <TableRow key={log.id}>
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
                {credentialLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.recipient?.first_name || "Unknown"}</TableCell>
                    <TableCell>{log.recipient?.last_name || "Unknown"}</TableCell>
                    <TableCell>{log.email}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
};

export default Report;


