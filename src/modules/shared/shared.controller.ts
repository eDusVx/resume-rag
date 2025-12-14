import { Controller, Get } from '@nestjs/common';

@Controller()
export class SharedController {
  @Get('hc')
  Hc() {
    return {
      status: 'Healthy',
      uptime: process.hrtime(),
    };
  }

  @Get('liveness')
  Liveness() {
    return {
      status: 'Alive',
      uptime: process.uptime(),
    };
  }
}
