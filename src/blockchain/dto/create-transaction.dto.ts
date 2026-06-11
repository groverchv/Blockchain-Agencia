import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Hex-encoded public key of the sender.',
    example: '04c3d82a32c256...',
  })
  @IsNotEmpty()
  @IsString()
  sender: string;

  @ApiProperty({
    description: 'Hex-encoded public key of the recipient (e.g. employee or service wallet).',
    example: '04e768b12e34fa...',
  })
  @IsNotEmpty()
  @IsString()
  recipient: string;

  @ApiProperty({
    description: 'Arbitrary transaction payload or details (contract, skill verifications, etc.).',
    example: { jobId: '123', salary: '5000 USD', status: 'Hired' },
  })
  @IsNotEmpty()
  data: any;

  @ApiProperty({
    description: 'Cryptographic signature of the transaction hash by the sender.',
    example: '3044022030d998...',
  })
  @IsNotEmpty()
  @IsString()
  signature: string;
}
