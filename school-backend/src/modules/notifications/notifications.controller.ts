import { Controller, Get, Patch, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Real-time Alerts & Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all system alerts, leave requests, and payroll notifications' })
  async findAll() {
    return this.notifService.findAll();
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark specific notification as read' })
  async markAsRead(@Param('id') id: string) {
    return this.notifService.markAsRead(id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead() {
    return this.notifService.markAllAsRead();
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear all notifications' })
  async clearAll() {
    return this.notifService.clearAll();
  }
}
