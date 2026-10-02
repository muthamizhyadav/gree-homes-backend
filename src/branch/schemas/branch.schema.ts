import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type BranchDocument = HydratedDocument<Branch>;

export enum SharingType {
    SINGLE = 'SINGLE',
    DOUBLE = 'DOUBLE',
    TRIPLE = 'TRIPLE',
    FOUR = 'FOUR',
  }
  

@Schema({ _id: false })
export class Bed {
  @Prop({
    type: String,
    required: true,
    default: () => uuidv4(),
  })
  _id!: string;

  @Prop({ required: true, trim: true })
  bedNumber!: string;

  @Prop({ default: false })
  isOccupied!: boolean;

  @Prop({ type: String, default: null })
  occupiedBy!: string | null;
}

export const BedSchema = SchemaFactory.createForClass(Bed);


@Schema({ _id: false })
export class Room {
  @Prop({
    type: String,
    required: true,
    default: () => uuidv4(),
  })
  _id!: string;

  @Prop({ required: true, trim: true })
  roomNumber!: string;

  @Prop({
    required: true,
    enum: ['SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR'],
  })
  sharingType!: string;

  @Prop({ required: true })
  rentPerBed!: number;

  @Prop({ type: [BedSchema], default: [] })
  beds!: Bed[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);


@Schema({ _id: false })
export class Floor {
  @Prop({
    type: String,
    required: true,
    default: () => uuidv4(),
  })
  _id!: string;

  @Prop({ required: true })
  floorNumber!: number;

  @Prop({ type: [RoomSchema], default: [] })
  rooms!: Room[];
}

export const FloorSchema = SchemaFactory.createForClass(Floor);


@Schema({ timestamps: true })
export class Branch {
  @Prop({
    type: String,
    required: true,
    default: () => uuidv4(),
  })
  _id!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  address!: string;

  @Prop({ required: true, trim: true })
  city!: string;

  @Prop({
    type: String,
    required: true,
    index: true,
  })
  pgId!: string;

  @Prop({ type: [FloorSchema], default: [] })
  floors!: Floor[];
}

export const BranchSchema = SchemaFactory.createForClass(Branch);