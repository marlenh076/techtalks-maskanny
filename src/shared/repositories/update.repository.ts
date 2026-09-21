export interface IUpdateRepository<T> {
  update(id: string, data: Partial<T>): Promise<T>;
}
