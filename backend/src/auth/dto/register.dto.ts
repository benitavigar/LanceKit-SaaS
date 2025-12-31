import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'SecurePassword123!' })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({ example: 'John Doe', required: false })
    @IsString()
    @IsOptional()
    name?: string;
}
