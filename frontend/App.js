import React from "react";
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import AddSenderForm from "./components/AddSenderForm";
import AddRecipientGroupForm from "./components/AddRecipientGroupForm";
import SenderList from "./components/SenderList";
import EditSenderForm from "./components/EditSenderForm";
import RecipientGroupList from "./components/RecipientGroupList";
import RecipientList from "./components/RecipientList";
import EditRecipientForm from "./components/EditRecipientForm";
import Campaigns from "./components/Campaigns"; 
import Report from "./components/Report";
import "./App.css";

const App = () => {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
};

const MainLayout = () => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Add Sender";
      case "/senders":
        return "Sender List";
      case "/edit-sender/:senderId":
        return "Edit Sender";
      case "/add-recipient-group":
        return "Add Recipient Group";
      case "/recipient-groups":
        return "Recipient Group List";
      case "/send-message":
        return "Campaigns";
      case "/report":
        return "Report";
      default:
        return "Email System";
    }
  };

  return (
    <div>
      <h1>{getPageTitle()}</h1>
      
      <nav>
        <ul>
          <li><Link to="/">Add Sender</Link></li>
          <li><Link to="/senders">Sender List</Link></li>
          <li><Link to="/add-recipient-group">Add Recipient Group</Link></li>
          <li><Link to="/recipient-groups">Recipient Group List</Link></li>
          <li><Link to="/send-message">Campaigns</Link></li> 
          <li><Link to="/report">Report</Link></li>
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
        <Route path="/send-message" element={<Campaigns />} /> 
        <Route path="/report" element={<Report />} />
      </Routes>
    </div>
  );
};

export default App;
