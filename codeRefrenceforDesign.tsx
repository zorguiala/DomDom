// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState } from 'react';
import { Bell, Calendar, ChevronDown, ChevronRight, ClipboardList, DollarSign, FileText, Grid, Home, Package, PieChart, Settings, ShoppingCart, User, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as echarts from 'echarts';
const App: React.FC = () => {
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const handleLogin = (e: React.FormEvent) => {
e.preventDefault();
if (username && password) {
setIsLoggedIn(true);
}
};
if (!isLoggedIn) {
return <LoginPage
username={username}
setUsername={setUsername}
password={password}
setPassword={setPassword}
handleLogin={handleLogin}
/>;
}
return <Dashboard />;
};
interface LoginPageProps {
username: string;
setUsername: (value: string) => void;
password: string;
setPassword: (value: string) => void;
handleLogin: (e: React.FormEvent) => void;
}
const LoginPage: React.FC<LoginPageProps> = ({
username,
setUsername,
password,
setPassword,
handleLogin
}) => {
return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
<div className="flex w-full max-w-5xl h-[600px] rounded-xl overflow-hidden shadow-2xl">
<div className="w-1/2 bg-cover bg-center" style={{
backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20business%20management%20system%20dashboard%20with%20blue%20and%20white%20color%20scheme%2C%20professional%20office%20environment%20with%20subtle%20technology%20elements%2C%20clean%20minimalist%20design%20for%20enterprise%20resource%20planning%20software%2C%20high%20quality%20professional%20photograph&width=720&height=600&seq=1&orientation=portrait')`
}}>
</div>
<div className="w-1/2 bg-white p-12 flex flex-col justify-center">
<div className="mb-8">
<h1 className="text-3xl font-bold text-gray-800 mb-2">Enterprise Resource System</h1>
<p className="text-gray-600">Sign in to access your dashboard</p>
</div>
<form onSubmit={handleLogin} className="space-y-6">
<div className="space-y-2">
<label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
<div className="relative">
<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<User className="h-5 w-5 text-gray-400" />
</div>
<Input
id="username"
type="text"
placeholder="Enter your username"
className="pl-10"
value={username}
onChange={(e) => setUsername(e.target.value)}
required
/>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between">
<label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
<a href="#" className="text-sm text-blue-600 hover:text-blue-500">Forgot password?</a>
</div>
<div className="relative">
<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<i className="fas fa-lock text-gray-400"></i>
</div>
<Input
id="password"
type="password"
placeholder="Enter your password"
className="pl-10"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
/>
</div>
</div>
<div>
<Button type="submit" className="w-full !rounded-button whitespace-nowrap bg-blue-600 hover:bg-blue-700">
Sign in
</Button>
</div>
</form>
<div className="mt-6 text-center">
<p className="text-sm text-gray-600">
Don't have an account? <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Contact administrator</a>
</p>
</div>
</div>
</div>
</div>
);
};
const Dashboard: React.FC = () => {
const [activeTab, setActiveTab] = useState('dashboard');
React.useEffect(() => {
// Initialize Sales Overview Chart
const salesChartElement = document.getElementById('sales-chart');
if (salesChartElement) {
const salesChart = echarts.init(salesChartElement);
const salesOption = {
animation: false,
tooltip: {
trigger: 'axis'
},
legend: {
data: ['Direct Sales', 'Commercial Sales']
},
grid: {
left: '3%',
right: '4%',
bottom: '3%',
containLabel: true
},
xAxis: {
type: 'category',
boundaryGap: false,
data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
},
yAxis: {
type: 'value'
},
series: [
{
name: 'Direct Sales',
type: 'line',
data: [120, 132, 101, 134, 90, 230, 210],
smooth: true,
lineStyle: {
width: 3,
color: '#4F46E5'
},
areaStyle: {
opacity: 0.2,
color: '#4F46E5'
}
},
{
name: 'Commercial Sales',
type: 'line',
data: [220, 182, 191, 234, 290, 330, 310],
smooth: true,
lineStyle: {
width: 3,
color: '#0EA5E9'
},
areaStyle: {
opacity: 0.2,
color: '#0EA5E9'
}
}
]
};
salesChart.setOption(salesOption);
window.addEventListener('resize', () => {
salesChart.resize();
});
}
// Initialize Inventory Status Chart
const inventoryChartElement = document.getElementById('inventory-chart');
if (inventoryChartElement) {
const inventoryChart = echarts.init(inventoryChartElement);
const inventoryOption = {
animation: false,
tooltip: {
trigger: 'item'
},
legend: {
orient: 'vertical',
left: 'left',
},
series: [
{
name: 'Inventory Status',
type: 'pie',
radius: '70%',
data: [
{ value: 1048, name: 'Raw Materials' },
{ value: 735, name: 'Work in Progress' },
{ value: 580, name: 'Finished Goods' },
{ value: 484, name: 'Packaging' }
],
emphasis: {
itemStyle: {
shadowBlur: 10,
shadowOffsetX: 0,
shadowColor: 'rgba(0, 0, 0, 0.5)'
}
},
itemStyle: {
borderRadius: 5,
borderColor: '#fff',
borderWidth: 2
}
}
]
};
inventoryChart.setOption(inventoryOption);
window.addEventListener('resize', () => {
inventoryChart.resize();
});
}
// Initialize Production Output Chart
const productionChartElement = document.getElementById('production-chart');
if (productionChartElement) {
const productionChart = echarts.init(productionChartElement);
const productionOption = {
animation: false,
tooltip: {
trigger: 'axis',
axisPointer: {
type: 'shadow'
}
},
legend: {
data: ['Planned', 'Actual']
},
grid: {
left: '3%',
right: '4%',
bottom: '3%',
containLabel: true
},
xAxis: {
type: 'value'
},
yAxis: {
type: 'category',
data: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
},
series: [
{
name: 'Planned',
type: 'bar',
data: [100, 150, 80, 200, 120],
color: '#10B981'
},
{
name: 'Actual',
type: 'bar',
data: [90, 160, 70, 180, 130],
color: '#F59E0B'
}
]
};
productionChart.setOption(productionOption);
window.addEventListener('resize', () => {
productionChart.resize();
});
}
return () => {
window.removeEventListener('resize', () => {});
};
}, []);
return (
<div className="min-h-screen bg-gray-50 flex">
{/* Sidebar */}
<div className="w-64 bg-white border-r border-gray-200 flex flex-col">
<div className="p-4 border-b border-gray-200">
<div className="flex items-center">
<img src="https://static.readdy.ai/image/3b7cc9219b209f795866107045339bd9/aa2d4b395a8e677958d5373afd5f8d39.png" alt="Dom Dom Logo" className="h-10 w-auto" />
<div className="ml-2">
<h1 className="text-xl font-bold text-[#D4AF37]">Dom Dom</h1>
<p className="text-xs text-gray-500">Enterprise Resource Planning</p>
</div>
</div>
</div>
<nav className="flex-1 overflow-y-auto py-4">
<div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
Main
</div>
<SidebarItem
icon={<Home className="h-5 w-5" />}
label="Dashboard"
isActive={activeTab === 'dashboard'}
onClick={() => setActiveTab('dashboard')}
/>
<SidebarItem
icon={<Package className="h-5 w-5" />}
label="Inventory"
isActive={activeTab === 'inventory'}
onClick={() => setActiveTab('inventory')}
/>
<SidebarItem
icon={<ClipboardList className="h-5 w-5" />}
label="Production & BOM"
isActive={activeTab === 'production'}
onClick={() => setActiveTab('production')}
/>
<SidebarItem
icon={<ShoppingCart className="h-5 w-5" />}
label="Sales"
isActive={activeTab === 'sales'}
onClick={() => setActiveTab('sales')}
/>
<div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
Management
</div>
<SidebarItem
icon={<Users className="h-5 w-5" />}
label="Employees"
isActive={activeTab === 'employees'}
onClick={() => setActiveTab('employees')}
/>
<SidebarItem
icon={<FileText className="h-5 w-5" />}
label="Documents"
isActive={activeTab === 'documents'}
onClick={() => setActiveTab('documents')}
/>
<SidebarItem
icon={<DollarSign className="h-5 w-5" />}
label="Finance"
isActive={activeTab === 'finance'}
onClick={() => setActiveTab('finance')}
/>
<SidebarItem
icon={<PieChart className="h-5 w-5" />}
label="Reports"
isActive={activeTab === 'reports'}
onClick={() => setActiveTab('reports')}
/>
<div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
System
</div>
<SidebarItem
icon={<Settings className="h-5 w-5" />}
label="Settings"
isActive={activeTab === 'settings'}
onClick={() => setActiveTab('settings')}
/>
</nav>
<div className="p-4 border-t border-gray-200">
<div className="flex items-center">
<Avatar className="h-8 w-8">
<AvatarImage src="https://readdy.ai/api/search-image?query=professional%20business%20person%20portrait%2C%20neutral%20expression%2C%20high%20quality%20corporate%20headshot%2C%20professional%20attire%2C%20clean%20background%2C%20realistic%20photo&width=100&height=100&seq=2&orientation=squarish" alt="User" />
<AvatarFallback>JD</AvatarFallback>
</Avatar>
<div className="ml-3">
<p className="text-sm font-medium text-gray-700">John Doe</p>
<p className="text-xs text-gray-500">Administrator</p>
</div>
</div>
</div>
</div>
{/* Main Content */}
<div className="flex-1 flex flex-col overflow-hidden">
{/* Top Navigation */}
<header className="bg-white border-b border-gray-200">
<div className="flex items-center justify-between px-6 py-3">
<div className="flex items-center">
<Button variant="ghost" size="icon" className="mr-2 !rounded-button whitespace-nowrap">
<Grid className="h-5 w-5" />
</Button>
<h2 className="text-lg font-medium text-gray-800">
{activeTab === 'dashboard' && 'Dashboard'}
{activeTab === 'inventory' && 'Inventory Management'}
{activeTab === 'production' && 'Production & BOM'}
{activeTab === 'sales' && 'Sales Management'}
{activeTab === 'employees' && 'Employee Management'}
{activeTab === 'documents' && 'Document Generation'}
{activeTab === 'finance' && 'Financial Management'}
{activeTab === 'reports' && 'Reports'}
{activeTab === 'settings' && 'System Settings'}
</h2>
</div>
<div className="flex items-center space-x-4">
<div className="relative">
<Button variant="ghost" size="icon" className="!rounded-button whitespace-nowrap">
<Bell className="h-5 w-5" />
</Button>
<span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
</div>
<div className="relative">
<Button variant="ghost" size="icon" className="!rounded-button whitespace-nowrap">
<Calendar className="h-5 w-5" />
</Button>
</div>
<div className="border-l border-gray-200 h-6 mx-2"></div>
<div className="flex items-center cursor-pointer">
<span className="text-sm font-medium text-gray-700 mr-1">April 22, 2025</span>
<span className="text-sm text-gray-500">Tuesday</span>
</div>
</div>
</div>
</header>
{/* Dashboard Content */}
<main className="flex-1 overflow-y-auto bg-gray-50 p-6">
{activeTab === 'dashboard' && (
<div className="space-y-6">
{/* Quick Stats */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<StatCard
title="Total Inventory Items"
value="1,248"
change="+12.5%"
changeType="positive"
icon={<Package className="h-6 w-6 text-blue-600" />}
/>
<StatCard
title="Today's Sales"
value="$8,942"
change="+23.1%"
changeType="positive"
icon={<ShoppingCart className="h-6 w-6 text-green-600" />}
/>
<StatCard
title="Production Efficiency"
value="87.3%"
change="-2.4%"
changeType="negative"
icon={<ClipboardList className="h-6 w-6 text-amber-600" />}
/>
<StatCard
title="Employees Present"
value="42/45"
change="+4.5%"
changeType="positive"
icon={<Users className="h-6 w-6 text-indigo-600" />}
/>
</div>
{/* Charts Row */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
<Card>
<CardHeader className="pb-2">
<CardTitle>Sales Overview</CardTitle>
<CardDescription>Daily sales performance for the current week</CardDescription>
</CardHeader>
<CardContent>
<div id="sales-chart" className="h-80"></div>
</CardContent>
</Card>
<Card>
<CardHeader className="pb-2">
<CardTitle>Inventory Status</CardTitle>
<CardDescription>Current distribution of inventory items</CardDescription>
</CardHeader>
<CardContent>
<div id="inventory-chart" className="h-80"></div>
</CardContent>
</Card>
</div>
{/* Production & Alerts */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<Card className="lg:col-span-2">
<CardHeader>
<CardTitle>Production Output</CardTitle>
<CardDescription>Planned vs. Actual production for top products</CardDescription>
</CardHeader>
<CardContent>
<div id="production-chart" className="h-80"></div>
</CardContent>
</Card>
<Card>
<CardHeader>
<CardTitle>System Alerts</CardTitle>
<CardDescription>Recent notifications and alerts</CardDescription>
</CardHeader>
<CardContent>
<div className="space-y-4">
<Alert
type="error"
title="Low Stock Alert"
message="Raw Material #RM-1042 is below threshold"
time="10 minutes ago"
/>
<Alert
type="warning"
title="Production Delay"
message="Line #3 is running behind schedule"
time="45 minutes ago"
/>
<Alert
type="info"
title="New Order Received"
message="Order #ORD-7829 from Client XYZ"
time="1 hour ago"
/>
<Alert
type="success"
title="Invoice Paid"
message="Invoice #INV-2023-045 payment received"
time="3 hours ago"
/>
</div>
</CardContent>
<CardFooter>
<Button variant="outline" className="w-full !rounded-button whitespace-nowrap">View All Alerts</Button>
</CardFooter>
</Card>
</div>
{/* Recent Activities */}
<Card>
<CardHeader>
<CardTitle>Recent Activities</CardTitle>
<CardDescription>Latest system activities and updates</CardDescription>
</CardHeader>
<CardContent>
<Table>
<TableHeader>
<TableRow>
<TableHead>Activity</TableHead>
<TableHead>User</TableHead>
<TableHead>Module</TableHead>
<TableHead>Date & Time</TableHead>
<TableHead>Status</TableHead>
</TableRow>
</TableHeader>
<TableBody>
<TableRow>
<TableCell className="font-medium">Created Invoice #INV-2023-052</TableCell>
<TableCell>Sarah Johnson</TableCell>
<TableCell>Sales</TableCell>
<TableCell>Apr 22, 2025 09:45 AM</TableCell>
<TableCell><Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge></TableCell>
</TableRow>
<TableRow>
<TableCell className="font-medium">Updated Inventory Item #PRD-7842</TableCell>
<TableCell>Michael Chen</TableCell>
<TableCell>Inventory</TableCell>
<TableCell>Apr 22, 2025 09:30 AM</TableCell>
<TableCell><Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge></TableCell>
</TableRow>
<TableRow>
<TableCell className="font-medium">Started Production Order #PO-2023-118</TableCell>
<TableCell>David Wilson</TableCell>
<TableCell>Production</TableCell>
<TableCell>Apr 22, 2025 08:15 AM</TableCell>
<TableCell><Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge></TableCell>
</TableRow>
<TableRow>
<TableCell className="font-medium">Generated Monthly Report</TableCell>
<TableCell>John Doe</TableCell>
<TableCell>Reports</TableCell>
<TableCell>Apr 22, 2025 08:00 AM</TableCell>
<TableCell><Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge></TableCell>
</TableRow>
<TableRow>
<TableCell className="font-medium">Failed Stock Adjustment #ADJ-452</TableCell>
<TableCell>Emily Rodriguez</TableCell>
<TableCell>Inventory</TableCell>
<TableCell>Apr 21, 2025 05:30 PM</TableCell>
<TableCell><Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge></TableCell>
</TableRow>
</TableBody>
</Table>
</CardContent>
<CardFooter>
<Button variant="outline" className="w-full !rounded-button whitespace-nowrap">View All Activities</Button>
</CardFooter>
</Card>
</div>
)}
{activeTab === 'inventory' && (
<div className="space-y-6">
<div className="flex justify-between items-center">
<h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
<div className="flex space-x-3">
<Button variant="outline" className="!rounded-button whitespace-nowrap">
<i className="fas fa-file-export mr-2"></i>
Export
</Button>
<Button className="!rounded-button whitespace-nowrap">
<i className="fas fa-plus mr-2"></i>
Add Item
</Button>
</div>
</div>
<Card>
<CardHeader className="pb-0">
<Tabs defaultValue="all" className="w-full">
<div className="flex justify-between items-center mb-4">
<TabsList>
<TabsTrigger value="all">All Items</TabsTrigger>
<TabsTrigger value="raw">Raw Materials</TabsTrigger>
<TabsTrigger value="wip">Work in Progress</TabsTrigger>
<TabsTrigger value="finished">Finished Goods</TabsTrigger>
</TabsList>
<div className="relative">
<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<i className="fas fa-search text-gray-400"></i>
</div>
<Input
type="text"
placeholder="Search inventory..."
className="pl-10 w-64"
/>
</div>
</div>
<TabsContent value="all" className="m-0">
<Table>
<TableHeader>
<TableRow>
<TableHead>SKU</TableHead>
<TableHead>Name</TableHead>
<TableHead>Category</TableHead>
<TableHead>Quantity</TableHead>
<TableHead>Unit Price</TableHead>
<TableHead>Status</TableHead>
<TableHead>Actions</TableHead>
</TableRow>
</TableHeader>
<TableBody>
<TableRow>
<TableCell className="font-medium">RM-1042</TableCell>
<TableCell>Aluminum Sheet 2mm</TableCell>
<TableCell>Raw Material</TableCell>
<TableCell>45 sheets</TableCell>
<TableCell>$24.50</TableCell>
<TableCell>
<Badge className="bg-red-100 text-red-800 hover:bg-red-100">Low Stock</Badge>
</TableCell>
<TableCell>
<div className="flex space-x-2">
<Button variant="ghost" size="icon" className="h-8 w-8 !rounded-button whitespace-nowrap">
<i className="fas fa-edit text-blue-600"></i>
</Button>
<Button variant="ghost" size="icon" className="h-8 w-8 !rounded-button whitespace-nowrap">
<i className="fas fa-history text-gray-600"></i>
</Button>
</div>
</TableCell>
</TableRow>
<TableRow>
<TableCell className="font-medium">RM-2187</TableCell>
<TableCell>Steel Rod 10mm</TableCell>
<TableCell>Raw Material</TableCell>
<TableCell>120 pcs</TableCell>
<TableCell>$12.75</TableCell>
<TableCell>
<Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>
</TableCell>
<TableCell>
<div className="flex space-x-2">
<Button variant="ghost" size="icon" className="h-8 w-8 !rounded-button whitespace-nowrap">
<i className="fas fa-edit text-blue-600"></i>
</Button>
<Button variant="ghost" size="icon" className="h-8 w-8 !rounded-button whitespace-nowrap">
<i className="fas fa-history text-gray-600"></i>
</Button>
</div>
</TableCell>
</TableRow>
<TableRow>
<TableCell className="font-medium">WIP-3045</TableCell>
<TableCell>Frame Assembly</TableCell>
<TableCell>Work in Progress</TableCell>
<TableCell>35 units</TableCell>
<TableCell>$78.20</TableCell>
<TableCell>
<Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>
</TableCell>
<TableCell>
<div className="flex space-x-2">
<Button variant="ghost" size="icon" className="h-8 w-8 !rounded-button whitespace-nowrap">
<i className="fas fa-edit text-blue-600"></i>
</Button>
<Button variant="ghost" size="icon" className="h-8 w-8 !rounded-button whitespace-nowrap">
<i className="fas fa-history text-gray-600"></i>
</Button>
</div>
</TableCell>
</TableRow>
<TableRow>
<TableCell className="font-medium">FG-5012</TableCell>
<TableCell>Deluxe Office Chair</TableCell>
<TableCell>Finished Good</TableCell>
<TableCell>18 units</TableCell>
<TableCell>$249.99</TableCell>
<TableCell>
<Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Medium Stock</Badge>
</TableCell>
<TableCell>
<div className="flex space-x-2">
<Button variant="ghost" size="icon" className="h-8 w-8 !rounded-button whitespace-nowrap">
<i className="fas fa-edit text-blue-600"></i>
</Button>
<Button variant="ghost" size="icon" className="h-8 w-8 !rounded-button whitespace-nowrap">
<i className="fas fa-history text-gray-600"></i>
</Button>
</div>
</TableCell>
</TableRow>
<TableRow>
<TableCell className="font-medium">FG-5024</TableCell>
<TableCell>Executive Desk</TableCell>
<TableCell>Finished Good</TableCell>
<TableCell>7 units</TableCell>
<TableCell>$599.99</TableCell>
<TableCell>
<Badge className="bg-red-100 text-red-800 hover:bg-red-100">Low Stock</Badge>
</TableCell>
<TableCell>
<div className="flex space-x-2">
<Button variant="ghost" size="icon" className="h-8 w-8 !rounded-button whitespace-nowrap">
<i className="fas fa-edit text-blue-600"></i>
</Button>
<Button variant="ghost" size="icon" className="h-8 w-8 !rounded-button whitespace-nowrap">
<i className="fas fa-history text-gray-600"></i>
</Button>
</div>
</TableCell>
</TableRow>
</TableBody>
</Table>
</TabsContent>
<TabsContent value="raw" className="m-0">
<div className="p-4 text-center text-gray-500">
Raw Materials inventory content would be displayed here
</div>
</TabsContent>
<TabsContent value="wip" className="m-0">
<div className="p-4 text-center text-gray-500">
Work in Progress inventory content would be displayed here
</div>
</TabsContent>
<TabsContent value="finished" className="m-0">
<div className="p-4 text-center text-gray-500">
Finished Goods inventory content would be displayed here
</div>
</TabsContent>
</Tabs>
</CardHeader>
<CardFooter className="flex justify-between border-t pt-6">
<div className="text-sm text-gray-500">
Showing 5 of 248 items
</div>
<div className="flex space-x-2">
<Button variant="outline" size="sm" className="!rounded-button whitespace-nowrap">Previous</Button>
<Button variant="outline" size="sm" className="!rounded-button whitespace-nowrap">Next</Button>
</div>
</CardFooter>
</Card>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<Card>
<CardHeader>
<CardTitle>Low Stock Items</CardTitle>
<CardDescription>Items that need immediate attention</CardDescription>
</CardHeader>
<CardContent>
<Table>
<TableHeader>
<TableRow>
<TableHead>SKU</TableHead>
<TableHead>Name</TableHead>
<TableHead>Current</TableHead>
<TableHead>Threshold</TableHead>
<TableHead>Action</TableHead>
</TableRow>
</TableHeader>
<TableBody>
<TableRow>
<TableCell className="font-medium">RM-1042</TableCell>
<TableCell>Aluminum Sheet 2mm</TableCell>
<TableCell className="text-red-600">45</TableCell>
<TableCell>100</TableCell>
<TableCell>
<Button size="sm" className="!rounded-button whitespace-nowrap">Reorder</Button>
</TableCell>
</TableRow>
<TableRow>
<TableCell className="font-medium">FG-5024</TableCell>
<TableCell>Executive Desk</TableCell>
<TableCell className="text-red-600">7</TableCell>
<TableCell>15</TableCell>
<TableCell>
<Button size="sm" className="!rounded-button whitespace-nowrap">Produce</Button>
</TableCell>
</TableRow>
<TableRow>
<TableCell className="font-medium">RM-3087</TableCell>
<TableCell>Fabric Roll - Blue</TableCell>
<TableCell className="text-red-600">3</TableCell>
<TableCell>10</TableCell>
<TableCell>
<Button size="sm" className="!rounded-button whitespace-nowrap">Reorder</Button>
</TableCell>
</TableRow>
</TableBody>
</Table>
</CardContent>
</Card>
<Card>
<CardHeader>
<CardTitle>Recent Inventory Movements</CardTitle>
<CardDescription>Latest inventory transactions</CardDescription>
</CardHeader>
<CardContent>
<div className="space-y-4">
<div className="flex items-start">
<div className="bg-green-100 p-2 rounded-full">
<i className="fas fa-arrow-up text-green-600"></i>
</div>
<div className="ml-4">
<p className="text-sm font-medium">Received 200 Steel Rods (RM-2187)</p>
<p className="text-xs text-gray-500">Apr 22, 2025 - 08:45 AM</p>
<p className="text-xs text-gray-500">By: Michael Chen</p>
</div>
</div>
<div className="flex items-start">
<div className="bg-red-100 p-2 rounded-full">
<i className="fas fa-arrow-down text-red-600"></i>
</div>
<div className="ml-4">
<p className="text-sm font-medium">Consumed 15 Aluminum Sheets (RM-1042)</p>
<p className="text-xs text-gray-500">Apr 22, 2025 - 08:30 AM</p>
<p className="text-xs text-gray-500">For: Production Order #PO-2023-118</p>
</div>
</div>
<div className="flex items-start">
<div className="bg-blue-100 p-2 rounded-full">
<i className="fas fa-exchange-alt text-blue-600"></i>
</div>
<div className="ml-4">
<p className="text-sm font-medium">Adjusted 5 Executive Desks (FG-5024)</p>
<p className="text-xs text-gray-500">Apr 21, 2025 - 04:15 PM</p>
<p className="text-xs text-gray-500">Reason: Quality Control</p>
</div>
</div>
<div className="flex items-start">
<div className="bg-red-100 p-2 rounded-full">
<i className="fas fa-arrow-down text-red-600"></i>
</div>
<div className="ml-4">
<p className="text-sm font-medium">Sold 3 Deluxe Office Chairs (FG-5012)</p>
<p className="text-xs text-gray-500">Apr 21, 2025 - 02:30 PM</p>
<p className="text-xs text-gray-500">Order: #ORD-7826</p>
</div>
</div>
</div>
</CardContent>
</Card>
</div>
</div>
)}
{activeTab === 'sales' && (
<div className="space-y-6">
<div className="flex justify-between items-center">
<h1 className="text-2xl font-bold text-gray-800">Sales Management</h1>
<div className="flex space-x-3">
<Button variant="outline" className="!rounded-button whitespace-nowrap">
<i className="fas fa-file-export mr-2"></i>
Export
</Button>
<Button className="!rounded-button whitespace-nowrap">
<i className="fas fa-plus mr-2"></i>
New Sale
</Button>
</div>
</div>
<Card>
<CardHeader className="pb-0">
<Tabs defaultValue="direct" className="w-full">
<div className="flex justify-between items-center mb-4">
<TabsList>
<TabsTrigger value="direct">Direct Sales</TabsTrigger>
<TabsTrigger value="commercial">Commercial Sales</TabsTrigger>
<TabsTrigger value="history">Sales History</TabsTrigger>
</TabsList>
<div className="relative">
<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<i className="fas fa-search text-gray-400"></i>
</div>
<Input
type="text"
placeholder="Search sales..."
className="pl-10 w-64"
/>
</div>
</div>
<TabsContent value="direct" className="m-0">
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div className="lg:col-span-2">
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
<div className="p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all">
<div className="aspect-square rounded-md bg-cover bg-center mb-2" style={{
backgroundImage: `url('https://readdy.ai/api/search-image?query=modern%20office%20chair%20with%20ergonomic%20design%2C%20professional%20product%20photography%20on%20white%20background%2C%20high%20quality%20commercial%20product%20image%2C%20detailed%20texture%20visible&width=100&height=100&seq=3&orientation=squarish')`
}}></div>
<h3 className="text-sm font-medium">Deluxe Office Chair</h3>
<p className="text-xs text-gray-500">FG-5012</p>
<p className="text-sm font-bold mt-1">$249.99</p>
</div>
<div className="p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all">
<div className="aspect-square rounded-md bg-cover bg-center mb-2" style={{
backgroundImage: `url('https://readdy.ai/api/search-image?query=executive%20wooden%20desk%20with%20drawers%2C%20professional%20product%20photography%20on%20white%20background%2C%20high%20quality%20commercial%20product%20image%2C%20detailed%20wood%20grain%20visible&width=100&height=100&seq=4&orientation=squarish')`
}}></div>
<h3 className="text-sm font-medium">Executive Desk</h3>
<p className="text-xs text-gray-500">FG-5024</p>
<p className="text-sm font-bold mt-1">$599.99</p>
</div>
<div className="p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all">
<div className="aspect-square rounded-md bg-cover bg-center mb-2" style={{
backgroundImage: `url('https://readdy.ai/api/search-image?query=modern%20office%20bookshelf%20with%20multiple%20compartments%2C%20professional%20product%20photography%20on%20white%20background%2C%20high%20quality%20commercial%20product%20image%2C%20detailed%20texture%20visible&width=100&height=100&seq=5&orientation=squarish')`
}}></div>
<h3 className="text-sm font-medium">Bookshelf Unit</h3>
<p className="text-xs text-gray-500">FG-5036</p>
<p className="text-sm font-bold mt-1">$349.99</p>
</div>
<div className="p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all">
<div className="aspect-square rounded-md bg-cover bg-center mb-2" style={{
backgroundImage: `url('https://readdy.ai/api/search-image?query=modern%20office%20filing%20cabinet%20with%20drawers%2C%20professional%20product%20photography%20on%20white%20background%2C%20high%20quality%20commercial%20product%20image%2C%20detailed%20texture%20visible&width=100&height=100&seq=6&orientation=squarish')`
}}></div>
<h3 className="text-sm font-medium">Filing Cabinet</h3>
<p className="text-xs text-gray-500">FG-5048</p>
<p className="text-sm font-bold mt-1">$199.99</p>
</div>
<div className="p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all">
<div className="aspect-square rounded-md bg-cover bg-center mb-2" style={{
backgroundImage: `url('https://readdy.ai/api/search-image?query=modern%20office%20conference%20table%2C%20professional%20product%20photography%20on%20white%20background%2C%20high%20quality%20commercial%20product%20image%2C%20detailed%20texture%20visible&width=100&height=100&seq=7&orientation=squarish')`
}}></div>
<h3 className="text-sm font-medium">Conference Table</h3>
<p className="text-xs text-gray-500">FG-5060</p>
<p className="text-sm font-bold mt-1">$899.99</p>
</div>
<div className="p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all">
<div className="aspect-square rounded-md bg-cover bg-center mb-2" style={{
backgroundImage: `url('https://readdy.ai/api/search-image?query=modern%20office%20reception%20desk%2C%20professional%20product%20photography%20on%20white%20background%2C%20high%20quality%20commercial%20product%20image%2C%20detailed%20texture%20visible&width=100&height=100&seq=8&orientation=squarish')`
}}></div>
<h3 className="text-sm font-medium">Reception Desk</h3>
<p className="text-xs text-gray-500">FG-5072</p>
<p className="text-sm font-bold mt-1">$749.99</p>
</div>
<div className="p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all">
<div className="aspect-square rounded-md bg-cover bg-center mb-2" style={{
backgroundImage: `url('https://readdy.ai/api/search-image?query=modern%20office%20desk%20lamp%2C%20professional%20product%20photography%20on%20white%20background%2C%20high%20quality%20commercial%20product%20image%2C%20detailed%20texture%20visible&width=100&height=100&seq=9&orientation=squarish')`
}}></div>
<h3 className="text-sm font-medium">Desk Lamp</h3>
<p className="text-xs text-gray-500">FG-5084</p>
<p className="text-sm font-bold mt-1">$59.99</p>
</div>
<div className="p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all">
<div className="aspect-square rounded-md bg-cover bg-center mb-2" style={{
backgroundImage: `url('https://readdy.ai/api/search-image?query=modern%20office%20monitor%20stand%2C%20professional%20product%20photography%20on%20white%20background%2C%20high%20quality%20commercial%20product%20image%2C%20detailed%20texture%20visible&width=100&height=100&seq=10&orientation=squarish')`
}}></div>
<h3 className="text-sm font-medium">Monitor Stand</h3>
<p className="text-xs text-gray-500">FG-5096</p>
<p className="text-sm font-bold mt-1">$79.99</p>
</div>
</div>
</div>
<div>
<Card>
<CardHeader>
<CardTitle>Current Sale</CardTitle>
<CardDescription>Direct sale to walk-in customer</CardDescription>
</CardHeader>
<CardContent>
<div className="space-y-4">
<div className="space-y-2">
<label className="text-sm font-medium">Customer</label>
<Input placeholder="Walk-in Customer" />
</div>
<div className="border-t pt-4">
<h3 className="text-sm font-medium mb-2">Cart Items</h3>
<div className="space-y-3">
<div className="flex justify-between items-center p-2 bg-gray-50 rounded">
<div>
<p className="text-sm font-medium">Deluxe Office Chair</p>
<p className="text-xs text-gray-500">1 × $249.99</p>
</div>
<div className="flex items-center space-x-2">
<Button variant="ghost" size="icon" className="h-6 w-6 !rounded-button whitespace-nowrap">
<i className="fas fa-minus text-xs"></i>
</Button>
<span className="text-sm">1</span>
<Button variant="ghost" size="icon" className="h-6 w-6 !rounded-button whitespace-nowrap">
<i className="fas fa-plus text-xs"></i>
</Button>
<Button variant="ghost" size="icon" className="h-6 w-6 !rounded-button whitespace-nowrap">
<i className="fas fa-trash text-xs text-red-500"></i>
</Button>
</div>
</div>
<div className="flex justify-between items-center p-2 bg-gray-50 rounded">
<div>
<p className="text-sm font-medium">Desk Lamp</p>
<p className="text-xs text-gray-500">2 × $59.99</p>
</div>
<div className="flex items-center space-x-2">
<Button variant="ghost" size="icon" className="h-6 w-6 !rounded-button whitespace-nowrap">
<i className="fas fa-minus text-xs"></i>
</Button>
<span className="text-sm">2</span>
<Button variant="ghost" size="icon" className="h-6 w-6 !rounded-button whitespace-nowrap">
<i className="fas fa-plus text-xs"></i>
</Button>
<Button variant="ghost" size="icon" className="h-6 w-6 !rounded-button whitespace-nowrap">
<i className="fas fa-trash text-xs text-red-500"></i>
</Button>
</div>
</div>
</div>
</div>
<div className="border-t pt-4">
<div className="flex justify-between mb-2">
<span className="text-sm">Subtotal</span>
<span className="text-sm font-medium">$369.97</span>
</div>
<div className="flex justify-between mb-2">
<span className="text-sm">Tax (10%)</span>
<span className="text-sm font-medium">$37.00</span>
</div>
<div className="flex justify-between font-bold">
<span>Total</span>
<span>$406.97</span>
</div>
</div>
</div>
</CardContent>
<CardFooter className="flex flex-col space-y-2">
<Button className="w-full !rounded-button whitespace-nowrap">
<i className="fas fa-money-bill-wave mr-2"></i>
Process Payment
</Button>
<Button variant="outline" className="w-full !rounded-button whitespace-nowrap">
<i className="fas fa-times mr-2"></i>
Cancel Sale
</Button>
</CardFooter>
</Card>
</div>
</div>
</TabsContent>
<TabsContent value="commercial" className="m-0">
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div className="lg:col-span-2">
<Card>
<CardHeader>
<CardTitle>Commercial Sales Agents</CardTitle>
<CardDescription>Track door-to-door sales by commercial agents</CardDescription>
</CardHeader>
<CardContent>
<Table>
<TableHeader>
<TableRow>
<TableHead>Agent</TableHead>
<TableHead>Route</TableHead>
<TableHead>Morning Dispatch</TableHead>
<TableHead>Evening Return</TableHead>
<TableHead>Sales</TableHead>
<TableHead>Status</TableHead>
<TableHead>Actions</TableHead>
</TableRow>
</TableHeader>
<TableBody>
<TableRow>
<TableCell>
<div className="flex items-center">
<Avatar className="h-8 w-8 mr-2">
<AvatarImage src="https://readdy.ai/api/search-image?query=professional%20sales%20agent%20portrait%2C%20male%2C%20business%20attire%2C%20clean%20background%2C%20realistic%20photo&width=100&height=100&seq=11&orientation=squarish" alt="Agent" />
<AvatarFallback>JD</AvatarFallback>
</Avatar>
<div>
<p className="text-sm font-medium">James Wilson</p>
<p className="text-xs text-gray-500">ID: AG-1042</p>
</div>
</div>
</TableCell>
<TableCell>North District</TableCell>
<TableCell>
<div>
<p className="text-sm">25 units</p>
<p className="text-xs text-gray-500">08:15 AM</p>
</div>
</TableCell>
<TableCell>
<div>
<p className="text-sm">7 units</p>
<p className="text-xs text-gray-500">05:30 PM</p>
</div>
</TableCell>
<TableCell>
<div>
<p className="text-sm font-medium">18 units</p>
<p className="text-xs text-gray-500">$4,499.82</p>
</div>
</TableCell>
<TableCell>
<Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
</TableCell>
<TableCell>
<Button size="sm" className="!rounded-button whitespace-nowrap">View Details</Button>
</TableCell>
</TableRow>
<TableRow>
<TableCell>
<div className="flex items-center">
<Avatar className="h-8 w-8 mr-2">
<AvatarImage src="https://readdy.ai/api/search-image?query=professional%20sales%20agent%20portrait%2C%20female%2C%20business%20attire%2C%20clean%20background%2C%20realistic%20photo&width=100&height=100&seq=12&orientation=squarish" alt="Agent" />
<AvatarFallback>SR</AvatarFallback>
</Avatar>
<div>
<p className="text-sm font-medium">Sarah Rodriguez</p>
<p className="text-xs text-gray-500">ID: AG-1078</p>
</div>
</div>
</TableCell>
<TableCell>East District</TableCell>
<TableCell>
<div>
<p className="text-sm">30 units</p>
<p className="text-xs text-gray-500">08:00 AM</p>
</div>
</TableCell>
<TableCell>
<div>
<p className="text-sm">5 units</p>
<p className="text-xs text-gray-500">06:15 PM</p>
</div>
</TableCell>
<TableCell>
<div>
<p className="text-sm font-medium">25 units</p>
<p className="text-xs text-gray-500">$5,999.75</p>
</div>
</TableCell>
<TableCell>
<Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
</TableCell>
<TableCell>
<Button size="sm" className="!rounded-button whitespace-nowrap">View Details</Button>
</TableCell>
</TableRow>
<TableRow>
<TableCell>
<div className="flex items-center">
<Avatar className="h-8 w-8 mr-2">
<AvatarImage src="https://readdy.ai/api/search-image?query=professional%20sales%20agent%20portrait%2C%20male%2C%20business%20attire%2C%20clean%20background%2C%20realistic%20photo&width=100&height=100&seq=13&orientation=squarish" alt="Agent" />
<AvatarFallback>MT</AvatarFallback>
</Avatar>
<div>
<p className="text-sm font-medium">Michael Thompson</p>
<p className="text-xs text-gray-500">ID: AG-1103</p>
</div>
</div>
</TableCell>
<TableCell>South District</TableCell>
<TableCell>
<div>
<p className="text-sm">20 units</p>
<p className="text-xs text-gray-500">08:30 AM</p>
</div>
</TableCell>
<TableCell>
<div>
<p className="text-sm">--</p>
<p className="text-xs text-gray-500">--</p>
</div>
</TableCell>
<TableCell>
<div>
<p className="text-sm font-medium">--</p>
<p className="text-xs text-gray-500">--</p>
</div>
</TableCell>
<TableCell>
<Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Field</Badge>
</TableCell>
<TableCell>
<Button size="sm" variant="outline" className="!rounded-button whitespace-nowrap">Record Return</Button>
</TableCell>
</TableRow>
</TableBody>
</Table>
</CardContent>
</Card>
</div>
<div>
<Card>
<CardHeader>
<CardTitle>Agent Performance</CardTitle>
<CardDescription>Sales metrics for the current month</CardDescription>
</CardHeader>
<CardContent>
<div className="space-y-4">
<div>
<div className="flex justify-between mb-1">
<span className="text-sm font-medium">Sarah Rodriguez</span>
<span className="text-sm font-medium">92%</span>
</div>
<Progress value={92} className="h-2" />
</div>
<div>
<div className="flex justify-between mb-1">
<span className="text-sm font-medium">James Wilson</span>
<span className="text-sm font-medium">78%</span>
</div>
<Progress value={78} className="h-2" />
</div>
<div>
<div className="flex justify-between mb-1">
<span className="text-sm font-medium">Michael Thompson</span>
<span className="text-sm font-medium">65%</span>
</div>
<Progress value={65} className="h-2" />
</div>
<div>
<div className="flex justify-between mb-1">
<span className="text-sm font-medium">Emily Johnson</span>
<span className="text-sm font-medium">83%</span>
</div>
<Progress value={83} className="h-2" />
</div>
<div>
<div className="flex justify-between mb-1">
<span className="text-sm font-medium">David Chen</span>
<span className="text-sm font-medium">71%</span>
</div>
<Progress value={71} className="h-2" />
</div>
</div>
<div className="mt-6 pt-4 border-t">
<h3 className="text-sm font-medium mb-2">Top Selling Products</h3>
<div className="space-y-2">
<div className="flex justify-between items-center">
<span className="text-sm">Deluxe Office Chair</span>
<span className="text-sm font-medium">142 units</span>
</div>
<div className="flex justify-between items-center">
<span className="text-sm">Desk Lamp</span>
<span className="text-sm font-medium">98 units</span>
</div>
<div className="flex justify-between items-center">
<span className="text-sm">Monitor Stand</span>
<span className="text-sm font-medium">76 units</span>
</div>
</div>
</div>
</CardContent>
<CardFooter>
<Button variant="outline" className="w-full !rounded-button whitespace-nowrap">View Full Report</Button>
</CardFooter>
</Card>
</div>
</div>
</TabsContent>
<TabsContent value="history" className="m-0">
<div className="p-4 text-center text-gray-500">
Sales history content would be displayed here
</div>
</TabsContent>
</Tabs>
</CardHeader>
</Card>
</div>
)}
{(activeTab !== 'dashboard' && activeTab !== 'inventory' && activeTab !== 'sales') && (
<div className="flex flex-col items-center justify-center h-full py-12">
<img
src="https://readdy.ai/api/search-image?query=under%20construction%20or%20coming%20soon%20illustration%2C%20modern%20minimalist%20design%2C%20blue%20color%20scheme%2C%20professional%20business%20graphic%2C%20clean%20background&width=400&height=300&seq=14&orientation=landscape"
alt="Coming Soon"
className="w-64 h-auto mb-8"
/>
<h2 className="text-2xl font-bold text-gray-800 mb-2">This Module is Coming Soon</h2>
<p className="text-gray-600 max-w-md text-center">
We're currently working on the {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} module.
It will be available in the next system update.
</p>
<Button
className="mt-6 !rounded-button whitespace-nowrap"
onClick={() => setActiveTab('dashboard')}
>
Return to Dashboard
</Button>
</div>
)}
</main>
</div>
</div>
);
};
interface SidebarItemProps {
icon: React.ReactNode;
label: string;
isActive: boolean;
onClick: () => void;
}
const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive, onClick }) => {
return (
<div
className={`flex items-center px-4 py-2 cursor-pointer ${
isActive
? 'bg-blue-50 text-blue-600'
: 'text-gray-700 hover:bg-gray-100'
}`}
onClick={onClick}
>
<div className="mr-3">
{icon}
</div>
<span className="text-sm font-medium">{label}</span>
{isActive && (
<div className="ml-auto">
<ChevronRight className="h-4 w-4" />
</div>
)}
</div>
);
};
interface StatCardProps {
title: string;
value: string;
change: string;
changeType: 'positive' | 'negative' | 'neutral';
icon: React.ReactNode;
}
const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon }) => {
return (
<Card>
<CardContent className="p-6">
<div className="flex justify-between items-start">
<div>
<p className="text-sm font-medium text-gray-500">{title}</p>
<h3 className="text-2xl font-bold mt-1">{value}</h3>
<div className={`flex items-center mt-1 ${
changeType === 'positive'
? 'text-green-600'
: changeType === 'negative'
? 'text-red-600'
: 'text-gray-600'
}`}>
<i className={`fas fa-arrow-${changeType === 'positive' ? 'up' : 'down'} text-xs mr-1`}></i>
<span className="text-sm font-medium">{change}</span>
</div>
</div>
<div className="p-3 rounded-full bg-gray-100">
{icon}
</div>
</div>
</CardContent>
</Card>
);
};
interface AlertProps {
type: 'error' | 'warning' | 'info' | 'success';
title: string;
message: string;
time: string;
}
const Alert: React.FC<AlertProps> = ({ type, title, message, time }) => {
const getTypeStyles = () => {
switch (type) {
case 'error':
return {
bgColor: 'bg-red-100',
iconColor: 'text-red-600',
icon: 'fas fa-exclamation-circle'
};
case 'warning':
return {
bgColor: 'bg-amber-100',
iconColor: 'text-amber-600',
icon: 'fas fa-exclamation-triangle'
};
case 'info':
return {
bgColor: 'bg-blue-100',
iconColor: 'text-blue-600',
icon: 'fas fa-info-circle'
};
case 'success':
return {
bgColor: 'bg-green-100',
iconColor: 'text-green-600',
icon: 'fas fa-check-circle'
};
default:
return {
bgColor: 'bg-gray-100',
iconColor: 'text-gray-600',
icon: 'fas fa-bell'
};
}
};
const styles = getTypeStyles();
return (
<div className="flex items-start">
<div className={`p-2 rounded-full ${styles.bgColor}`}>
<i className={`${styles.icon} ${styles.iconColor}`}></i>
</div>
<div className="ml-3">
<p className="text-sm font-medium">{title}</p>
<p className="text-xs text-gray-500">{message}</p>
<p className="text-xs text-gray-400 mt-1">{time}</p>
</div>
</div>
);
};
export default App
