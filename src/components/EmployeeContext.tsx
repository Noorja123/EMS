import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';

export interface Employee {
  id: string;
  email: string;
  name: string;
  department: string;
  role: 'admin' | 'employee';
  hire_date: string;
  leave_balance: number;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: 'Sick' | 'Vacation' | 'Personal' | 'Emergency';
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'public' | 'company';
  created_at: string;
}

interface EmployeeContextType {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  holidays: Holiday[];
  loading: boolean;
  // Employee functions
  fetchEmployees: () => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<{ success: boolean; error?: string }>;
  deleteEmployee: (id: string) => Promise<{ success: boolean; error?: string }>;
  // Leave request functions
  fetchLeaveRequests: () => Promise<void>;
  submitLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'created_at' | 'employee_name'>) => Promise<{ success: boolean; error?: string }>;
  updateLeaveRequestStatus: (id: string, status: 'approved' | 'rejected') => Promise<{ success: boolean; error?: string }>;
  // Holiday functions
  fetchHolidays: () => Promise<void>;
  addHoliday: (holiday: Omit<Holiday, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  deleteHoliday: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
};

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEmployees();
      fetchLeaveRequests();
      fetchHolidays();
    }
  }, [user]);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ea915b54/employees`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employee: Omit<Employee, 'id' | 'created_at'>) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ea915b54/employees`, {
        method: 'POST',
        headers,
        body: JSON.stringify(employee)
      });

      if (response.ok) {
        await fetchEmployees();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to add employee' };
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ea915b54/employees/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        await fetchEmployees();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update employee' };
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ea915b54/employees/${id}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        await fetchEmployees();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to delete employee' };
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ea915b54/leave-requests`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const submitLeaveRequest = async (request: Omit<LeaveRequest, 'id' | 'created_at' | 'employee_name'>) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ea915b54/leave-requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      });

      if (response.ok) {
        await fetchLeaveRequests();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to submit leave request' };
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const updateLeaveRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ea915b54/leave-requests/${id}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        await fetchLeaveRequests();
        await fetchEmployees(); // Refresh to update leave balances
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update leave request' };
      }
    } catch (error) {
      console.error('Error updating leave request:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const fetchHolidays = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ea915b54/holidays`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        setHolidays(data);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const addHoliday = async (holiday: Omit<Holiday, 'id' | 'created_at'>) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ea915b54/holidays`, {
        method: 'POST',
        headers,
        body: JSON.stringify(holiday)
      });

      if (response.ok) {
        await fetchHolidays();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to add holiday' };
      }
    } catch (error) {
      console.error('Error adding holiday:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const deleteHoliday = async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ea915b54/holidays/${id}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        await fetchHolidays();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to delete holiday' };
      }
    } catch (error) {
      console.error('Error deleting holiday:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const value: EmployeeContextType = {
    employees,
    leaveRequests,
    holidays,
    loading,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    fetchLeaveRequests,
    submitLeaveRequest,
    updateLeaveRequestStatus,
    fetchHolidays,
    addHoliday,
    deleteHoliday
  };

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
};