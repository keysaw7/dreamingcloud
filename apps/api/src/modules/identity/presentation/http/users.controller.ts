import { Controller, Get, Param } from '@nestjs/common';

import { Public } from '../../../../platform/security/authorization';
import { GetPublicProfileQuery } from '../../application/queries/get-public-profile.query';

@Controller('users')
export class UsersController {
  public constructor(private readonly getPublicProfile: GetPublicProfileQuery) {}

  @Public()
  @Get(':idOrUsername')
  public async getProfile(@Param('idOrUsername') idOrUsername: string) {
    return { data: await this.getPublicProfile.execute(idOrUsername) };
  }
}
