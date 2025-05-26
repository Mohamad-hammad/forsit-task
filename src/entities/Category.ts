import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Product } from "./Product"

@Entity("categories")
export class Category {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({ type: "varchar", nullable: false, unique: true })
    name!: string

    @Column({ type: "text", nullable: true })
    description!: string

    @CreateDateColumn({ type: "timestamp" })
    created_at!: Date

    @UpdateDateColumn({ type: "timestamp" })
    updated_at!: Date

    @OneToMany(() => Product, product => product.categoryRelation)
    products!: Product[]
} 