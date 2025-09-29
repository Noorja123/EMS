import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Auth middleware
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'Authorization required' }, 401);
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    
    // Get user profile from KV store
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }
    
    c.set('user', userProfile);
    c.set('userId', user.id);
  } catch (error) {
    console.log('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
  
  await next();
};

// Auth routes
app.post('/make-server-ea915b54/auth/signup', async (c) => {
  try {
    const { email, password, name, role = 'employee' } = await c.req.json();
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true // Auto-confirm since no email server configured
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Store user profile in KV store
    const userProfile = {
      id: data.user.id,
      email,
      name,
      role,
      department: '',
      hire_date: new Date().toISOString().split('T')[0],
      leave_balance: 20,
      created_at: new Date().toISOString()
    };
    
    await kv.set(`user:${data.user.id}`, userProfile);
    
    // If employee, also add to employees list
    if (role === 'employee') {
      await kv.set(`employee:${data.user.id}`, userProfile);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Signup route error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// User profile routes
app.get('/make-server-ea915b54/user/profile', requireAuth, async (c) => {
  const user = c.get('user');
  return c.json(user);
});

app.put('/make-server-ea915b54/user/profile', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const updates = await c.req.json();
    const currentUser = c.get('user');
    
    const updatedUser = { ...currentUser, ...updates, id: userId };
    await kv.set(`user:${userId}`, updatedUser);
    
    // Update employee record if exists
    const employee = await kv.get(`employee:${userId}`);
    if (employee) {
      await kv.set(`employee:${userId}`, updatedUser);
    }
    
    return c.json(updatedUser);
  } catch (error) {
    console.log('Profile update error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Employee management routes
app.get('/make-server-ea915b54/employees', requireAuth, async (c) => {
  try {
    const employees = await kv.getByPrefix('employee:');
    return c.json(employees);
  } catch (error) {
    console.log('Fetch employees error:', error);
    return c.json({ error: 'Failed to fetch employees' }, 500);
  }
});

app.post('/make-server-ea915b54/employees', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    if (user.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const employeeData = await c.req.json();
    const employeeId = crypto.randomUUID();
    
    const employee = {
      id: employeeId,
      ...employeeData,
      created_at: new Date().toISOString()
    };
    
    await kv.set(`employee:${employeeId}`, employee);
    return c.json(employee);
  } catch (error) {
    console.log('Add employee error:', error);
    return c.json({ error: 'Failed to add employee' }, 500);
  }
});

app.put('/make-server-ea915b54/employees/:id', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    if (user.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const employeeId = c.req.param('id');
    const updates = await c.req.json();
    
    const employee = await kv.get(`employee:${employeeId}`);
    if (!employee) {
      return c.json({ error: 'Employee not found' }, 404);
    }
    
    const updatedEmployee = { ...employee, ...updates };
    await kv.set(`employee:${employeeId}`, updatedEmployee);
    
    return c.json(updatedEmployee);
  } catch (error) {
    console.log('Update employee error:', error);
    return c.json({ error: 'Failed to update employee' }, 500);
  }
});

app.delete('/make-server-ea915b54/employees/:id', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    if (user.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const employeeId = c.req.param('id');
    await kv.del(`employee:${employeeId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete employee error:', error);
    return c.json({ error: 'Failed to delete employee' }, 500);
  }
});

// Leave request routes
app.get('/make-server-ea915b54/leave-requests', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const allRequests = await kv.getByPrefix('leave_request:');
    
    // Filter requests based on user role
    if (user.role === 'admin') {
      return c.json(allRequests);
    } else {
      const userRequests = allRequests.filter(req => req.employee_id === user.id);
      return c.json(userRequests);
    }
  } catch (error) {
    console.log('Fetch leave requests error:', error);
    return c.json({ error: 'Failed to fetch leave requests' }, 500);
  }
});

app.post('/make-server-ea915b54/leave-requests', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const requestData = await c.req.json();
    
    // Check if user has sufficient leave balance
    const startDate = new Date(requestData.start_date);
    const endDate = new Date(requestData.end_date);
    const daysRequested = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (user.leave_balance < daysRequested) {
      return c.json({ error: 'Insufficient leave balance' }, 400);
    }
    
    // Check for public holidays
    const holidays = await kv.getByPrefix('holiday:');
    const requestDates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      requestDates.push(d.toISOString().split('T')[0]);
    }
    
    const hasHoliday = holidays.some(holiday => 
      requestDates.includes(holiday.date)
    );
    
    if (hasHoliday) {
      return c.json({ error: 'Cannot request leave on public holidays' }, 400);
    }
    
    const requestId = crypto.randomUUID();
    const leaveRequest = {
      id: requestId,
      employee_id: user.id,
      employee_name: user.name,
      ...requestData,
      days_requested: daysRequested,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    await kv.set(`leave_request:${requestId}`, leaveRequest);
    return c.json(leaveRequest);
  } catch (error) {
    console.log('Submit leave request error:', error);
    return c.json({ error: 'Failed to submit leave request' }, 500);
  }
});

app.put('/make-server-ea915b54/leave-requests/:id/status', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    if (user.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const requestId = c.req.param('id');
    const { status } = await c.req.json();
    
    const leaveRequest = await kv.get(`leave_request:${requestId}`);
    if (!leaveRequest) {
      return c.json({ error: 'Leave request not found' }, 404);
    }
    
    const updatedRequest = {
      ...leaveRequest,
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.name
    };
    
    await kv.set(`leave_request:${requestId}`, updatedRequest);
    
    // Update employee leave balance if approved
    if (status === 'approved') {
      const employee = await kv.get(`employee:${leaveRequest.employee_id}`);
      const userProfile = await kv.get(`user:${leaveRequest.employee_id}`);
      
      if (employee && userProfile) {
        const newBalance = employee.leave_balance - leaveRequest.days_requested;
        const updatedEmployee = { ...employee, leave_balance: newBalance };
        const updatedUser = { ...userProfile, leave_balance: newBalance };
        
        await kv.set(`employee:${leaveRequest.employee_id}`, updatedEmployee);
        await kv.set(`user:${leaveRequest.employee_id}`, updatedUser);
      }
    }
    
    return c.json(updatedRequest);
  } catch (error) {
    console.log('Update leave request status error:', error);
    return c.json({ error: 'Failed to update leave request status' }, 500);
  }
});

// Holiday routes
app.get('/make-server-ea915b54/holidays', requireAuth, async (c) => {
  try {
    const holidays = await kv.getByPrefix('holiday:');
    return c.json(holidays);
  } catch (error) {
    console.log('Fetch holidays error:', error);
    return c.json({ error: 'Failed to fetch holidays' }, 500);
  }
});

app.post('/make-server-ea915b54/holidays', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    if (user.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const holidayData = await c.req.json();
    const holidayId = crypto.randomUUID();
    
    const holiday = {
      id: holidayId,
      ...holidayData,
      created_at: new Date().toISOString()
    };
    
    await kv.set(`holiday:${holidayId}`, holiday);
    return c.json(holiday);
  } catch (error) {
    console.log('Add holiday error:', error);
    return c.json({ error: 'Failed to add holiday' }, 500);
  }
});

app.delete('/make-server-ea915b54/holidays/:id', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    if (user.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const holidayId = c.req.param('id');
    await kv.del(`holiday:${holidayId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete holiday error:', error);
    return c.json({ error: 'Failed to delete holiday' }, 500);
  }
});

// Health check
app.get('/make-server-ea915b54/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);