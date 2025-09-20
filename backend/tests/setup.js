require('dotenv').config({ path: '.env.test' });
const { sequelize } = require('../src/models');
const { Role } = require('../src/models');
const { ROLES } = require('../src/utils/constants');

// Set test environment
process.env.NODE_ENV = 'test';

// Global test setup
beforeAll(async () => {
  // Ensure database connection
  try {
    await sequelize.authenticate();
    console.log('Test database connection established successfully.');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ force: true });
    console.log('Test database synced successfully.');
    
    console.log('Test seed data created successfully.');
  } catch (error) {
    console.error('Unable to connect to the test database:', error);
    process.exit(1);
  }
});

// Create seed data required for tests
async function createSeedData() {
  // Create roles
  const roles = [
    { id: 1, name: ROLES.ADMIN, description: 'Administrator role' },
    { id: 2, name: ROLES.MANAGER, description: 'Manager role' },
    { id: 3, name: ROLES.ACCOUNTANT, description: 'Accountant role' },
    { id: 4, name: ROLES.INVOICING, description: 'Invoicing role' },
    { id: 5, name: ROLES.CUSTOMER, description: 'Customer role' }
  ];
  
  console.log('Creating roles:', roles);
  
  for (const roleData of roles) {
    const [role, created] = await Role.findOrCreate({
      where: { id: roleData.id },
      defaults: roleData
    });
    console.log(`Role ${roleData.name} ${created ? 'created' : 'already exists'}`);
  }
  
  // Verify roles exist
  const allRoles = await Role.findAll();
  console.log('All roles in database:', allRoles.map(r => ({ id: r.id, name: r.name })));
}

// Global test teardown
afterAll(async () => {
  try {
    // Close database connection
    await sequelize.close();
    console.log('Test database connection closed.');
  } catch (error) {
    console.error('Error closing test database connection:', error);
  }
});

// Clean up between test suites
afterEach(async () => {
  // Optional: Clean up data between tests
  // await sequelize.sync({ force: true });
});