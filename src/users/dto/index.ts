import { IsNotEmpty } from 'class-validator';

export class SendFriendRequestDto {
  @IsNotEmpty()
  receiverId: string;
}
export class AcceptFriendRequestDto {
  requestId: string;
}
