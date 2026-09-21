export interface ICreateRepository<T, C = T> {
  create(data: C): Promise<T>;
}