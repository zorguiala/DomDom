/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Entity, Column, BeforeInsert } from 'typeorm';
import { BaseEntity } from './base.entity';
import { hash } from 'bcrypt';
import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ nullable: true })
  lastLoginDate: Date;

  @Column({ nullable: true })
  passwordExpirationDate: Date;

  @Column({ nullable: true })
  lastPasswordChangeDate: Date;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @BeforeInsert()
  async hashPassword() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.password = await hash(this.password, 10);
  }
}
