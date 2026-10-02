import { IsNotEmpty, IsString, IsNumber, IsIn, Min } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;
}

export class AddFloorDto {
  @IsNumber()
  @Min(0)
  floorNumber!: number;
}

export class AddRoomDto {
  @IsString()
  @IsNotEmpty()
  roomNumber!: string;

  @IsString()
  @IsIn(['SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR'])
  sharingType!: string;

  @IsNumber()
  @Min(0)
  rentPerBed!: number;
}