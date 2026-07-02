import { createClient } from '@supabase/supabase-js';
import { INITIAL_USERS, INITIAL_PROFILES, INITIAL_STORES, INITIAL_EQUIPMENTS } from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we should use real Supabase or LocalStorage Mock
const isSupabaseConfigured =
  supabaseUrl &&
  supabaseUrl !== '' &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey &&
  supabaseAnonKey !== '' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

let supabaseClientInstance = null;

if (isSupabaseConfigured) {
  supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // --- LOCAL STORAGE MOCK CLIENT IMPLEMENTATION ---
  console.log('Running in Demo Mode: Using LocalStorage Database');

  // Initialize LocalStorage Data if not present
  const initializeLocalStorage = () => {
    if (!localStorage.getItem('sm_users')) {
      localStorage.setItem('sm_users', JSON.stringify(INITIAL_USERS));
    }

    if (!localStorage.getItem('sm_profiles')) {
      localStorage.setItem('sm_profiles', JSON.stringify(INITIAL_PROFILES));
    }

    // Stores
    if (!localStorage.getItem('sm_stores')) {
      localStorage.setItem('sm_stores', JSON.stringify(INITIAL_STORES));
    }

    // Equipment
    if (!localStorage.getItem('sm_equipment')) {
      localStorage.setItem('sm_equipment', JSON.stringify(
        INITIAL_EQUIPMENTS.map((eq) => ({
          ...eq,
          created_at: new Date().toISOString()
        }))
      ));
    }

    // Bookings
    if (!localStorage.getItem('sm_bookings')) {
      localStorage.setItem('sm_bookings', JSON.stringify([]));
    }

    // Reviews
    if (!localStorage.getItem('sm_reviews')) {
      localStorage.setItem('sm_reviews', JSON.stringify([
        {
          id: 'rev-1',
          booking_id: 'b-mock-1',
          user_id: 'user-uuid-3333',
          equipment_id: 'eq-1',
          rating: 5,
          comment: 'Tenda sangat bersih, tidak bocor sama sekali pas badai di Gede!',
          created_at: new Date().toISOString()
        },
        {
          id: 'rev-2',
          booking_id: 'b-mock-2',
          user_id: 'user-uuid-3333',
          equipment_id: 'eq-2',
          rating: 4,
          comment: 'Carrier oke banget, busa tebal dan empuk di pundak.',
          created_at: new Date().toISOString()
        }
      ]));
    }

    // Session
    if (!localStorage.getItem('sm_session')) {
      localStorage.setItem('sm_session', JSON.stringify(null));
    }
  };

  initializeLocalStorage();

  // Helper functions
  const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
  const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  class LocalQueryBuilder {
    constructor(tableName) {
      this.tableName = `sm_${tableName}`;
      this.filters = [];
      this.orderField = null;
      this.orderAsc = true;
      this.isSingle = false;
      this.isMaybeSingle = false;
      this.operation = 'select'; // 'select' | 'insert' | 'update' | 'delete'
      this.payload = null;
    }

    select() {
      return this;
    }

    eq(field, value) {
      this.filters.push({ type: 'eq', field, value });
      return this;
    }

    match(obj) {
      Object.keys(obj).forEach((key) => {
        this.filters.push({ type: 'eq', field: key, value: obj[key] });
      });
      return this;
    }

    order(field, { ascending = true } = {}) {
      this.orderField = field;
      this.orderAsc = ascending;
      return this;
    }

    single() {
      this.isSingle = true;
      return this;
    }

    maybeSingle() {
      this.isMaybeSingle = true;
      return this;
    }

    insert(records) {
      this.operation = 'insert';
      this.payload = records;
      return this;
    }

    update(updateFields) {
      this.operation = 'update';
      this.payload = updateFields;
      return this;
    }

    delete() {
      this.operation = 'delete';
      return this;
    }

    async then(resolve, reject) {
      try {
        let data = getData(this.tableName);
        let resultData = null;

        if (this.operation === 'select') {
          let filtered = [...data];
          for (const filter of this.filters) {
            if (filter.type === 'eq') {
              filtered = filtered.filter((item) => String(item[filter.field]) === String(filter.value));
            }
          }
          resultData = filtered;
        } 
        
        else if (this.operation === 'insert') {
          const toInsert = Array.isArray(this.payload) ? this.payload : [this.payload];
          const newRecords = toInsert.map((rec) => ({
            id: rec.id || `uuid-${Math.random().toString(36).substring(2, 9)}`,
            created_at: new Date().toISOString(),
            ...rec
          }));

          setData(this.tableName, [...data, ...newRecords]);
          resultData = Array.isArray(this.payload) ? newRecords : newRecords[0];
        } 
        
        else if (this.operation === 'update') {
          let updatedRecords = [];
          const updatedDb = data.map((item) => {
            let match = true;
            for (const filter of this.filters) {
              if (filter.type === 'eq' && String(item[filter.field]) !== String(filter.value)) {
                match = false;
              }
            }

            if (match) {
              const updated = { ...item, ...this.payload };
              updatedRecords.push(updated);
              return updated;
            }
            return item;
          });

          setData(this.tableName, updatedDb);
          resultData = this.isSingle ? updatedRecords[0] : updatedRecords;
        } 
        
        else if (this.operation === 'delete') {
          let deletedRecords = [];
          const remainingData = data.filter((item) => {
            let match = true;
            for (const filter of this.filters) {
              if (filter.type === 'eq' && String(item[filter.field]) !== String(filter.value)) {
                match = false;
              }
            }
            if (match) {
              deletedRecords.push(item);
            }
            return !match;
          });

          setData(this.tableName, remainingData);
          resultData = deletedRecords;
        }

        // Apply post-processing if resultData is an array
        if (resultData && Array.isArray(resultData)) {
          if (this.orderField) {
            resultData.sort((a, b) => {
              const valA = a[this.orderField];
              const valB = b[this.orderField];
              if (valA < valB) return this.orderAsc ? -1 : 1;
              if (valA > valB) return this.orderAsc ? 1 : -1;
              return 0;
            });
          }

          if (this.isSingle) {
            if (resultData.length === 0) {
              return resolve({ data: null, error: { message: 'Row not found' } });
            }
            return resolve({ data: resultData[0], error: null });
          }

          if (this.isMaybeSingle) {
            return resolve({ data: resultData.length > 0 ? resultData[0] : null, error: null });
          }
        }

        return resolve({ data: resultData, error: null });
      } catch (err) {
        return resolve({ data: null, error: err });
      }
    }
  }

  // Session listeners registry
  const authListeners = [];

  supabaseClientInstance = {
    auth: {
      async signUp({ email, password, options }) {
        try {
          const users = getData('sm_users');
          if (users.find((u) => u.email === email)) {
            return { data: null, error: { message: 'Email sudah terdaftar!' } };
          }

          const newId = `user-uuid-${Math.random().toString(36).substring(2, 9)}`;
          const newUser = {
            id: newId,
            email,
            password,
            raw_user_meta_data: options?.data || {}
          };
          users.push(newUser);
          setData('sm_users', users);

          // Trigger for profile
          const profiles = getData('sm_profiles');
          const newProfile = {
            id: newId,
            full_name: options?.data?.full_name || 'User Baru',
            email,
            phone: options?.data?.phone || '',
            is_vendor: false,
            is_verified: false,
            role: 'user',
            created_at: new Date().toISOString()
          };
          profiles.push(newProfile);
          setData('sm_profiles', profiles);

          const session = {
            access_token: `token-${newId}`,
            user: {
              id: newId,
              email,
              user_metadata: options?.data || {}
            }
          };
          setData('sm_session', session);

          // Notify listeners
          authListeners.forEach((listener) => listener('SIGNED_IN', session));

          return { data: { user: session.user, session }, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },

      async signInWithPassword({ email, password }) {
        try {
          const users = getData('sm_users');
          const user = users.find((u) => u.email === email && u.password === password);
          if (!user) {
            return { data: null, error: { message: 'Email atau Kata Sandi salah.' } };
          }

          const profiles = getData('sm_profiles');
          const profile = profiles.find((p) => p.id === user.id);

          const session = {
            access_token: `token-${user.id}`,
            user: {
              id: user.id,
              email: user.email,
              user_metadata: user.raw_user_meta_data || {},
              profile: profile || {}
            }
          };
          setData('sm_session', session);

          authListeners.forEach((listener) => listener('SIGNED_IN', session));

          return { data: { user: session.user, session }, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },

      async signOut() {
        setData('sm_session', null);
        authListeners.forEach((listener) => listener('SIGNED_OUT', null));
        return { error: null };
      },

      async getSession() {
        const session = JSON.parse(localStorage.getItem('sm_session'));
        return { data: { session }, error: null };
      },

      onAuthStateChange(callback) {
        authListeners.push(callback);
        // Fire initial event
        const session = JSON.parse(localStorage.getItem('sm_session'));
        if (session) {
          callback('SIGNED_IN', session);
        } else {
          callback('SIGNED_OUT', null);
        }

        return {
          data: {
            subscription: {
              unsubscribe() {
                const index = authListeners.indexOf(callback);
                if (index !== -1) authListeners.splice(index, 1);
              }
            }
          }
        };
      }
    },

    from(tableName) {
      return new LocalQueryBuilder(tableName);
    },

    storage: {
      from(bucketName) {
        return {
          async upload(path, file) {
            try {
              // Convert file to base64 for localstorage persistence simulation
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64Data = reader.result;
                  const storageKey = `sm_storage_${bucketName}_${path}`;
                  localStorage.setItem(storageKey, base64Data);
                  resolve({ data: { path }, error: null });
                };
                reader.onerror = (err) => {
                  resolve({ data: null, error: err });
                };
                // Fallback if file isn't a Blob/File
                if (!(file instanceof Blob)) {
                  localStorage.setItem(`sm_storage_${bucketName}_${path}`, file);
                  resolve({ data: { path }, error: null });
                } else {
                  reader.readAsDataURL(file);
                }
              });
            } catch (err) {
              return { data: null, error: err };
            }
          },

          getPublicUrl(path) {
            // Retrieve from storage simulation
            const storageKey = `sm_storage_${bucketName}_${path}`;
            const localData = localStorage.getItem(storageKey);
            if (localData) {
              return { data: { publicUrl: localData } };
            }
            // Fallback mock URLs if not found
            return {
              data: {
                publicUrl: path.startsWith('http') ? path : `https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&auto=format&fit=crop&q=80`
              }
            };
          }
        };
      }
    }
  };
}

export const supabase = supabaseClientInstance;
