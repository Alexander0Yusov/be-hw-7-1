import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exceptions';

// файл не актуален
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly requests = new Map<string, number[]>();
  private readonly WINDOW_MS = 10_000;
  private readonly MAX_REQUESTS = 5;
  private readonly MAX_KEYS = 10_000;

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const key = req.ip; // или req.user.id
    const now = Date.now();

    // Очистка устаревших ключей
    for (const [storedKey, timestamps] of this.requests.entries()) {
      const recent = timestamps.filter((ts) => now - ts < this.WINDOW_MS);
      if (recent.length === 0) {
        this.requests.delete(storedKey); // удаляем неактивные
      } else {
        this.requests.set(storedKey, recent); // обновляем только актуальные
      }
    }

    // Проверка лимита
    const timestamps = this.requests.get(key) || [];
    if (timestamps.length >= this.MAX_REQUESTS) {
      throw new DomainException({
        code: DomainExceptionCode.TooManyRequests,
        message: 'Rate limit exceeded',
        extensions: [
          new Extension(`IP: ${req.ip}`, 'ip'),
          new Extension(
            `Exceeded ${this.MAX_REQUESTS} requests in ${this.WINDOW_MS / 1000} seconds`,
            'rateLimit',
          ),
        ],
      });
    }

    // Добавляем текущий запрос
    timestamps.push(now);
    this.requests.set(key, timestamps);

    // Защита от переполнения
    if (this.requests.size > this.MAX_KEYS) {
      this.requests.clear(); // можно заменить на более мягкую стратегию
    }

    return true;
  }
}
