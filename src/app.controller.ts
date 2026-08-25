import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('hello')
  getHello() {
    return {
      message: 'Hello from NestJS backend!',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }
}
