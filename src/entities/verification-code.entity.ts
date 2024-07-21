import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDate, IsEmail, IsNotEmpty } from 'class-validator';
import { HydratedDocument } from 'mongoose';

export type VerificationCodeDocument = HydratedDocument<VerificationCode>;

@Schema({
  timestamps: true,
})
export class VerificationCode {
  @Prop({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Prop({ unique: true })
  code: string;

  @Prop()
  @IsDate()
  expires: Date;
}

export const VerificationCodeSchema =
  SchemaFactory.createForClass(VerificationCode);
