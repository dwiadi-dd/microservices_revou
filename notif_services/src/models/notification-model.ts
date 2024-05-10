export interface NotificationModel {
  id: number;
  message: string;
  received_at: Date;
}

export interface CreateNotifRequest {
  message: string;
}

export interface CreateNotifResponse {
  id: number;
}
