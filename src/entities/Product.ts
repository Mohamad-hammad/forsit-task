import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm"
import { Inventory } from "./Inventory"
import { Category } from "./Category"

@Entity("products")
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({ type: "varchar", nullable: false })
    name!: string

    @Column({ type: "varchar", nullable: false, unique: true })
    sku!: string

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    price!: number

    @Column({ type: "varchar", nullable: true })
    category!: string

    @CreateDateColumn({ type: "timestamp" })
    created_at!: Date

    @OneToOne(() => Inventory, inventory => inventory.product)
    inventory!: Inventory

    @ManyToOne(() => Category)
    @JoinColumn({ name: "category" })
    categoryRelation!: Category
} 