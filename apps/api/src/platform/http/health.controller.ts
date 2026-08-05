import { Controller, Get } from '@nestjs/common';

import { Public } from '../security/authorization';

@Public()
@Controller('health')
export class HealthController {
  @Get()
  public getHealth(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
