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
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new invoice with line items' })
    @ApiResponse({ status: 201, description: 'Invoice successfully created with auto-calculated total' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Client not found or access denied' })
    create(@CurrentUser() user: any, @Body() createInvoiceDto: CreateInvoiceDto) {
        return this.invoiceService.create(user.id, createInvoiceDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all invoices for current user' })
    @ApiResponse({ status: 200, description: 'List of invoices with items and client info' })
    findAll(@CurrentUser() user: any) {
        return this.invoiceService.findAll(user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific invoice' })
    @ApiResponse({ status: 200, description: 'Invoice details with items and client info' })
    @ApiResponse({ status: 404, description: 'Invoice not found' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    findOne(@CurrentUser() user: any, @Param('id') id: string) {
        return this.invoiceService.findOne(user.id, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an invoice' })
    @ApiResponse({ status: 200, description: 'Invoice successfully updated with recalculated total' })
    @ApiResponse({ status: 404, description: 'Invoice not found' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() updateInvoiceDto: UpdateInvoiceDto,
    ) {
        return this.invoiceService.update(user.id, id, updateInvoiceDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an invoice' })
    @ApiResponse({ status: 200, description: 'Invoice successfully deleted' })
    @ApiResponse({ status: 404, description: 'Invoice not found' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    remove(@CurrentUser() user: any, @Param('id') id: string) {
        return this.invoiceService.remove(user.id, id);
    }
}
