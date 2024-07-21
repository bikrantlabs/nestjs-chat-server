type MessageType = 'error' | 'success' | 'warning';
export interface ReturnType {
  data: {
    message: string;
    type: MessageType;
  };
  success: boolean;
}
