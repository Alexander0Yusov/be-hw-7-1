import {
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseDomainEntity {
  // extends BaseEntity на случай неиспользования трехслойн архитектуры,
  // и сущности станут моделями
  @PrimaryGeneratedColumn()
  public id: number;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    nullable: true,
    default: null,
  })
  public updatedAt: Date | null;

  @DeleteDateColumn({ type: 'timestamptz' })
  public deletedAt: Date | null;
}
