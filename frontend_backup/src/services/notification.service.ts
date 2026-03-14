import api from '../lib/axios';

export interface Notification {
  id: number;
  title: string;
  message: string;
  icon: 'info' | 'success' | 'warning' | 'alert';
  type: string;
  status: string;
  time: string;
}

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await api.get<Notification[]>('/notifications/');
  return data;
}

export async function createNotification(payload: { target: string, title: string, message: string }): Promise<Notification> {
  const { data } = await api.post<Notification>('/notifications/', payload);
  return data;
}
