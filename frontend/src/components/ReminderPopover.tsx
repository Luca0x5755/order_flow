import { useReminders, useMarkReminderAsRead } from '@/hooks/useCRM';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, AlertCircle, Clock, RefreshCcw, PartyPopper, Eye } from 'lucide-react';

const typeIcons = {
  follow_up: Clock,
  no_order: AlertCircle,
  birthday: PartyPopper,
  renewal: RefreshCcw,
};

const typeLabels = {
  follow_up: '跟進提醒',
  no_order: '久未下單',
  birthday: '生日提醒',
  renewal: '續約提醒',
};

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
};

export default function ReminderPopover() {
  const { data: reminders = [] } = useReminders();
  const markAsRead = useMarkReminderAsRead();

  const unreadCount = reminders.filter(r => !r.is_read).length;

  const handleView = (id: string) => {
    markAsRead.mutate(id);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <h4 className="font-semibold">待辦提醒</h4>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} 則未讀通知` : '沒有未讀通知'}
          </p>
        </div>
        <ScrollArea className="h-80">
          {reminders.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              目前沒有待辦提醒
            </div>
          ) : (
            <div className="divide-y">
              {reminders.map((reminder) => {
                const Icon = typeIcons[reminder.type];
                return (
                  <div
                    key={reminder.id}
                    className={`p-3 hover:bg-muted/50 transition-colors ${
                      !reminder.is_read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 p-1.5 rounded-full ${priorityColors[reminder.priority]}`}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {typeLabels[reminder.type]}
                          </Badge>
                          {!reminder.is_read && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm font-medium truncate">
                          {reminder.customer_name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {reminder.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            到期：{reminder.due_date}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            asChild
                            onClick={() => handleView(reminder.id)}
                          >
                            <Link to={`/admin/crm/${reminder.customer_id}`}>
                              <Eye className="h-3 w-3 mr-1" />
                              查看
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
