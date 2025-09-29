import React, { useState } from 'react';
import { useEmployee, Holiday } from './EmployeeContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner@2.0.3';
import { Plus, Trash2, Calendar as CalendarIcon, Star } from 'lucide-react';

export const HolidayManagement: React.FC = () => {
  const { holidays, loading, addHoliday, deleteHoliday } = useEmployee();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'public' as 'public' | 'company'
  });
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      type: 'public'
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await addHoliday(formData);
    if (result.success) {
      toast.success('Holiday added successfully');
      setIsAddDialogOpen(false);
      resetForm();
    } else {
      toast.error(result.error || 'Failed to add holiday');
    }
  };

  const handleDelete = async (holiday: Holiday) => {
    if (window.confirm(`Are you sure you want to delete "${holiday.name}"?`)) {
      const result = await deleteHoliday(holiday.id);
      if (result.success) {
        toast.success('Holiday deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete holiday');
      }
    }
  };

  const getHolidayTypeBadge = (type: string) => {
    return type === 'public' ? (
      <Badge variant="outline" className="text-blue-600 border-blue-200">
        <Star className="w-3 h-3 mr-1" />
        Public Holiday
      </Badge>
    ) : (
      <Badge variant="outline" className="text-purple-600 border-purple-200">
        Company Holiday
      </Badge>
    );
  };

  const upcomingHolidays = holidays
    .filter(holiday => new Date(holiday.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const holidayDates = holidays.map(holiday => new Date(holiday.date));

  const isHolidayDate = (date: Date) => {
    return holidayDates.some(holidayDate => 
      holidayDate.getFullYear() === date.getFullYear() &&
      holidayDate.getMonth() === date.getMonth() &&
      holidayDate.getDate() === date.getDate()
    );
  };

  const getHolidaysForDate = (date: Date) => {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getFullYear() === date.getFullYear() &&
             holidayDate.getMonth() === date.getMonth() &&
             holidayDate.getDate() === date.getDate();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Holiday Management</CardTitle>
              <CardDescription>Manage public and company holidays</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex rounded-md shadow-sm">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-r-none"
                >
                  Table
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="rounded-l-none"
                >
                  Calendar
                </Button>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Holiday
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Holiday</DialogTitle>
                    <DialogDescription>
                      Create a new public or company holiday
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAdd} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Holiday Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter holiday name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={formData.type} onValueChange={(value: 'public' | 'company') => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select holiday type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public Holiday</SelectItem>
                          <SelectItem value="company">Company Holiday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsAddDialogOpen(false);
                        resetForm();
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Add Holiday
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Upcoming Holidays */}
      {upcomingHolidays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span>Upcoming Holidays</span>
            </CardTitle>
            <CardDescription>Next holidays in chronological order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingHolidays.map((holiday) => {
                const isToday = new Date(holiday.date).toDateString() === new Date().toDateString();
                const daysDiff = Math.ceil((new Date(holiday.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={holiday.id} className={`p-4 border rounded-lg ${
                    isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}>
                    <h3 className="font-medium text-gray-900">{holiday.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(holiday.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      {getHolidayTypeBadge(holiday.type)}
                      <span className="text-xs text-gray-500">
                        {isToday ? 'Today' : daysDiff === 1 ? 'Tomorrow' : `In ${daysDiff} days`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holiday List/Calendar */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : viewMode === 'table' ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No holidays found. Add your first holiday to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    holidays
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((holiday) => (
                        <TableRow key={holiday.id}>
                          <TableCell className="font-medium">{holiday.name}</TableCell>
                          <TableCell>{new Date(holiday.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </TableCell>
                          <TableCell>{getHolidayTypeBadge(holiday.type)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(holiday)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={calendarDate}
                  onSelect={setCalendarDate}
                  className="rounded-md border"
                  modifiers={{
                    holiday: holidayDates
                  }}
                  modifiersStyles={{
                    holiday: {
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </div>
              
              {calendarDate && isHolidayDate(calendarDate) && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Holidays on {calendarDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getHolidaysForDate(calendarDate).map((holiday) => (
                        <div key={holiday.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h3 className="font-medium text-gray-900">{holiday.name}</h3>
                            <div className="mt-1">{getHolidayTypeBadge(holiday.type)}</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(holiday)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="text-center text-sm text-gray-500">
                <p>Highlighted dates indicate holidays. Click on a date to see details.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};