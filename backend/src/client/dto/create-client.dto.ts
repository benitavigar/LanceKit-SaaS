import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateClientDto {
    @ApiProperty({ example: 'Jane Smith' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'jane.smith@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Acme Corporation', required: false })
    @IsString()
    @IsOptional()
    company?: string;
}
