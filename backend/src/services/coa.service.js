const { ChartOfAccount, Tax } = require('../models');
const { DEFAULT_COA, DEFAULT_TAXES } = require('../utils/constants');

class COAService {
  /**
   * Create default chart of accounts for new organization
   */
  async createDefaultCOA(organizationId, transaction = null) {
    const accounts = [];
    
    for (const [categoryKey, category] of Object.entries(DEFAULT_COA)) {
      for (const account of category.accounts) {
        accounts.push({
          organizationId,
          accountCode: account.code,
          accountName: account.name,
          accountType: category.type,
          isBankAccount: account.isBankAccount,
          isActive: true
        });
      }
    }

    return await ChartOfAccount.bulkCreate(accounts, { transaction });
  }

  /**
   * Create default taxes for new organization
   */
  async createDefaultTaxes(organizationId, transaction = null) {
    const taxes = DEFAULT_TAXES.map(tax => ({
      organizationId,
      ...tax,
      isActive: true
    }));

    return await Tax.bulkCreate(taxes, { transaction });
  }

  /**
   * Get chart of accounts for organization
   */
  async getChartOfAccounts(organizationId, filters = {}) {
    const where = { organizationId };
    
    if (filters.accountType) {
      where.accountType = filters.accountType;
    }
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    
    if (filters.isBankAccount !== undefined) {
      where.isBankAccount = filters.isBankAccount;
    }

    return await ChartOfAccount.findAll({
      where,
      include: [
        {
          model: ChartOfAccount,
          as: 'parentAccount',
          attributes: ['id', 'accountName', 'accountCode']
        },
        {
          model: ChartOfAccount,
          as: 'childAccounts',
          attributes: ['id', 'accountName', 'accountCode', 'accountType']
        }
      ],
      order: [['accountCode', 'ASC'], ['accountName', 'ASC']]
    });
  }

  /**
   * Create new account
   */
  async createAccount(organizationId, accountData) {
    // Check for duplicate account name
    const existingAccount = await ChartOfAccount.findOne({
      where: {
        organizationId,
        accountName: accountData.accountName
      }
    });

    if (existingAccount) {
      throw new Error('Account name already exists');
    }

    // Check for duplicate account code if provided
    if (accountData.accountCode) {
      const existingCode = await ChartOfAccount.findOne({
        where: {
          organizationId,
          accountCode: accountData.accountCode
        }
      });

      if (existingCode) {
        throw new Error('Account code already exists');
      }
    }

    return await ChartOfAccount.create({
      organizationId,
      ...accountData
    });
  }

  /**
   * Get default account IDs for journal entries
   */
  async getDefaultAccounts(organizationId) {
    const defaultAccountNames = [
      'Accounts Receivable',
      'Accounts Payable', 
      'Sales Revenue',
      'Purchase Expenses',
      'Bank Account',
      'Cash',
      'Tax Payable',
      'Input Tax Credit'
    ];

    const accounts = await ChartOfAccount.findAll({
      where: {
        organizationId,
        accountName: defaultAccountNames
      },
      attributes: ['id', 'accountName', 'accountType', 'isBankAccount']
    });

    const accountMap = {};
    accounts.forEach(account => {
      const key = account.accountName.toLowerCase().replace(/[^a-z]/g, '');
      accountMap[key] = account;
    });

    return {
      accountsReceivable: accountMap.accountsreceivable,
      accountsPayable: accountMap.accountspayable,
      salesRevenue: accountMap.salesrevenue,
      purchaseExpenses: accountMap.purchaseexpenses,
      bankAccount: accountMap.bankaccount,
      cash: accountMap.cash,
      taxPayable: accountMap.taxpayable,
      inputTaxCredit: accountMap.inputtaxcredit
    };
  }
}

module.exports = new COAService();