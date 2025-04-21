import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ActiveToken } from './active_token.entity';
import { PasswordToken } from './password_token.entity';
import { Customer } from './customer.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'inactive',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'user'],
    default: 'user',
  })
  user_type: string;

  @Column({
    type: 'timestamp',
  })
  verify_at: Date;

  // START RELATIONSHIP`
  @OneToMany(() => ActiveToken, (activeToken) => activeToken.user)
  activeTokens: ActiveToken[];

  @OneToMany(() => PasswordToken, (passwordToken) => passwordToken.user)
  passwordTokens: PasswordToken[];

  @OneToOne(() => Customer, (customer) => customer.user)
  customer: Customer;
  // END RELATIONSHIP

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
