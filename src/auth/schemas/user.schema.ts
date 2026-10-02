import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type UserDocument = User & Document;

export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    PG_ADMIN = 'PG_ADMIN',
    BRANCH_MANAGER = 'BRANCH_MANAGER',
    RESIDENT = 'RESIDENT',
    TENENT = 'TENENT'
}

@Schema({ timestamps: true })
export class User {
    @Prop({
        type: String,
        required: true,
        trim: true,
        default: () => uuidv4()
    })
    _id!: string;

    @Prop({ required: true })
    name!: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email!: string;

    @Prop({ required: true })
    password!: string;

    @Prop({ type: String, enum: Role, default: Role.PG_ADMIN })
    role!: Role;

    @Prop({ type: String, default: null, index: true })
    pgId!: String;

    @Prop({ type: String, default: null })
    refreshToken!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);