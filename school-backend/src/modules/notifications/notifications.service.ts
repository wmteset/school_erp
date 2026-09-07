import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notifRepo: Repository<NotificationEntity>,
  ) {}

  async findAll(): Promise<NotificationEntity[]> {
    return this.notifRepo.find({ order: { createdAt: 'DESC' } });
  }

  async markAsRead(id: string): Promise<NotificationEntity> {
    const notif = await this.notifRepo.findOne({ where: { id } });
    if (notif) {
      notif.read = true;
      return this.notifRepo.save(notif);
    }
    return notif;
  }

  async markAllAsRead(): Promise<{ success: boolean }> {
    await this.notifRepo.update({}, { read: true });
    return { success: true };
  }

  async clearAll(): Promise<{ success: boolean }> {
    await this.notifRepo.clear();
    return { success: true };
  }
}
