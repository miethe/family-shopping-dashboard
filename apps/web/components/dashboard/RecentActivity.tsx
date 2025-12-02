/**
 * Recent Activity
 *
 * Feed showing recent actions with avatars and descriptions
 */

'use client';

import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui';
import { useRecentActivity } from '@/hooks/useActivity';
import { formatTimeAgo } from '@/lib/date-utils';
import type { ActivityAction } from '@/types';

// Icon mapping for different activity actions
const actionIcons: Record<ActivityAction, string> = {
  gift_added: 'add_circle',
  gift_purchased: 'shopping_cart',
  gift_received: 'redeem',
  list_created: 'playlist_add',
  status_changed: 'sync',
};

export function RecentActivity() {
  const { data, isLoading, error } = useRecentActivity({ limit: 10 });

  if (isLoading) {
    return (
      <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 h-full shadow-sm relative overflow-hidden">
        <h3 className="text-xl font-bold text-charcoal mb-8">Recent Activity</h3>
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 animate-pulse">
              <div className="w-10 h-10 bg-warm-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-warm-200 rounded w-3/4"></div>
                <div className="h-3 bg-warm-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 h-full shadow-sm relative overflow-hidden">
        <h3 className="text-xl font-bold text-charcoal mb-8">Recent Activity</h3>
        <div className="text-center py-8">
          <span className="material-symbols-rounded text-4xl text-warm-400 mb-2">
            error_outline
          </span>
          <p className="text-charcoal/60 text-sm">Failed to load activity feed</p>
        </div>
      </div>
    );
  }

  const activities = data?.events || [];

  if (activities.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 h-full shadow-sm relative overflow-hidden">
        <h3 className="text-xl font-bold text-charcoal mb-8">Recent Activity</h3>
        <div className="text-center py-8">
          <span className="material-symbols-rounded text-4xl text-warm-300 mb-2">
            notifications_none
          </span>
          <p className="text-charcoal/60 text-sm">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 h-full shadow-sm relative overflow-hidden">
      <h3 className="text-xl font-bold text-charcoal mb-8">Recent Activity</h3>

      <div className="space-y-6 relative z-10">
        {activities.map((event) => {
          // Get actor display name (use email if display_name not available)
          const actorName = event.actor.email.split('@')[0];

          return (
            <div key={event.id} className="flex items-start gap-4 animate-fade-in">
              <Avatar size="md" className="flex-shrink-0 border-2 border-white shadow-sm">
                <AvatarFallback>{getInitials(actorName)}</AvatarFallback>
              </Avatar>

              <div className="pt-1 flex-1 min-w-0">
                <p className="text-charcoal leading-relaxed text-sm md:text-base">
                  {event.description}
                </p>
                <p className="text-charcoal/50 text-xs mt-1">
                  {formatTimeAgo(event.created_at)}
                </p>
              </div>
            </div>
          );
        })}

        {/* Scrollbar Indicator */}
        {activities.length > 3 && (
          <div className="absolute right-4 md:right-6 top-20 bottom-20 w-1.5 bg-warm-200 rounded-full opacity-50">
            <div className="w-full h-1/3 bg-warm-400 rounded-full mt-4"></div>
          </div>
        )}
      </div>

      {/* Decorative Background Blur */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-sage/20 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}
