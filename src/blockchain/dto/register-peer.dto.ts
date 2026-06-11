import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class RegisterPeerDto {
  @ApiProperty({
    description: 'The HTTP URL of the peer blockchain node.',
    example: 'http://blockchain-node-2:3000',
  })
  @IsNotEmpty()
  @IsUrl({ require_tld: false }) // Allows localhost/docker-compose service names
  url: string;
}
