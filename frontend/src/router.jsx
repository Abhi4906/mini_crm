import React from "react";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Customers from "./pages/Customers.jsx";
import CustomerForm from "./pages/CustomerForm.jsx";
import CustomerDetail from "./pages/CustomerDetail.jsx";
import LeadForm from "./pages/LeadForm.jsx";
import Reports from "./pages/Reports.jsx";

const router = [
  { path: "/", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: "/dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: "/customers", element: <ProtectedRoute><Customers /></ProtectedRoute> },
  { path: "/customers/new", element: <ProtectedRoute><CustomerForm /></ProtectedRoute> },
  { path: "/customers/edit/:id", element: <ProtectedRoute><CustomerForm edit /></ProtectedRoute> },
  { path: "/customers/:id", element: <ProtectedRoute><CustomerDetail /></ProtectedRoute> },
  { path: "/leads/new/:customerId", element: <ProtectedRoute><LeadForm /></ProtectedRoute> },
  { path: "/reports", element: <ProtectedRoute><Reports /></ProtectedRoute> },

  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
];

export default router;
