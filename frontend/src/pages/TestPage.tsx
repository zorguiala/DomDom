import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert,
  Snackbar,
} from "@mui/material";
// import Grid from '@mui/material/Grid';
import { Layout } from "../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";

// API endpoints
const API_BASE_URL = "http://localhost:3000/api";

export function TestPage() {
  // State for notifications
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Users section state
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "USER",
  });

  // Production Orders section state
  const [productionOrders, setProductionOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({
    name: "",
    description: "",
    status: "PENDING",
  });

  // Sales section state
  const [sales, setSales] = useState([]);
  const [newSale, setNewSale] = useState({
    customerName: "",
    amount: 0,
    paymentMethod: "CASH",
  });

  // Documents section state
  const [documents, setDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({
    title: "",
    type: "INVOICE",
    content: "",
  });

  // Employee Attendance section state
  const [attendance, setAttendance] = useState([]);
  const [newAttendance, setNewAttendance] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    status: "PRESENT",
  });

  // Inventory section state
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", quantity: 0, price: 0 });

  // Fetch data on component mount
  useEffect(() => {
    fetchUsers();
    fetchProductionOrders();
    fetchSales();
    fetchDocuments();
    fetchAttendance();
    fetchInventory();
  }, []);

  // Helper function to show notifications
  const showNotification = (message: string, severity: "success" | "error") => {
    setNotification({ open: true, message, severity });
  };

  // Users API calls
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      showNotification("Failed to fetch users", "error");
    }
  };

  const createUser = async () => {
    try {
      await axios.post(`${API_BASE_URL}/users`, newUser);
      showNotification("User created successfully", "success");
      fetchUsers();
      setNewUser({ username: "", password: "", role: "USER" });
    } catch (error) {
      showNotification("Failed to create user", "error");
    }
  };

  // Production Orders API calls
  const fetchProductionOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/production-orders`);
      setProductionOrders(response.data);
    } catch (error) {
      showNotification("Failed to fetch production orders", "error");
    }
  };

  const createProductionOrder = async () => {
    try {
      await axios.post(`${API_BASE_URL}/production-orders`, newOrder);
      showNotification("Production order created successfully", "success");
      fetchProductionOrders();
      setNewOrder({ name: "", description: "", status: "PENDING" });
    } catch (error) {
      showNotification("Failed to create production order", "error");
    }
  };

  // Sales API calls
  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sales`);
      setSales(response.data);
    } catch (error) {
      showNotification("Failed to fetch sales", "error");
    }
  };

  const createSale = async () => {
    try {
      await axios.post(`${API_BASE_URL}/sales`, newSale);
      showNotification("Sale created successfully", "success");
      fetchSales();
      setNewSale({ customerName: "", amount: 0, paymentMethod: "CASH" });
    } catch (error) {
      showNotification("Failed to create sale", "error");
    }
  };

  // Documents API calls
  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/documents`);
      setDocuments(response.data);
    } catch (error) {
      showNotification("Failed to fetch documents", "error");
    }
  };

  const createDocument = async () => {
    try {
      await axios.post(`${API_BASE_URL}/documents`, newDocument);
      showNotification("Document created successfully", "success");
      fetchDocuments();
      setNewDocument({ title: "", type: "INVOICE", content: "" });
    } catch (error) {
      showNotification("Failed to create document", "error");
    }
  };

  // Employee Attendance API calls
  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employee-attendance`);
      setAttendance(response.data);
    } catch (error) {
      showNotification("Failed to fetch attendance records", "error");
    }
  };

  const createAttendance = async () => {
    try {
      await axios.post(`${API_BASE_URL}/employee-attendance`, newAttendance);
      showNotification("Attendance record created successfully", "success");
      fetchAttendance();
      setNewAttendance({
        employeeId: "",
        date: new Date().toISOString().split("T")[0],
        status: "PRESENT",
      });
    } catch (error) {
      showNotification("Failed to create attendance record", "error");
    }
  };

  // Inventory API calls
  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory`);
      setInventory(response.data);
    } catch (error) {
      showNotification("Failed to fetch inventory", "error");
    }
  };

  const createInventoryItem = async () => {
    try {
      await axios.post(`${API_BASE_URL}/inventory`, newItem);
      showNotification("Inventory item created successfully", "success");
      fetchInventory();
      setNewItem({ name: "", quantity: 0, price: 0 });
    } catch (error) {
      showNotification("Failed to create inventory item", "error");
    }
  };

  return (
    <Layout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Backend Feature Testing
        </Typography>

        <Grid container spacing={3}>
          {/* Users Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Users Management
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Create New User
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser({ ...newUser, username: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={newUser.role}
                        label="Role"
                        onChange={(e) =>
                          setNewUser({ ...newUser, role: e.target.value })
                        }
                      >
                        <MenuItem value="USER">User</MenuItem>
                        <MenuItem value="ADMIN">Admin</MenuItem>
                        <MenuItem value="MANAGER">Manager</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={createUser}
                  >
                    Create User
                  </Button>
                </Box>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Users List
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Role</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.role}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Production Orders Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Production Orders
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Create New Production Order
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={newOrder.name}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, name: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={newOrder.status}
                        label="Status"
                        onChange={(e) =>
                          setNewOrder({ ...newOrder, status: e.target.value })
                        }
                      >
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                        <MenuItem value="COMPLETED">Completed</MenuItem>
                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={2}
                      value={newOrder.description}
                      onChange={(e) =>
                        setNewOrder({
                          ...newOrder,
                          description: e.target.value,
                        })
                      }
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={createProductionOrder}
                  >
                    Create Order
                  </Button>
                </Box>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Production Orders List
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productionOrders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.name}</TableCell>
                        <TableCell>{order.status}</TableCell>
                        <TableCell>{order.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Sales Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Sales Management
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Create New Sale
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Customer Name"
                      value={newSale.customerName}
                      onChange={(e) =>
                        setNewSale({ ...newSale, customerName: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={newSale.amount}
                      onChange={(e) =>
                        setNewSale({
                          ...newSale,
                          amount: Number(e.target.value),
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        value={newSale.paymentMethod}
                        label="Payment Method"
                        onChange={(e) =>
                          setNewSale({
                            ...newSale,
                            paymentMethod: e.target.value,
                          })
                        }
                      >
                        <MenuItem value="CASH">Cash</MenuItem>
                        <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                        <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                        <MenuItem value="CHECK">Check</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={createSale}
                  >
                    Create Sale
                  </Button>
                </Box>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Sales List
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Payment Method</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sales.map((sale: any) => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.id}</TableCell>
                        <TableCell>{sale.customerName}</TableCell>
                        <TableCell>${sale.amount.toFixed(2)}</TableCell>
                        <TableCell>{sale.paymentMethod}</TableCell>
                        <TableCell>
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Documents Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Document Management
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Create New Document
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={newDocument.title}
                      onChange={(e) =>
                        setNewDocument({
                          ...newDocument,
                          title: e.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={newDocument.type}
                        label="Type"
                        onChange={(e) =>
                          setNewDocument({
                            ...newDocument,
                            type: e.target.value,
                          })
                        }
                      >
                        <MenuItem value="INVOICE">Invoice</MenuItem>
                        <MenuItem value="BON_DE_SORTIE">Bon de Sortie</MenuItem>
                        <MenuItem value="REPORT">Report</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Content"
                      multiline
                      rows={3}
                      value={newDocument.content}
                      onChange={(e) =>
                        setNewDocument({
                          ...newDocument,
                          content: e.target.value,
                        })
                      }
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={createDocument}
                  >
                    Create Document
                  </Button>
                </Box>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Documents List
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Created At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.map((doc: any) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.id}</TableCell>
                        <TableCell>{doc.title}</TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Employee Attendance Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Employee Attendance
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Record Attendance
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Employee ID"
                      value={newAttendance.employeeId}
                      onChange={(e) =>
                        setNewAttendance({
                          ...newAttendance,
                          employeeId: e.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Date"
                      type="date"
                      value={newAttendance.date}
                      onChange={(e) =>
                        setNewAttendance({
                          ...newAttendance,
                          date: e.target.value,
                        })
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={newAttendance.status}
                        label="Status"
                        onChange={(e) =>
                          setNewAttendance({
                            ...newAttendance,
                            status: e.target.value,
                          })
                        }
                      >
                        <MenuItem value="PRESENT">Present</MenuItem>
                        <MenuItem value="ABSENT">Absent</MenuItem>
                        <MenuItem value="LATE">Late</MenuItem>
                        <MenuItem value="ON_LEAVE">On Leave</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={createAttendance}
                  >
                    Record Attendance
                  </Button>
                </Box>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Attendance Records
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Employee ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendance.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.id}</TableCell>
                        <TableCell>{record.employeeId}</TableCell>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{record.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Inventory Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Inventory Management
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Add Inventory Item
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem({ ...newItem, name: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          quantity: Number(e.target.value),
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Price"
                      type="number"
                      value={newItem.price}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={createInventoryItem}
                  >
                    Add Item
                  </Button>
                </Box>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Inventory Items
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Total Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventory.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          ${(item.quantity * item.price).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
