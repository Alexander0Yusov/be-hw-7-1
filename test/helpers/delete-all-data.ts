import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export const deleteAllData = async (app: INestApplication): Promise<any> => {
  return request(app.getHttpServer()).delete(`/api/testing/all-data`);
};
