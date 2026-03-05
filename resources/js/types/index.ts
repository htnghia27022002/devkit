export type * from './auth';
export type * from './navigation';
export type * from './notification';
export type * from './ui';
export type * from './webhook';

import type { Auth } from './auth';

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
};
