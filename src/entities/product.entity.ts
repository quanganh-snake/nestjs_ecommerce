import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Brand } from './brand.entity';
import { Category } from './category.entity';

@Entity('products')
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Brand, (brand) => brand.products)
  @JoinColumn({
    name: 'brand_id',
  })
  brand: Brand;

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable({
    name: 'products_categories',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];

  @Column({ name: 'brand_id' })
  brand_id: number;

  @Column()
  sku: string;
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  thumbnail: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @Column()
  sale_price: number;

  @Column()
  content: string;

  @Column()
  rating_ammount: number;

  @Column({
    type: 'enum',
    enum: ['simple', 'variant'],
    default: 'simple',
  })
  type: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

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
