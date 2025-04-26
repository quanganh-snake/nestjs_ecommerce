import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]), // Import the Customer entity
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService], // Export the CustomersService if needed in other modules
})
export class CustomersModule {}
