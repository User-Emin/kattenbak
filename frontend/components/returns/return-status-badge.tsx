'use client';

import { ReturnStatus, RETURN_STATUS_LABELS } from '@/types/return';
import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react';

/**
 * RETURN STATUS BADGE - DRY Component
 * Visual status indicator (dynamic!)
 * NO HARDCODED STYLES!
 */

interface ReturnStatusBadgeProps {
  status: ReturnStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

// DRY: Status → Color mapping
const STATUS_COLORS: Record<ReturnStatus, string> = {
  [ReturnStatus.REQUESTED]: 'bg-[#3071aa]/10 text-[#3071aa] border-[#3071aa]/20',
  [ReturnStatus.LABEL_CREATED]: 'bg-[#3071aa]/10 text-[#3071aa] border-[#3071aa]/20',
  [ReturnStatus.LABEL_SENT]: 'bg-[#3071aa]/10 text-[#3071aa] border-[#3071aa]/20',
  [ReturnStatus.IN_TRANSIT]: 'bg-purple-100 text-purple-800 border-purple-200',
  [ReturnStatus.RECEIVED]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [ReturnStatus.INSPECTED]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [ReturnStatus.APPROVED]: 'bg-green-100 text-green-800 border-green-200',
  [ReturnStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-200',
  [ReturnStatus.REFUND_PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [ReturnStatus.REFUND_PROCESSED]: 'bg-green-100 text-green-800 border-green-200',
  [ReturnStatus.CLOSED]: 'bg-gray-100 text-gray-800 border-gray-200',
};

// DRY: Status → Icon mapping
function getStatusIcon(status: ReturnStatus) {
  const iconMap: Record<ReturnStatus, any> = {
    [ReturnStatus.REQUESTED]: Clock,
    [ReturnStatus.LABEL_CREATED]: Package,
    [ReturnStatus.LABEL_SENT]: Package,
    [ReturnStatus.IN_TRANSIT]: Truck,
    [ReturnStatus.RECEIVED]: CheckCircle,
    [ReturnStatus.INSPECTED]: CheckCircle,
    [ReturnStatus.APPROVED]: CheckCircle,
    [ReturnStatus.REJECTED]: XCircle,
    [ReturnStatus.REFUND_PENDING]: Clock,
    [ReturnStatus.REFUND_PROCESSED]: CheckCircle,
    [ReturnStatus.CLOSED]: CheckCircle,
  };

  return iconMap[status] || Clock;
}

export function ReturnStatusBadge({
  status,
  size = 'md',
  showIcon = true,
}: ReturnStatusBadgeProps) {
  const Icon = getStatusIcon(status);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-medium border ${STATUS_COLORS[status]} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {RETURN_STATUS_LABELS[status]}
    </span>
  );
}



