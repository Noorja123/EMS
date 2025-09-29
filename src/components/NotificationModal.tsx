import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { CheckCircle, XCircle, Mail, Calendar, User } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'approved' | 'rejected';
  employeeName: string;
  leaveType: string;
  dates: string;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  type,
  employeeName,
  leaveType,
  dates
}) => {
  const isApproved = type === 'approved';
  
  const emailContent = `
Dear ${employeeName},

Your ${leaveType.toLowerCase()} leave request for ${dates} has been ${type}.

${isApproved 
  ? 'Your leave has been approved and will be deducted from your leave balance. Please ensure all necessary handovers are completed before your leave begins.'
  : 'Unfortunately, your leave request could not be approved at this time. Please contact HR or your manager for more information.'
}

Best regards,
HR Department
Employee Management System
  `.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {isApproved ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <span>Email Notification Sent</span>
          </DialogTitle>
          <DialogDescription>
            Simulated email notification for leave request status update
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Preview */}
          <div className="border rounded-lg bg-gray-50">
            <div className="p-4 border-b bg-white rounded-t-lg">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>Email Preview</span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">To:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{employeeName}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Subject:</span>
                    <div className="mt-1">
                      Leave Request {isApproved ? 'Approved' : 'Rejected'} - {leaveType}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                    {emailContent}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className={`p-4 rounded-lg border-2 ${
            isApproved 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-3">
              {isApproved ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`font-medium ${
                  isApproved ? 'text-green-900' : 'text-red-900'
                }`}>
                  Leave Request {isApproved ? 'Approved' : 'Rejected'}
                </h3>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>Employee: {employeeName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{leaveType} leave for {dates}</span>
                  </div>
                </div>
                {isApproved && (
                  <p className="mt-2 text-sm text-green-700">
                    The requested days have been deducted from the employee's leave balance.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};