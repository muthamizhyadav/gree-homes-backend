import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Branch, BranchDocument, SharingType } from './schemas/branch.schema';
import { CreateBranchDto, AddFloorDto, AddRoomDto } from './dto/branch.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BranchService {
    constructor(@InjectModel(Branch.name)  private readonly branchModel: Model<BranchDocument>) { }

    async createBranch(pgId: string, dto: CreateBranchDto) {
        return this.branchModel.create({
            ...dto,
            pgId: pgId,
            floors: [],
        });
    }

    async getBranchesByPg(pgId: string) {
        return this.branchModel.find({ pgId: pgId }).exec();
    }

    async addFloor(
        pgId: string,
        branchId: string,
        dto: AddFloorDto,
    ) {
        const branch = await this.branchModel.findOneAndUpdate(
            {
                _id: branchId,
                pgId,
            },
            {
                $push: {
                    floors: {
                        _id: uuidv4(),
                        floorNumber: dto.floorNumber,
                        rooms: [],
                    },
                },
            },
            {
                new: true,
            },
        );

        if (!branch) {
            throw new NotFoundException('Branch not found or access denied');
        }

        return branch;
    }

    async addRoom(pgId: string, branchId: string, floorNumber: number, dto: AddRoomDto) {
        const capacityMap: Record<SharingType, number> = {
            [SharingType.SINGLE]: 1,
            [SharingType.DOUBLE]: 2,
            [SharingType.TRIPLE]: 3,
            [SharingType.FOUR]: 4,
          };

          const bedCount = capacityMap[dto.sharingType];

          const beds = Array.from(
            { length: bedCount },
            (_, i) => ({
              _id: uuidv4(),
              bedNumber: `B${i + 1}`,
              isOccupied: false,
              occupiedBy: null,
            }),
          );

        const branch = await this.branchModel.findOneAndUpdate(
            {
                _id: branchId,
                pgId: pgId,
                'floors.floorNumber': floorNumber,
            },
            {
                $push: {
                    'floors.$.rooms': {
                        roomNumber: dto.roomNumber,
                        sharingType: dto.sharingType,
                        rentPerBed: dto.rentPerBed,
                        beds,
                    },
                },
            },
            { new: true },
        );

        if (!branch) throw new NotFoundException('Branch or floor not found');
        return branch;
    }
}