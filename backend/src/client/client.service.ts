import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, createClientDto: CreateClientDto) {
        return this.prisma.client.create({
            data: {
                ...createClientDto,
                userId,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.client.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(userId: string, id: string) {
        const client = await this.prisma.client.findUnique({
            where: { id },
            include: {
                invoices: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        // Ensure user owns this client
        if (client.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return client;
    }

    async update(userId: string, id: string, updateClientDto: UpdateClientDto) {
        // Check ownership
        await this.findOne(userId, id);

        return this.prisma.client.update({
            where: { id },
            data: updateClientDto,
        });
    }

    async remove(userId: string, id: string) {
        // Check ownership
        await this.findOne(userId, id);

        return this.prisma.client.delete({
            where: { id },
        });
    }
}
