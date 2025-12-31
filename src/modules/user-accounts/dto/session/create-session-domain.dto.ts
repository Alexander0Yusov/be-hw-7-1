export class CreateSessionDomainDto {
  deviceId: string;
  userId: number; // Types.ObjectId;
  ip: string;
  deviceName: string;
  expiresAt: Date;
  lastActiveDate: Date;
  isRevoked: boolean;
}
