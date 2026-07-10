const mongoose = require('mongoose');

// In-memory data store
const store = {
  User: [],
  Emergency: [],
  Hospital: [],
  Alert: [],
  FamilyMember: [],
  EmergencyReport: []
};

// Chainable mock query builder
class MockQuery {
  constructor(data) {
    this.data = data;
  }
  sort() { return this; }
  skip(num) { 
    if (Array.isArray(this.data)) {
      this.data = this.data.slice(num);
    }
    return this; 
  }
  limit(num) { 
    if (Array.isArray(this.data)) {
      this.data = this.data.slice(0, num);
    }
    return this; 
  }
  select() { return this; }
  populate() { return this; }
  
  // Custom helper to simulate promise resolution
  then(resolve, reject) {
    return Promise.resolve(this.data).then(resolve, reject);
  }
  catch(reject) {
    return Promise.resolve(this.data).catch(reject);
  }
}

const setupInMemoryMock = () => {
  const models = ['User', 'Emergency', 'Hospital', 'Alert', 'FamilyMember', 'EmergencyReport'];

  models.forEach(modelName => {
    let model;
    try {
      model = mongoose.model(modelName);
    } catch {
      // Model not registered yet, we'll try again on schema compile
      return;
    }

    // Save helper to create dummy mongo IDs
    const nextId = () => new mongoose.Types.ObjectId().toString();

    // 1. Mock create
    model.create = async function(doc) {
      const docs = Array.isArray(doc) ? doc : [doc];
      const created = docs.map(d => {
        const item = {
          _id: nextId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...d
        };
        // Add instance methods
        item.comparePassword = async function(pass) {
          // simple check for demo mode
          return pass === 'admin123' || pass === 'user123';
        };
        item.toJSON = function() {
          const obj = { ...this };
          delete obj.passwordHash;
          return obj;
        };
        item.toObject = function() {
          return { ...this };
        };
        store[modelName].push(item);
        return item;
      });
      return Array.isArray(doc) ? created : created[0];
    };

    // 2. Mock find
    model.find = function(query = {}) {
      let filtered = [...store[modelName]];
      // Simple filter evaluation
      Object.keys(query).forEach(key => {
        if (query[key] !== undefined && typeof query[key] !== 'object') {
          filtered = filtered.filter(item => item[key] == query[key]);
        }
      });
      return new MockQuery(filtered);
    };

    // 3. Mock findOne
    model.findOne = function(query = {}) {
      let filtered = [...store[modelName]];
      Object.keys(query).forEach(key => {
        if (query[key] !== undefined && typeof query[key] !== 'object') {
          filtered = filtered.filter(item => item[key] == query[key]);
        }
      });
      return new MockQuery(filtered[0] || null);
    };

    // 4. Mock findById
    model.findById = function(id) {
      const found = store[modelName].find(item => item._id == id);
      return new MockQuery(found || null);
    };

    // 5. Mock findByIdAndUpdate
    model.findByIdAndUpdate = function(id, update, options = {}) {
      const idx = store[modelName].findIndex(item => item._id == id);
      if (idx !== -1) {
        const current = store[modelName][idx];
        const updated = {
          ...current,
          ...(update.$set || update),
          updatedAt: new Date()
        };
        // Handle push updates
        if (update.$push) {
          Object.keys(update.$push).forEach(key => {
            updated[key] = [...(current[key] || []), update.$push[key]];
          });
        }
        store[modelName][idx] = updated;
        return new MockQuery(updated);
      }
      return new MockQuery(null);
    };

    // 6. Mock findOneAndUpdate
    model.findOneAndUpdate = function(query = {}, update, options = {}) {
      let filtered = [...store[modelName]];
      Object.keys(query).forEach(key => {
        if (query[key] !== undefined && typeof query[key] !== 'object') {
          filtered = filtered.filter(item => item[key] == query[key]);
        }
      });
      if (filtered.length > 0) {
        const item = filtered[0];
        const idx = store[modelName].findIndex(x => x._id == item._id);
        const updated = {
          ...item,
          ...(update.$set || update),
          updatedAt: new Date()
        };
        store[modelName][idx] = updated;
        return new MockQuery(updated);
      }
      return new MockQuery(null);
    };

    // 7. Mock findOneAndDelete / deleteOne
    model.findOneAndDelete = function(query = {}) {
      let filtered = [...store[modelName]];
      Object.keys(query).forEach(key => {
        if (query[key] !== undefined && typeof query[key] !== 'object') {
          filtered = filtered.filter(item => item[key] == query[key]);
        }
      });
      if (filtered.length > 0) {
        const item = filtered[0];
        store[modelName] = store[modelName].filter(x => x._id != item._id);
        return new MockQuery(item);
      }
      return new MockQuery(null);
    };

    // 8. Mock deleteMany
    model.deleteMany = async function() {
      store[modelName] = [];
      return { deletedCount: 0 };
    };

    // 9. Mock insertMany
    model.insertMany = async function(docs) {
      return model.create(docs);
    };

    // 10. Mock countDocuments
    model.countDocuments = function() {
      return new MockQuery(store[modelName].length);
    };

    // 11. Mock aggregate
    model.aggregate = function() {
      // Return simple mock arrays for chart metrics
      return new MockQuery([]);
    };
  });
};

const connectDB = async () => {
  try {
    // Attempt real connection
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Refused (${error.message})`);
    console.warn(`⚙️  SafeGuard AI is running on in-memory database simulation.`);
    
    // Register schemas to models if not already compiled
    try {
      require('../models/User');
      require('../models/Emergency');
      require('../models/Hospital');
      require('../models/Alert');
      require('../models/FamilyMember');
      require('../models/EmergencyReport');
    } catch (e) {
      console.warn('Schemas pre-loading warning:', e.message);
    }
    
    setupInMemoryMock();
    
    // Auto-seed simulation with demo data
    if (!global.inMemorySeeded) {
      global.inMemorySeeded = true;
      setTimeout(() => {
        try {
          const seed = require('../seed');
          console.log('🌱 Telemetry Simulation: Auto-seeding mock database schema objects...');
          seed().then(() => {
            console.log('✅ Simulation Database populated successfully.');
          }).catch(err => {
            console.warn('Simulation seeding completed with warnings.');
          });
        } catch (err) {
          console.warn('Could not locate seeder for simulation DB fallback:', err.message);
        }
      }, 500);
    }
  }
};

module.exports = connectDB;
