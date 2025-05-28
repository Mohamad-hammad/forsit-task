import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";

export class ProductRepository {
  private repository = AppDataSource.getRepository(Product);

  async createProduct(
    product: Omit<
      Product,
      "id" | "created_at" | "inventory" | "categoryRelation"
    >
  ) {
    const newProduct = this.repository.create(product);
    return await this.repository.save(newProduct);
  }
}
