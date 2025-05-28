import { AppDataSource } from "../data-source";
import { Category } from "../entities/Category";

export class CategoryRepository {
  private repository = AppDataSource.getRepository(Category);

  async createCategory(
    category: Omit<Category, "id" | "created_at" | "updated_at" | "products">
  ) {
    const newCategory = this.repository.create(category);
    return await this.repository.save(newCategory);
  }
}
