export type { Notification } from './notification';

export interface PaginatedData<T> {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
    };
}

export interface NotificationSetting {
    id: number;
    user_id: number;
    preferences: Record<string, boolean>;
    enabled_channels: string[];
    quiet_hours_start: string | null;
    quiet_hours_end: string | null;
    timezone: string;
    created_at: string;
    updated_at: string;
}
