import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ClientController {
    constructor(private readonly clientService: ClientService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new client' })
    @ApiResponse({ status: 201, description: 'Client successfully created' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@CurrentUser() user: any, @Body() createClientDto: CreateClientDto) {
        return this.clientService.create(user.id, createClientDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all clients for current user' })
    @ApiResponse({ status: 200, description: 'List of clients' })
    findAll(@CurrentUser() user: any) {
        return this.clientService.findAll(user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific client' })
    @ApiResponse({ status: 200, description: 'Client details' })
    @ApiResponse({ status: 404, description: 'Client not found' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    findOne(@CurrentUser() user: any, @Param('id') id: string) {
        return this.clientService.findOne(user.id, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a client' })
    @ApiResponse({ status: 200, description: 'Client successfully updated' })
    @ApiResponse({ status: 404, description: 'Client not found' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() updateClientDto: UpdateClientDto,
    ) {
        return this.clientService.update(user.id, id, updateClientDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a client' })
    @ApiResponse({ status: 200, description: 'Client successfully deleted' })
    @ApiResponse({ status: 404, description: 'Client not found' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    remove(@CurrentUser() user: any, @Param('id') id: string) {
        return this.clientService.remove(user.id, id);
    }
}
