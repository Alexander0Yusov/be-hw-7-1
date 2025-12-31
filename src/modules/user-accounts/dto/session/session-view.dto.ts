import { Session } from '../../domain/session/session.entity';

export class SessionViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static fromEntity(session: Session): SessionViewDto {
    const dto = new SessionViewDto();
    dto.ip = session.ip;
    dto.title = session.deviceName; // мапим deviceName → title
    dto.lastActiveDate = session.lastActiveDate.toISOString();
    dto.deviceId = session.deviceId;
    return dto;
  }
}
