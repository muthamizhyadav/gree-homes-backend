import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type PgGroupDocument = PgGroup & Document;

@Schema({ timestamps: true })
export class PgGroup {
    @Prop({
        type: String,
        required: true,
        trim: true,
        default: () => uuidv4()
    })
    _id!: string;

    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ trim: true })
    contactNumber?: string;
}

export const PgGroupSchema = SchemaFactory.createForClass(PgGroup);