import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseNumericEntity {
  @ApiProperty({ description: 'The unique numeric identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'The date and time when the record was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'The date and time when the record was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
