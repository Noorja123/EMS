import React, { useState } from "react";
import { useEmployee } from "./EmployeeContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Calendar as CalendarIcon,
  Star,
  List,
  CalendarDays,
  Building,
} from "lucide-react";

export const EmployeeHolidayCalendar: React.FC = () => {
  const { holidays, loading } = useEmployee();
  const [selectedDate, setSelectedDate] = useState<
    Date | undefined
  >(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">(
    "calendar",
  );

  // Sort holidays by date
  const sortedHolidays = holidays.sort(
    (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Get upcoming holidays (next 5)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingHolidays = sortedHolidays
    .filter((holiday) => new Date(holiday.date) >= today)
    .slice(0, 5);

  // Get holiday dates for calendar
  const holidayDates = holidays.map(
    (holiday) => new Date(holiday.date),
  );

  // Check if a date is a holiday
  const isHolidayDate = (date: Date) => {
    return holidayDates.some(
      (holidayDate) =>
        holidayDate.getFullYear() === date.getFullYear() &&
        holidayDate.getMonth() === date.getMonth() &&
        holidayDate.getDate() === date.getDate(),
    );
  };

  // Get holidays for selected date
  const getHolidaysForDate = (date: Date) => {
    return holidays.filter((holiday) => {
      const holidayDate = new Date(holiday.date);
      return (
        holidayDate.getFullYear() === date.getFullYear() &&
        holidayDate.getMonth() === date.getMonth() &&
        holidayDate.getDate() === date.getDate()
      );
    });
  };

  const getHolidayTypeBadge = (type: string) => {
    return type === "public" ? (
      <Badge
        variant="outline"
        className="text-blue-600 border-blue-200"
      >
        <Star className="w-3 h-3 mr-1" />
        Public Holiday
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="text-purple-600 border-purple-200"
      >
        <Building className="w-3 h-3 mr-1" />
        Company Holiday
      </Badge>
    );
  };

  // Group holidays by month for list view
  const holidaysByMonth = sortedHolidays.reduce(
    (acc, holiday) => {
      const date = new Date(holiday.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });

      if (!acc[monthKey]) {
        acc[monthKey] = {
          name: monthName,
          holidays: [],
        };
      }
      acc[monthKey].holidays.push(holiday);
      return acc;
    },
    {} as Record<
      string,
      { name: string; holidays: typeof holidays }
    >,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <span>Holiday Calendar</span>
              </CardTitle>
              <CardDescription>
                View public and company holidays
              </CardDescription>
            </div>
            <div className="flex rounded-md shadow-sm">
              <Button
                variant={
                  viewMode === "calendar"
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => setViewMode("calendar")}
                className="rounded-r-none"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={
                  viewMode === "list" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Upcoming Holidays */}
      {upcomingHolidays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <span>Upcoming Holidays</span>
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-200"
              >
                {upcomingHolidays.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Next holidays to look forward to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingHolidays.map((holiday) => {
                const holidayDate = new Date(holiday.date);
                const isToday =
                  holidayDate.toDateString() ===
                  new Date().toDateString();
                const daysDiff = Math.ceil(
                  (holidayDate.getTime() - today.getTime()) /
                    (1000 * 60 * 60 * 24),
                );

                return (
                  <div
                    key={holiday.id}
                    className={`p-4 border rounded-lg ${
                      isToday
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <h3 className="font-medium text-gray-900 mb-2">
                      {holiday.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {holidayDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <div className="flex items-center justify-between">
                      {getHolidayTypeBadge(holiday.type)}
                      <span className="text-xs text-gray-500">
                        {isToday
                          ? "Today!"
                          : daysDiff === 1
                            ? "Tomorrow"
                            : `In ${daysDiff} days`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : holidays.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Holidays Scheduled
              </h3>
              <p className="text-gray-500">
                No holidays have been added to the calendar yet.
              </p>
            </div>
          ) : viewMode === "calendar" ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    holiday: holidayDates,
                  }}
                  modifiersStyles={{
                    holiday: {
                      backgroundColor: "#dbeafe",
                      color: "#1d4ed8",
                      fontWeight: "bold",
                    },
                  }}
                />
              </div>

              {selectedDate && isHolidayDate(selectedDate) && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Holidays on{" "}
                      {selectedDate.toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getHolidaysForDate(selectedDate).map(
                        (holiday) => (
                          <div
                            key={holiday.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {holiday.name}
                              </h3>
                              <div className="mt-1">
                                {getHolidayTypeBadge(
                                  holiday.type,
                                )}
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="text-center text-sm text-gray-500">
                <p>
                  Highlighted dates indicate holidays. Click on
                  a date to see details.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(holidaysByMonth).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <List className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No holidays to display</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(holidaysByMonth).map(
                    ([monthKey, { name, holidays }]) => (
                      <div key={monthKey}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {name}
                        </h3>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>
                                  Holiday Name
                                </TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Day</TableHead>
                                <TableHead>Type</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {holidays.map((holiday) => (
                                <TableRow key={holiday.id}>
                                  <TableCell className="font-medium">
                                    {holiday.name}
                                  </TableCell>
                                  <TableCell>
                                    {new Date(
                                      holiday.date,
                                    ).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    {new Date(
                                      holiday.date,
                                    ).toLocaleDateString(
                                      "en-US",
                                      { weekday: "long" },
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {getHolidayTypeBadge(
                                      holiday.type,
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-blue-600" />
            <span>Holiday Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
              <span>
                Public holidays are observed company-wide and
                are paid time off
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
              <span>
                Company holidays are specific to our
                organization
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
              <span>
                You cannot request personal leave on official
                holidays
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
              <span>
                Plan your personal time off around these dates
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};