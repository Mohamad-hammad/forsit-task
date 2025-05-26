import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm"
import { Product } from "./Product"

@Entity("sales")
export class Sale {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({ type: "uuid" })
    product_id!: string

    @Column({ type: "integer", nullable: false })
    quantity!: number

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    unit_price!: number

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    total_amount!: number

    @Column({ type: "date", nullable: false })
    sale_date!: Date

    @CreateDateColumn({ type: "timestamp" })
    created_at!: Date

    @ManyToOne(() => Product)
    @JoinColumn({ name: "product_id" })
    product!: Product
} 