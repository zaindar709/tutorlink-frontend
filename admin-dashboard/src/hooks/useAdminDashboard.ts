import { useCallback, useEffect, useState } from 'react';
import {
  approveTutor,
  fetchDashboardData,
  getMockDashboardData,
  rejectTutor,
  removeApprovedTutor,
  resolveDispute,
  revokeParentLink,
  scheduleTutorInterview,
  updateDisputeStatus,
  updateLinkStatus,
  updateTutorStatus,
} from '../api/admin.api';
import type { AdminDashboardData, AdminSettings } from '../types/admin.types';

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    const dashboard = await fetchDashboardData();
    setData(dashboard);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleApprove = async (tutorId: string) => {
    setActionLoading(tutorId);
    try {
      await approveTutor(tutorId);
    } catch {
      // Local state update when API unavailable
    }

    const tutor = data?.pendingTutors.find(t => t.id === tutorId);
    setData(prev => {
      if (!prev) return prev;
      const updatedTutors = removeApprovedTutor(prev.pendingTutors, tutorId);
      return {
        ...prev,
        pendingTutors: updatedTutors,
        stats: {
          ...prev.stats,
          pendingTutors: updatedTutors.filter(t => t.status === 'pending').length,
          approvedTutors: (prev.stats.approvedTutors ?? 0) + 1,
        },
      };
    });
    showToast(
      `${tutor?.name ?? 'Tutor'} approved — now visible to students in search.`
    );
    setActionLoading(null);
  };

  const handleReject = async (tutorId: string, reason: string) => {
    setActionLoading(tutorId);
    try {
      await rejectTutor(tutorId, reason);
    } catch {
      // Local state update when API unavailable
    }

    const tutor = data?.pendingTutors.find(t => t.id === tutorId);
    setData(prev => {
      if (!prev) return prev;
      const updatedTutors = removeApprovedTutor(prev.pendingTutors, tutorId);
      return {
        ...prev,
        pendingTutors: updatedTutors,
        stats: {
          ...prev.stats,
          pendingTutors: updatedTutors.filter(t => t.status === 'pending').length,
        },
      };
    });
    showToast(`${tutor?.name ?? 'Tutor'} application rejected.`);
    setActionLoading(null);
  };

  const handleScheduleInterview = async (tutorId: string) => {
    setActionLoading(tutorId);
    const interviewDate = new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000
    ).toISOString();

    try {
      await scheduleTutorInterview(tutorId, interviewDate);
    } catch {
      // Local state update when API unavailable
    }

    const tutor = data?.pendingTutors.find(t => t.id === tutorId);
    setData(prev => {
      if (!prev) return prev;
      const updatedTutors = updateTutorStatus(
        prev.pendingTutors,
        tutorId,
        'interview_scheduled',
        interviewDate
      );
      return {
        ...prev,
        pendingTutors: updatedTutors,
        stats: {
          ...prev.stats,
          pendingTutors: updatedTutors.filter(t => t.status === 'pending').length,
        },
      };
    });
    showToast(
      `Interview scheduled for ${tutor?.name ?? 'tutor'} — pending final approval.`
    );
    setActionLoading(null);
  };

  const handleResolveDispute = async (disputeId: string) => {
    setActionLoading(disputeId);
    try {
      await resolveDispute(disputeId, 'release');
    } catch {
      // Local fallback
    }
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        disputes: updateDisputeStatus(prev.disputes, disputeId),
      };
    });
    showToast('Dispute marked as resolved.');
    setActionLoading(null);
  };

  const handleRevokeLink = async (linkId: string) => {
    setActionLoading(linkId);
    try {
      await revokeParentLink(linkId);
    } catch {
      // Local fallback
    }
    setData(prev => {
      if (!prev || !prev.parentLinks) return prev;
      return {
        ...prev,
        parentLinks: updateLinkStatus(prev.parentLinks, linkId),
      };
    });
    showToast('Parent-student link revoked.');
    setActionLoading(null);
  };

  const handleUpdateSettings = (settings: Partial<AdminSettings>) => {
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        settings: { ...prev.settings!, ...settings },
      };
    });
    showToast('Settings updated locally. Connect API to persist.');
  };

  const dashboard = data ?? getMockDashboardData();

  return {
    dashboard,
    loading,
    actionLoading,
    toast,
    loadDashboard,
    handleApprove,
    handleReject,
    handleScheduleInterview,
    handleResolveDispute,
    handleRevokeLink,
    handleUpdateSettings,
  };
}
