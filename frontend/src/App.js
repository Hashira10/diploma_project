import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AddSenderForm from "./components/AddSenderForm";
import AddRecipientGroupForm from "./components/AddRecipientGroupForm";
import SenderList from "./components/SenderList";
import EditSenderForm from "./components/EditSenderForm";
import RecipientGroupList from "./components/RecipientGroupList";
import RecipientList from "./components/RecipientList";
import EditRecipientForm from "./components/EditRecipientForm";
import SendMessageForm from "./components/SendMessageForm"; 
import Report from "./components/Report";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div>
        <h1>Email System</h1>
        <nav>
          <ul>
            <li><a href="/">Add Sender</a></li>
            <li><a href="/senders">Sender List</a></li>
            <li><a href="/add-recipient-group">Add Recipient Group</a></li>
            <li><a href="/recipient-groups">Recipient Group List</a></li>
            <li><a href="/send-message">Send Message</a></li> 
            <li><a href="/report">Report</a></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<AddSenderForm />} />
          <Route path="/senders" element={<SenderList />} />
          <Route path="/edit-sender/:senderId" element={<EditSenderForm />} />
          <Route path="/add-recipient-group" element={<AddRecipientGroupForm />} />
          <Route path="/recipient-groups" element={<RecipientGroupList />} />
          <Route path="/recipient-groups/:groupId" element={<RecipientList />} />
          <Route path="/edit-recipient/:recipientId" element={<EditRecipientForm />} />
          <Route path="/send-message" element={<SendMessageForm />} /> 
          <Route path="/report" element={<Report />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
