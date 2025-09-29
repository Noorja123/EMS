import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useEmployee } from './EmployeeContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Users, 
  Calendar, 
  ClipboardList, 
  Settings, 
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { EmployeeManagement } from './EmployeeManagement';
import { LeaveRequestManagement } from './LeaveRequestManagement';
import { HolidayManagement } from './HolidayManagement';
import { AdminAnalytics } from './AdminAnalytics';

export const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { employees, leaveRequests, holidays } = useEmployee();
  const [activeTab, setActiveTab] = useState('overview');

  const pendingRequests = leaveRequests.filter(req => req.status === 'pending');
  const approvedRequests = leaveRequests.filter(req => req.status === 'approved');
  const rejectedRequests = leaveRequests.filter(req => req.status === 'rejected');

  // Get employees currently on leave
  const today = new Date().toISOString().split('T')[0];
  const employeesOnLeave = approvedRequests.filter(req => 
    req.start_date <= today && req.end_date >= today
  );

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Employee Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <ClipboardList className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Employees</span>
            </TabsTrigger>
            <TabsTrigger value="leave-requests" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Leave Requests</span>
            </TabsTrigger>
            <TabsTrigger value="holidays" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Holidays</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Employees */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Employees</p>
                      <p className="text-3xl font-bold text-gray-900">{employees.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Pending Requests */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                      <p className="text-3xl font-bold text-orange-600">{pendingRequests.length}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              {/* On Leave Today */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">On Leave Today</p>
                      <p className="text-3xl font-bold text-green-600">{employeesOnLeave.length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Total Holidays */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Holidays</p>
                      <p className="text-3xl font-bold text-purple-600">{holidays.length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Leave Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Leave Requests</CardTitle>
                <CardDescription>Latest employee leave requests requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending leave requests</p>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{request.employee_name}</p>
                          <p className="text-sm text-gray-500">
                            {request.leave_type} • {request.start_date} to {request.end_date} ({request.days_requested} days)
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{request.reason}</p>
                        </div>
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employees on Leave Today */}
            {employeesOnLeave.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Employees on Leave Today</CardTitle>
                  <CardDescription>Staff members currently on approved leave</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employeesOnLeave.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg bg-green-50 border-green-200">
                        <p className="font-medium text-gray-900">{request.employee_name}</p>
                        <p className="text-sm text-gray-600">{request.leave_type}</p>
                        <p className="text-xs text-gray-500">
                          {request.start_date} to {request.end_date}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="employees">
            <EmployeeManagement />
          </TabsContent>

          <TabsContent value="leave-requests">
            <LeaveRequestManagement />
          </TabsContent>

          <TabsContent value="holidays">
            <HolidayManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};