export interface IReadRepository<T> {
  getById(id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
}