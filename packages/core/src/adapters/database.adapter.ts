/**
 * 数据库适配器接口
 * 统一云端和边缘的数据库操作
 */
export interface DatabaseAdapter {
  /**
   * 连接数据库
   */
  connect(): Promise<void>;

  /**
   * 断开连接
   */
  disconnect(): Promise<void>;

  /**
   * 执行查询
   */
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;

  /**
   * 执行单条查询
   */
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;

  /**
   * 执行更新/插入/删除
   */
  execute(sql: string, params?: any[]): Promise<{ affectedRows: number }>;

  /**
   * 事务处理
   */
  transaction<T>(callback: (adapter: DatabaseAdapter) => Promise<T>): Promise<T>;

  /**
   * 数据同步（仅边缘节点）
   */
  sync?(): Promise<void>;

  /**
   * 获取数据库类型
   */
  getType(): 'postgres' | 'sqlite';
}

/**
 * 数据库工厂
 * 根据配置自动创建对应的数据库适配器
 */
export class DatabaseFactory {
  /**
   * 创建数据库适配器
   */
  static create(config: any): DatabaseAdapter {
    const type = config.type || 'sqlite';
    
    if (type === 'postgres') {
      // 动态导入 PostgreSQL 适配器
      const { PostgresAdapter } = require('./postgres.adapter');
      return new PostgresAdapter(config);
    } else {
      // 动态导入 SQLite 适配器
      const { SqliteAdapter } = require('./sqlite.adapter');
      return new SqliteAdapter(config);
    }
  }
}
