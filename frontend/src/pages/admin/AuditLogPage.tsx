import React, { useState } from 'react';
import { FileCheck, Shield, Search, Filter, Download, Activity, Clock, User, HardDrive } from 'lucide-react';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}

const MOCK_AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'LOG-9823',
    timestamp: '2026-09-21 22:45:12',
    user: 'Rajesh Sharma',
    role: 'Safety Officer',
    action: 'INSPECTION_SUBMIT',
    resource: 'Pit 4 DGMS Safety Checklist',
    ipAddress: '10.14.2.102',
    status: 'SUCCESS',
    details: 'Logged geo-tagged inspection with 3 observations',
  },
  {
    id: 'LOG-9822',
    timestamp: '2026-09-21 21:12:04',
    user: 'Anita Roy',
    role: 'Environmental Officer',
    action: 'DOCUMENT_UPLOAD',
    resource: 'MoEFCC Air Quality Clearance 2026.pdf',
    ipAddress: '10.14.2.88',
    status: 'SUCCESS',
    details: 'Uploaded regulatory document; OCR text extracted',
  },
  {
    id: 'LOG-9821',
    timestamp: '2026-09-21 19:30:55',
    user: 'System Bot',
    role: 'Automated Engine',
    action: 'ALERT_ESCALATION',
    resource: 'Methane Concentration Alert #402',
    ipAddress: '127.0.0.1',
    status: 'WARNING',
    details: 'Escalated safety alert to Mine Manager due to SLA breach',
  },
  {
    id: 'LOG-9820',
    timestamp: '2026-09-21 18:05:19',
    user: 'Sanjay Kumar',
    role: 'Mine Official',
    action: 'CORRECTIVE_ACTION_UPDATE',
    resource: 'Action #ACT-109',
    ipAddress: '10.14.3.44',
    status: 'SUCCESS',
    details: 'Status changed from In Progress to Resolved',
  },
  {
    id: 'LOG-9819',
    timestamp: '2026-09-21 16:22:40',
    user: 'Contractor Admin',
    role: 'Contractor',
    action: 'MANPOWER_UPDATE',
    resource: 'Shift B Worker Roster',
    ipAddress: '192.168.1.15',
    status: 'SUCCESS',
    details: 'Updated 142 worker DGMS medical certification records',
  },
  {
    id: 'LOG-9818',
    timestamp: '2026-09-21 14:10:02',
    user: 'Unknown User',
    role: 'Guest',
    action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
    resource: '/api/admin/users',
    ipAddress: '185.220.101.5',
    status: 'FAILED',
    details: 'Invalid JWT token; access blocked by RBAC middleware',
  },
];

export const AuditLogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F59E0B] mb-1">
            <Shield className="w-4 h-4" /> Immutable Audit Trail
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Audit & Compliance Logs</h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time security logs, statutory action history, and RBAC authentication trails for DGMS & regulatory auditing.
          </p>
        </div>
        <button
          onClick={() => alert('Exporting encrypted audit log CSV...')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Download className="w-4 h-4" /> Export Immutable Log
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">14,289</div>
            <div className="text-xs font-medium text-slate-500">Total System Events</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">99.8%</div>
            <div className="text-xs font-medium text-slate-500">Compliance Rate</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">24/7</div>
            <div className="text-xs font-medium text-slate-500">Active Monitoring</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">SHA-256</div>
            <div className="text-xs font-medium text-slate-500">Hash Integrity Verification</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs by user, action, resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success Only</option>
            <option value="WARNING">Warnings</option>
            <option value="FAILED">Blocked/Failed</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Log ID & Timestamp</th>
                <th className="px-4 py-3">User & Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Resource Target</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{log.id}</div>
                    <div className="text-[10px] text-slate-400">{log.timestamp}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {log.user}
                    </div>
                    <div className="text-[10px] text-slate-500">{log.role}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-semibold">{log.resource}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{log.ipAddress}</td>
                  <td className="px-4 py-3">
                    {log.status === 'SUCCESS' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        SUCCESS
                      </span>
                    )}
                    {log.status === 'WARNING' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        WARNING
                      </span>
                    )}
                    {log.status === 'FAILED' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        BLOCKED
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
