// ============================================================
// ADMIN MODAL — System Administration & Role Permissions
// Demonstrates: User & Role assignment, Project-level access,
// Module permissions, and Read vs Edit rights
// ============================================================

import React, { useState } from 'react';
import { X, Shield, Users, Lock, Key, Check, Plus, FolderKanban } from 'lucide-react';
import { useApp, type UserRole } from '../store/appStore';
import { PROJECTS } from '../data/seedData';

interface UserAssignment {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  projects: string[];
  permissions: {
    overview: 'Edit' | 'View';
    wip: 'Edit' | 'View';
    wir: 'Edit' | 'View';
    audit: 'Edit' | 'View';
    nc: 'Edit' | 'View';
    contractors: 'Edit' | 'View';
  };
}

const INITIAL_USERS: UserAssignment[] = [
  {
    id: 'U01',
    name: 'Rajiv Malhotra',
    email: 'rajiv.m@lodhagroup.com',
    role: 'CXO',
    projects: ['P001', 'P002', 'P003', 'P004', 'P005', 'P006', 'P007'],
    permissions: { overview: 'View', wip: 'View', wir: 'View', audit: 'View', nc: 'View', contractors: 'View' },
  },
  {
    id: 'U02',
    name: 'Sameer Joshi',
    email: 's.joshi@lodhagroup.com',
    role: 'ProjectsHead',
    projects: ['P001', 'P002', 'P004', 'P005', 'P007'],
    permissions: { overview: 'View', wip: 'Edit', wir: 'View', audit: 'View', nc: 'Edit', contractors: 'View' },
  },
  {
    id: 'U03',
    name: 'Vikram Joshi',
    email: 'v.joshi@projects.in',
    role: 'ProjectManager',
    projects: ['P004'],
    permissions: { overview: 'View', wip: 'Edit', wir: 'View', audit: 'View', nc: 'Edit', contractors: 'View' },
  },
  {
    id: 'U04',
    name: 'Rajan Mehta',
    email: 'r.mehta@qa-audit.com',
    role: 'QualityInspector',
    projects: ['P001'],
    permissions: { overview: 'View', wip: 'View', wir: 'Edit', audit: 'Edit', nc: 'Edit', contractors: 'View' },
  },
  {
    id: 'U05',
    name: 'Ketan Patel (ABC Civil)',
    email: 'k.patel@abccivil.com',
    role: 'Contractor',
    projects: ['P001', 'P004', 'P007'],
    permissions: { overview: 'View', wip: 'Edit', wir: 'Edit', audit: 'View', nc: 'Edit', contractors: 'View' },
  },
];

export function AdminModal() {
  const { state, setAdminModalOpen, setUserRole } = useApp();
  const [users, setUsers] = useState<UserAssignment[]>(INITIAL_USERS);
  const [selectedUserId, setSelectedUserId] = useState<string>('U01');
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'projects'>('users');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!state.adminModalOpen) return null;

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  const handleRoleChange = (role: UserRole) => {
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role } : u));
    setToastMsg(`Role updated to ${role} for ${selectedUser.name}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleProject = (projId: string) => {
    const has = selectedUser.projects.includes(projId);
    const updated = has
      ? selectedUser.projects.filter(id => id !== projId)
      : [...selectedUser.projects, projId];
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, projects: updated } : u));
  };

  const handleTogglePerm = (module: keyof UserAssignment['permissions']) => {
    const current = selectedUser.permissions[module];
    const next = current === 'Edit' ? 'View' : 'Edit';
    setUsers(users.map(u =>
      u.id === selectedUser.id
        ? { ...u, permissions: { ...u.permissions, [module]: next } }
        : u
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Shield size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Administration & Access Control</h3>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 text-blue-800">
                  System Admin
                </span>
              </div>
              <p className="text-xs text-slate-500">Configure role scopes, project allocation, and module edit permissions</p>
            </div>
          </div>
          <button
            onClick={() => setAdminModalOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Subheader */}
        <div className="flex items-center justify-between px-6 border-b border-slate-200 bg-white">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users size={14} />
              <span>User & Role Assignment</span>
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'projects' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FolderKanban size={14} />
              <span>Project Scopes</span>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'roles' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Key size={14} />
              <span>Module Permissions (Read vs Edit)</span>
            </button>
          </div>
          {toastMsg && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md animate-in fade-in">
              {toastMsg}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-12 gap-6 bg-[#FAFAFA]">
          {/* Left Column: User List */}
          <div className="col-span-4 bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-1.5 overflow-y-auto max-h-[480px]">
            <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Assigned Users ({users.length})
            </div>
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedUserId(u.id)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                  selectedUserId === u.id
                    ? 'border-blue-500 bg-blue-50/60 shadow-2xs'
                    : 'border-transparent hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {u.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{u.email}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {u.projects.length} Project{u.projects.length > 1 ? 's' : ''} assigned
                </p>
              </button>
            ))}
          </div>

          {/* Right Column: User Settings */}
          <div className="col-span-8 space-y-4">
            {/* User Overview Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedUser.name}</h4>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    setUserRole(selectedUser.role);
                    setToastMsg(`Switched live preview role to ${selectedUser.role}`);
                    setTimeout(() => setToastMsg(null), 3000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Users size={13} />
                  <span>Switch Live Role Preview</span>
                </button>
              </div>

              {/* Role Selector Buttons */}
              <div className="mt-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Assign System Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CXO', 'ProjectsHead', 'ProjectManager', 'QualityInspector', 'Contractor', 'Admin'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`p-2 rounded-lg text-xs font-bold border transition-all text-left flex items-center justify-between ${
                        selectedUser.role === r
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{r === 'ProjectsHead' ? 'Projects Head' : r === 'ProjectManager' ? 'Project Mgr' : r === 'QualityInspector' ? 'Quality Insp.' : r}</span>
                      {selectedUser.role === r && <Check size={14} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Allocation Matrix */}
            {activeTab === 'projects' || activeTab === 'users' ? (
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Project-Level Access Matrix ({selectedUser.projects.length} selected)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto">
                  {PROJECTS.map(p => {
                    const active = selectedUser.projects.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleToggleProject(p.id)}
                        className={`p-2.5 rounded-lg text-xs font-medium border flex items-center justify-between transition-all text-left ${
                          active
                            ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950 font-semibold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs">{p.name}</p>
                          <p className="text-[10px] text-slate-500">{p.city} · {p.stage}</p>
                        </div>
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                          active ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-transparent'
                        }`}>
                          ✓
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Module Permissions Matrix */}
            {activeTab === 'roles' || activeTab === 'users' ? (
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Module-Level Permissions (Read vs Edit)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(selectedUser.permissions) as (keyof UserAssignment['permissions'])[]).map(mod => {
                    const perm = selectedUser.permissions[mod];
                    const isEdit = perm === 'Edit';
                    return (
                      <div
                        key={mod}
                        className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between bg-slate-50/40"
                      >
                        <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                          {mod}
                        </span>
                        <button
                          onClick={() => handleTogglePerm(mod)}
                          className={`px-2 py-0.5 rounded text-[11px] font-black transition-colors ${
                            isEdit
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {perm}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-white">
          <p className="text-xs text-slate-500">
            Changes apply in-memory to the current prototype session.
          </p>
          <button
            onClick={() => setAdminModalOpen(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
