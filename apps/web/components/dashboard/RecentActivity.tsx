/**
 * Recent Activity
 *
 * Feed showing recent actions with avatars and descriptions
 */

'use client';

import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui';

// Mock data for now - replace with real activity data when available
const mockActivity = [
  {
    id: '1',
    actor: 'Sarah',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    action: 'marked',
    target: '"Wireless Headphones"',
    status: 'Purchased',
  },
  {
    id: '2',
    actor: 'Mike',
    actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    action: 'added',
    target: '"Smart Watch"',
    status: 'Ideas',
  },
  {
    id: '3',
    actor: 'Emma',
    actorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    action: 'marked',
    target: '"Coffee Maker"',
    status: 'To Buy',
  },
  {
    id: '4',
    actor: 'Sarah',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    action: 'commented on',
    target: '"Wireless Headphones"',
    status: 'Great choice!',
  },
  {
    id: '5',
    actor: 'Mike',
    actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    action: 'marked',
    target: '"Board Game"',
    status: 'Purchased',
  },
];

export function RecentActivity() {
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 h-full shadow-sm relative overflow-hidden">
      <h3 className="text-xl font-bold text-charcoal mb-8">Recent Activity</h3>

      <div className="space-y-6 relative z-10">
        {mockActivity.map((log) => (
          <div key={log.id} className="flex items-start gap-4 animate-fade-in">
            <Avatar size="md" className="flex-shrink-0 border-2 border-white shadow-sm">
              <AvatarImage src={log.actorAvatar} alt={log.actor} />
              <AvatarFallback>{getInitials(log.actor)}</AvatarFallback>
            </Avatar>

            <div className="pt-1 flex-1 min-w-0">
              <p className="text-charcoal leading-relaxed text-sm md:text-base">
                <span className="font-bold">{log.actor}</span> {log.action}{' '}
                <span className="font-semibold text-charcoal/90">{log.target}</span>
                {log.status && (
                  <>
                    {' '}as <span className="font-semibold">{log.status}</span>
                  </>
                )}
                .
              </p>
            </div>
          </div>
        ))}

        {/* Scrollbar Indicator */}
        <div className="absolute right-4 md:right-6 top-20 bottom-20 w-1.5 bg-warm-200 rounded-full opacity-50">
          <div className="w-full h-1/3 bg-warm-400 rounded-full mt-4"></div>
        </div>
      </div>

      {/* Decorative Background Blur */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-sage/20 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}
