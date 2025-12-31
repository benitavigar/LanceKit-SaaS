import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export enum InvoiceStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    PAID = 'PAID',
}

export class CreateInvoiceDto {
    @ApiProperty({ example: 'INV-2024-001' })
    @IsString()
    invoiceNo: string;

    @ApiProperty({ enum: InvoiceStatus, example: InvoiceStatus.DRAFT })
    @IsEnum(InvoiceStatus)
    status: InvoiceStatus;

    @ApiProperty({ example: '2024-12-31T00:00:00.000Z' })
    @IsDateString()
    dueDate: string;

    @ApiProperty({ example: 'client-uuid-here' })
    @IsString()
    clientId: string;

    @ApiProperty({
        type: [CreateInvoiceItemDto],
        example: [
            { description: 'Website Development', quantity: 40, unitPrice: 75.50 },
            { description: 'Logo Design', quantity: 5, unitPrice: 100.00 }
        ]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateInvoiceItemDto)
    items: CreateInvoiceItemDto[];
}
