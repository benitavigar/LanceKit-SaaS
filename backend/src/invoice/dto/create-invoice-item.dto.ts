import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
    @ApiProperty({ example: 'Website Development - Frontend' })
    @IsString()
    description: string;

    @ApiProperty({ example: 40 })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    quantity: number;

    @ApiProperty({ example: 75.50 })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    unitPrice: number;
}
