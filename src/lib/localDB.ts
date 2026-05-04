export type UserRole = 'admin' | 'farmer' | 'buyer';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  name: string;
  description?: string;
  category: string;
  price_per_unit: number;
  unit: string;
  quantity_available: number;
  image_url?: string;
  location?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  delivery_address: string;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  created_at: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function simpleHash(str: string): string {
  return btoa(encodeURIComponent(str));
}

function verifyHash(str: string, hash: string): boolean {
  return simpleHash(str) === hash;
}

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  created_at: string;
}

const STORAGE_KEYS = {
  USERS: 'agro_users',
  SESSION: 'agro_session',
  PROFILES: 'agro_profiles',
  PRODUCTS: 'agro_products',
  ORDERS: 'agro_orders',
  ORDER_ITEMS: 'agro_order_items',
  PRICE_HISTORY: 'agro_price_history',
  INITIALIZED: 'agro_initialized',
};

const ADMIN_ID = 'admin-kruthi-fixed-id-001';

function getTable<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setTable<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function initializeDB(): void {
  if (localStorage.getItem(STORAGE_KEYS.INITIALIZED)) return;

  const now = new Date().toISOString();

  const adminUser: StoredUser = {
    id: ADMIN_ID,
    email: 'kruthi@gmail.com',
    passwordHash: simpleHash('Kruthi@123'),
    created_at: now,
  };

  const farmer1Id = 'demo-farmer-001';
  const farmer2Id = 'demo-farmer-002';
  const buyer1Id = 'demo-buyer-001';

  const demoUsers: StoredUser[] = [
    adminUser,
    {
      id: farmer1Id,
      email: 'raju@farmer.com',
      passwordHash: simpleHash('Farmer@123'),
      created_at: now,
    },
    {
      id: farmer2Id,
      email: 'meena@farmer.com',
      passwordHash: simpleHash('Farmer@123'),
      created_at: now,
    },
    {
      id: buyer1Id,
      email: 'priya@buyer.com',
      passwordHash: simpleHash('Buyer@123'),
      created_at: now,
    },
  ];

  const demoProfiles: Profile[] = [
    {
      id: ADMIN_ID,
      email: 'kruthi@gmail.com',
      full_name: 'Kruthi Admin',
      role: 'admin',
      phone: '9876543210',
      city: 'Bengaluru',
      state: 'Karnataka',
      created_at: now,
      updated_at: now,
    },
    {
      id: farmer1Id,
      email: 'raju@farmer.com',
      full_name: 'Raju Kumar',
      role: 'farmer',
      phone: '9876543211',
      city: 'Mysuru',
      state: 'Karnataka',
      address: 'Village Road, Mysuru',
      pincode: '570001',
      created_at: now,
      updated_at: now,
    },
    {
      id: farmer2Id,
      email: 'meena@farmer.com',
      full_name: 'Meena Devi',
      role: 'farmer',
      phone: '9876543212',
      city: 'Hassan',
      state: 'Karnataka',
      address: 'Farm Lane, Hassan',
      pincode: '573201',
      created_at: now,
      updated_at: now,
    },
    {
      id: buyer1Id,
      email: 'priya@buyer.com',
      full_name: 'Priya Sharma',
      role: 'buyer',
      phone: '9876543213',
      city: 'Bengaluru',
      state: 'Karnataka',
      address: '12 Main Street, Indiranagar, Bengaluru',
      pincode: '560038',
      created_at: now,
      updated_at: now,
    },
  ];

  const p1Id = generateId();
  const p2Id = generateId();
  const p3Id = generateId();
  const p4Id = generateId();
  const p5Id = generateId();

  const demoProducts: Product[] = [
    {
      id: p1Id,
      seller_id: farmer1Id,
      name: 'Fresh Tomatoes',
      description: 'Organically grown, rich in flavor. Harvested fresh from our fields.',
      category: 'Vegetables',
      price_per_unit: 28,
      unit: 'kg',
      quantity_available: 200,
      location: 'Mysuru',
      is_available: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: p2Id,
      seller_id: farmer1Id,
      name: 'Basmati Rice',
      description: 'Premium long-grain basmati rice. Aromatic and nutritious.',
      category: 'Grains',
      price_per_unit: 65,
      unit: 'kg',
      quantity_available: 500,
      location: 'Mysuru',
      is_available: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: p3Id,
      seller_id: farmer2Id,
      name: 'Alphonso Mangoes',
      description: 'Premium Alphonso mangoes, sweet and juicy. Seasonal special.',
      category: 'Fruits',
      price_per_unit: 120,
      unit: 'kg',
      quantity_available: 150,
      location: 'Hassan',
      is_available: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: p4Id,
      seller_id: farmer2Id,
      name: 'Toor Dal',
      description: 'High protein toor dal. Freshly harvested and cleaned.',
      category: 'Pulses',
      price_per_unit: 90,
      unit: 'kg',
      quantity_available: 300,
      location: 'Hassan',
      is_available: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: p5Id,
      seller_id: farmer1Id,
      name: 'Fresh Spinach',
      description: 'Tender, fresh spinach leaves. Rich in iron and vitamins.',
      category: 'Vegetables',
      price_per_unit: 20,
      unit: 'kg',
      quantity_available: 100,
      location: 'Mysuru',
      is_available: true,
      created_at: now,
      updated_at: now,
    },
  ];

  setTable(STORAGE_KEYS.USERS, demoUsers);
  setTable(STORAGE_KEYS.PROFILES, demoProfiles);
  setTable(STORAGE_KEYS.PRODUCTS, demoProducts);
  setTable(STORAGE_KEYS.ORDERS, []);
  setTable(STORAGE_KEYS.ORDER_ITEMS, []);
  setTable(STORAGE_KEYS.PRICE_HISTORY, []);
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

export const localAuth = {
  getSession(): { user: StoredUser | null } {
    try {
      const sessionStr = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!sessionStr) return { user: null };
      const session = JSON.parse(sessionStr);
      const users = getTable<StoredUser>(STORAGE_KEYS.USERS);
      const user = users.find((u) => u.id === session.userId) || null;
      return { user };
    } catch {
      return { user: null };
    }
  },

  signIn(email: string, password: string): StoredUser {
    const users = getTable<StoredUser>(STORAGE_KEYS.USERS);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('Invalid login credentials');
    if (!verifyHash(password, user.passwordHash)) throw new Error('Invalid login credentials');
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ userId: user.id }));
    return user;
  },

  signUp(email: string, password: string): StoredUser {
    const users = getTable<StoredUser>(STORAGE_KEYS.USERS);
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User already registered');
    }
    const newUser: StoredUser = {
      id: generateId(),
      email,
      passwordHash: simpleHash(password),
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    setTable(STORAGE_KEYS.USERS, users);
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ userId: newUser.id }));
    return newUser;
  },

  signOut(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },
};

function applyFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: Array<{ col: string; op: string; val: unknown }>
): T[] {
  return data.filter((row) =>
    filters.every((f) => {
      const val = row[f.col];
      if (f.op === 'eq') return val == f.val;
      if (f.op === 'neq') return val != f.val;
      if (f.op === 'gt') return Number(val) > Number(f.val);
      if (f.op === 'gte') return Number(val) >= Number(f.val);
      if (f.op === 'lt') return Number(val) < Number(f.val);
      return true;
    })
  );
}

function applyOrder<T extends Record<string, unknown>>(
  data: T[],
  order: { col: string; ascending: boolean } | null
): T[] {
  if (!order) return data;
  return [...data].sort((a, b) => {
    const av = a[order.col];
    const bv = b[order.col];
    if (av === undefined && bv === undefined) return 0;
    if (av === undefined) return 1;
    if (bv === undefined) return -1;
    if (String(av) < String(bv)) return order.ascending ? -1 : 1;
    if (String(av) > String(bv)) return order.ascending ? 1 : -1;
    return 0;
  });
}

function resolveJoins(
  table: string,
  row: Record<string, unknown>,
  selectStr: string
): Record<string, unknown> {
  const result = { ...row };
  const profiles = getTable<Profile>(STORAGE_KEYS.PROFILES);
  const products = getTable<Product>(STORAGE_KEYS.PRODUCTS);
  const orderItems = getTable<OrderItem & { product_id: string; order_id: string }>(
    STORAGE_KEYS.ORDER_ITEMS
  );

  if (table === 'products' && selectStr.includes('seller:profiles')) {
    const seller = profiles.find((p) => p.id === row['seller_id']);
    result['seller'] = seller
      ? { full_name: seller.full_name, city: seller.city, email: seller.email }
      : null;
  }

  if (table === 'orders') {
    if (selectStr.includes('buyer:profiles')) {
      const buyer = profiles.find((p) => p.id === row['buyer_id']);
      result['buyer'] = buyer
        ? { full_name: buyer.full_name, email: buyer.email, phone: buyer.phone }
        : null;
    }
    if (selectStr.includes('seller:profiles')) {
      const seller = profiles.find((p) => p.id === row['seller_id']);
      result['seller'] = seller
        ? {
            full_name: seller.full_name,
            email: seller.email,
            phone: seller.phone,
            city: seller.city,
          }
        : null;
    }
    if (selectStr.includes('order_items')) {
      const items = orderItems
        .filter((oi) => oi.order_id === row['id'])
        .map((oi) => {
          const product = products.find((p) => p.id === oi.product_id);
          return {
            ...oi,
            products: product
              ? { name: product.name, unit: product.unit }
              : { name: 'Unknown', unit: '' },
          };
        });
      result['items'] = items;
    }
  }

  return result;
}

