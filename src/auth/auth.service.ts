import { Injectable, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User, UserDocument, Role } from './schemas/user.schema';
import { PgGroup, PgGroupDocument } from './schemas/pg-group.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(PgGroup.name) private pgModel: Model<PgGroupDocument>,
        private jwtService: JwtService,
    ) { }


    async CreatePg(dto: { name: string; contactNumber?: string }) {
        const storePg = await this.pgModel.create(dto);
        return storePg;
    }

    async registerPgAdmin(dto: RegisterDto) {

        const IfPgExisting = await this.pgModel.findById(dto.pgId)

        if (!IfPgExisting) {
            throw new ConflictException('Email already in use');
        }

        const existing = await this.userModel.findOne({ email: dto.email });
        if (existing) throw new ConflictException('Email already in use');

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.userModel.create({
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
            role: dto.role == 'admin' ? Role.PG_ADMIN : dto.role == 'branch manager' ? Role.BRANCH_MANAGER : dto.role == 'super admin' ? Role.SUPER_ADMIN : Role.TENENT,
            pgId: IfPgExisting._id,
        });

        const tokens = await this.generateTokens(user._id.toString(), user.email, user.role, IfPgExisting._id.toString());
        await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

        return {
            user: { id: user._id, email: user.email, name: user.name, role: user.role },
            pg: { id: IfPgExisting._id, name: IfPgExisting.name },
            tokens,
        };
    }

    async login(dto: LoginDto) {
        const user = await this.userModel.findOne({ email: dto.email });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        const tokens = await this.generateTokens(
            user._id.toString(),
            user.email,
            user.role,
            user.pgId ? user.pgId.toString() : null,
        );
        await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

        return { tokens, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
    }

    async refreshTokens(userId: string, incomingRefreshToken: string) {
        const user = await this.userModel.findById(userId);
        if (!user || !user.refreshToken) throw new ForbiddenException('Access Denied');

        const matches = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
        if (!matches) throw new ForbiddenException('Access Denied');

        const tokens = await this.generateTokens(
            user._id.toString(),
            user.email,
            user.role,
            user.pgId ? user.pgId.toString() : null,
        );
        await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

        return tokens;
    }

    async logout(userId: string) {
        await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
        return { success: true, message: 'Logged out successfully' };
    }

    private async generateTokens(userId: string, email: string, role: string, pgId: string | null) {
        const payload = { sub: userId, email, role, pgId };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_123!',
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_456!',
                expiresIn: '7d',
            }),
        ]);

        return { accessToken, refreshToken };
    }

    private async updateRefreshToken(userId: string, refreshToken: string) {
        const hash = await bcrypt.hash(refreshToken, 10);
        await this.userModel.findByIdAndUpdate(userId, { refreshToken: hash });
    }
}