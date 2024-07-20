import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDate, IsEmail, IsNotEmpty } from 'class-validator';
import { HydratedDocument } from 'mongoose';

export type VerificationTokenDocument = HydratedDocument<VerificationToken>;

@Schema({
  timestamps: true,
})
export class VerificationToken {
  @Prop({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Prop({ unique: true })
  token: string;

  @Prop()
  @IsDate()
  expires: Date;
}

export const VerificationTokenSchema =
  SchemaFactory.createForClass(VerificationToken);
