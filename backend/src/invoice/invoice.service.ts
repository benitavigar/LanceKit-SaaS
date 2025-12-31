import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InvoiceService {
    constructor(private prisma: PrismaService) { }

    /**
     * Calculate total amount from invoice items
     */
    private calculateTotal(items: Array<{ quantity: number; unitPrice: number }>): Decimal {
        const total = items.reduce((sum, item) => {
            return sum + item.quantity * item.unitPrice;
        }, 0);
        return new Decimal(total);
    }

    async create(userId: string, createInvoiceDto: CreateInvoiceDto) {
        const { items, clientId, ...invoiceData } = createInvoiceDto;

        // Verify client belongs to user
        const client = await this.prisma.client.findFirst({
            where: { id: clientId, userId },
        });

        if (!client) {
            throw new ForbiddenException('Client not found or access denied');
        }

        // Calculate total amount
        const totalAmount = this.calculateTotal(items);

        // Create invoice with items
        return this.prisma.invoice.create({
            data: {
                ...invoiceData,
                clientId,
                userId,
                totalAmount,
                items: {
                    create: items,
                },
            },
            include: {
                items: true,
                client: true,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.invoice.findMany({
            where: { userId },
            include: {
                client: true,
                items: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(userId: string, id: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                client: true,
                items: true,
            },
        });

        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        // Ensure user owns this invoice
        if (invoice.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return invoice;
    }

    async update(userId: string, id: string, updateInvoiceDto: UpdateInvoiceDto) {
        // Check ownership
        await this.findOne(userId, id);

        const { items, clientId, ...invoiceData } = updateInvoiceDto;

        // If clientId is being updated, verify it belongs to user
        if (clientId) {
            const client = await this.prisma.client.findFirst({
                where: { id: clientId, userId },
            });

            if (!client) {
                throw new ForbiddenException('Client not found or access denied');
            }
        }

        // If items are being updated, recalculate total
        let totalAmount: Decimal | undefined;
        if (items && items.length > 0) {
            totalAmount = this.calculateTotal(items);

            // Delete existing items and create new ones
            await this.prisma.invoiceItem.deleteMany({
                where: { invoiceId: id },
            });
        }

        // Update invoice
        return this.prisma.invoice.update({
            where: { id },
            data: {
                ...invoiceData,
                ...(clientId && { clientId }),
                ...(totalAmount && { totalAmount }),
                ...(items && items.length > 0 && {
                    items: {
                        create: items,
                    },
                }),
            },
            include: {
                items: true,
                client: true,
            },
        });
    }

    async remove(userId: string, id: string) {
        // Check ownership
        await this.findOne(userId, id);

        return this.prisma.invoice.delete({
            where: { id },
        });
    }
}
