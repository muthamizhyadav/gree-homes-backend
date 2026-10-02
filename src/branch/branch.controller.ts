import { Controller, Post, Get, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BranchService } from './branch.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateBranchDto, AddFloorDto, AddRoomDto } from './dto/branch.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  createBranch(@CurrentUser('pgId') pgId: string, @Body() dto: CreateBranchDto) {
    return this.branchService.createBranch(pgId, dto);
  }

  @Get()
  getBranches(@CurrentUser('pgId') pgId: string) {
    return this.branchService.getBranchesByPg(pgId);
  }

  @Post(':branchId/floors')
  addFloor(
    @CurrentUser('pgId') pgId: string,
    @Param('branchId') branchId: string,
    @Body() dto: AddFloorDto,
  ) {
    return this.branchService.addFloor(pgId, branchId, dto);
  }

  @Post(':branchId/floors/:floorNumber/rooms')
  addRoom(
    @CurrentUser('pgId') pgId: string,
    @Param('branchId') branchId: string,
    @Param('floorNumber') floorNumber: number,
    @Body() dto: AddRoomDto,
  ) {
    return this.branchService.addRoom(pgId, branchId, floorNumber, dto);
  }
}