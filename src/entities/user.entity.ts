import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsArray, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  @IsNotEmpty()
  username: string;

  @Prop()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Prop()
  password: string;

  @Prop()
  @IsOptional()
  avatar?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  @IsArray()
  @IsOptional()
  friendIds?: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  @IsArray()
  @IsOptional()
  receivedFriendRequests?: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  @IsArray()
  @IsOptional()
  sentFriendRequests?: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