type DbResult<T> = { data: T | null; error: unknown; count?: number };

export class QueryBuilder<T = Record<string, unknown>> {
  private _table: string;
  private _filters: Array<{ col: string; op: string; val: unknown }> = [];
  private _select: string = '*';
  private _countMode: boolean = false;
  private _order: { col: string; ascending: boolean } | null = null;
  private _limit: number | null = null;
  private _op: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private _insertData: Record<string, unknown>[] = [];
  private _updateData: Record<string, unknown> | null = null;

  constructor(table: string) {
    this._table = table;
  }

  select(cols: string = '*', opts?: { count?: string }): this {
    this._select = cols;
    if (opts?.count === 'exact') this._countMode = true;
    return this;
  }

  eq(col: string, val: unknown): this {
    this._filters.push({ col, op: 'eq', val });
    return this;
  }

  neq(col: string, val: unknown): this {
    this._filters.push({ col, op: 'neq', val });
    return this;
  }

  gt(col: string, val: unknown): this {
    this._filters.push({ col, op: 'gt', val });
    return this;
  }

  gte(col: string, val: unknown): this {
    this._filters.push({ col, op: 'gte', val });
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }): this {
    this._order = { col, ascending: opts?.ascending ?? true };
    return this;
  }

  limit(n: number): this {
    this._limit = n;
    return this;
  }

  insert(data: Record<string, unknown>[]): this {
    this._op = 'insert';
    this._insertData = data;
    return this;
  }

  update(data: Record<string, unknown>): this {
    this._op = 'update';
    this._updateData = data;
    return this;
  }

  delete(): this {
    this._op = 'delete';
    return this;
  }

  async maybeSingle(): Promise<DbResult<T>> {
    const result = await this._execute();
    if (result.error) return { data: null, error: result.error };
    const arr = Array.isArray(result.data) ? result.data : [];
    return { data: (arr[0] ?? null) as T | null, error: null };
  }

  async single(): Promise<DbResult<T>> {
    const result = await this._execute();
    if (result.error) return { data: null, error: result.error };
    const arr = Array.isArray(result.data) ? result.data : [result.data];
    return { data: (arr[0] ?? null) as T | null, error: null };
  }

  then(
    resolve: (val: DbResult<T[]>) => unknown,
    reject: (err: unknown) => unknown
  ): Promise<unknown> {
    return this._execute().then(resolve as (val: DbResult<unknown>) => unknown, reject);
  }

  private _getStorageKey(): string {
    const map: Record<string, string> = {
      profiles: STORAGE_KEYS.PROFILES,
      products: STORAGE_KEYS.PRODUCTS,
      orders: STORAGE_KEYS.ORDERS,
      order_items: STORAGE_KEYS.ORDER_ITEMS,
      price_history: STORAGE_KEYS.PRICE_HISTORY,
    };
    return map[this._table] || `agro_${this._table}`;
  }

  private async _execute(): Promise<DbResult<unknown>> {
    try {
      const key = this._getStorageKey();

      if (this._op === 'select') {
        let data = getTable<Record<string, unknown>>(key);
        data = applyFilters(data, this._filters);
        data = applyOrder(data, this._order);
        if (this._limit !== null) data = data.slice(0, this._limit);
        const count = data.length;
        const processed = data.map((row) =>
          resolveJoins(this._table, row, this._select)
        );
        return {
          data: processed,
          error: null,
          count: this._countMode ? count : undefined,
        };
      }

      if (this._op === 'insert') {
        const table = getTable<Record<string, unknown>>(key);
        const now = new Date().toISOString();
        const inserted = this._insertData.map((row) => ({
          id: generateId(),
          created_at: now,
          updated_at: now,
          is_available: true,
          ...row,
        }));
        inserted.forEach((row) => table.push(row));
        setTable(key, table);
        return { data: inserted, error: null };
      }

      if (this._op === 'update') {
        const table = getTable<Record<string, unknown>>(key);
        const now = new Date().toISOString();
        const updated: Record<string, unknown>[] = [];
        const newTable = table.map((row) => {
          const matches = applyFilters([row], this._filters).length > 0;
          if (matches) {
            const newRow = { ...row, ...this._updateData, updated_at: now };
            updated.push(newRow);
            return newRow;
          }
          return row;
        });
        setTable(key, newTable);
        return { data: updated, error: null };
      }

      if (this._op === 'delete') {
        const table = getTable<Record<string, unknown>>(key);
        const newTable = table.filter(
          (row) => applyFilters([row], this._filters).length === 0
        );
        setTable(key, newTable);
        return { data: null, error: null };
      }

      return { data: null, error: 'Unknown operation' };
    } catch (e) {
      console.error(`LocalDB error on ${this._table}:`, e);
      return { data: null, error: e };
    }
  }
}

initializeDB();
