import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from "typeorm"
import { Product } from "./Product"

@Entity("inventory")
export class Inventory {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({ type: "uuid", unique: true })
    product_id!: string

    @Column({ type: "integer", nullable: false })
    current_stock!: number

    @Column({ type: "integer", default: 10 })
    minimum_threshold!: number

    @UpdateDateColumn({ type: "timestamp" })
    updated_at!: Date

    @OneToOne(() => Product)
    @JoinColumn({ name: "product_id" })
    product!: Product
} 