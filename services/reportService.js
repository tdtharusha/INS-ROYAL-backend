import Order from '../models/orderModel.js';
import GRN from '../models/grnModel.js';
import PreMadeFoodsInventory from '../models/PreMadeFoodsInventoryModel.js';

const generateOrderInvoice = async (orderId) => {
  const order = await Order.findById(orderId).populate('user', 'name email');
  // Process order data and format for invoice
  return {
    type: 'OrderInvoice',
    data: order,
    generatedAt: new Date(),
  };
};

const generateRevenueReport = async (startDate, endDate) => {
  const revenue = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        isPaid: true,
      },
    },
    {
      $unwind: '$orderItems',
    },
    {
      $group: {
        _id: {
          name: '$orderItems.name',
        },
        totalQuantity: {
          $sum: '$orderItems.quantity',
        },
        totalRevenue: {
          $sum: {
            $multiply: ['$orderItems.quantity', '$totalPrice'],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: '$_id.name',
        totalQuantity: 1,
        totalRevenue: 1,
      },
    },
    {
      $group: {
        _id: null,
        totalItems: {
          $sum: '$totalQuantity',
        },
        totalRevenue: {
          $sum: '$totalRevenue',
        },
        items: {
          $push: {
            name: '$name',
            totalQuantity: '$totalQuantity',
            totalRevenue: '$totalRevenue',
          },
        },
      },
    },
  ]);
  //   console.log('revenue:', revenue);
  //   console.log('revenue items:', revenue[0].items);

  if (revenue.length === 0) {
    return {
      type: 'Revenue',
      data: null,
      message: 'No revenue data available for the specified date range.',
      startDate,
      endDate,
      generatedAt: new Date(),
    };
  }

  return {
    type: 'Revenue',
    data: {
      items: revenue[0].items,
      totalItems: revenue[0].totalItems,
      totalRevenue: revenue[0].totalRevenue,
    },
    startDate,
    endDate,
    generatedAt: new Date(),
  };
};

const generateExpenseReport = async (startDate, endDate) => {
  const expenses = await GRN.aggregate([
    {
      $match: {
        dateReceived: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $unwind: '$items',
    },
    {
      $group: {
        _id: {
          productName: '$items.productName',
          category: '$items.category',
        },
        totalQuantity: {
          $sum: '$items.quantityReceived',
        },
        totalExpense: {
          $sum: '$items.totalPrice',
        },
      },
    },
    {
      $project: {
        _id: 0,
        productName: '$_id.productName',
        category: '$_id.category',
        totalQuantity: 1,
        totalExpense: 1,
      },
    },
    {
      $group: {
        _id: null,
        totalQuantity: {
          $sum: '$totalQuantity',
        },
        totalExpense: {
          $sum: '$totalExpense',
        },
        items: {
          $push: {
            productName: '$productName',
            category: '$category',
            totalQuantity: '$totalQuantity',
            totalExpense: '$totalExpense',
          },
        },
      },
    },
  ]);

  //   console.log('expenses:', expenses);
  //   console.log('expenses items:', expenses[0].items);

  if (expenses.length === 0) {
    return {
      type: 'Expense',
      data: null,
      message: 'No expense data available for the specified date range.',
      startDate,
      endDate,
      generatedAt: new Date(),
    };
  }

  return {
    type: 'Expense',
    data: {
      items: expenses[0].items,
      totalQuantity: expenses[0].totalQuantity,
      totalExpense: expenses[0].totalExpense,
    },
    startDate,
    endDate,
    // generatedBy: user.name,
    generatedAt: new Date(),
  };
};

const generateGRNInvoice = async (grnId) => {
  const grn = await GRN.findById(grnId).populate('supplier', 'supplierName');
  // Process GRN data and format for invoice
  return {
    type: 'GRNInvoice',
    data: grn,
    // generatedBy: grn.user.name,
    generatedAt: new Date(),
  };
};

const generateInventoryReport = async (startDate, endDate) => {
  const inventory = await PreMadeFoodsInventory.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $project: {
        _id: 0,
        productName: 1,
        quantity: 1,
        reorderLevel: 1,
        unit: 1,
      },
    },
  ]);

  return {
    type: 'Inventory',
    data: inventory,
    startDate,
    endDate,
    generatedAt: new Date(),
  };
};

const generateProfitReport = async (startDate, endDate) => {
  const revenue = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        isPaid: true,
      },
    },
    {
      $unwind: '$orderItems',
    },
    {
      $group: {
        _id: {
          name: '$orderItems.name',
        },
        totalRevenue: {
          $sum: {
            $multiply: ['$orderItems.quantity', '$totalPrice'],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
      },
    },
    {
      $group: {
        _id: {
          name: '$orderItems.name',
        },
        totalRevenue: {
          $sum: {
            $multiply: ['$orderItems.quantity', '$totalPrice'],
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: '$totalRevenue',
        },
        items: {
          $push: {
            totalRevenue: '$totalRevenue',
          },
        },
      },
    },
  ]);
  //   console.log('total revenue:', revenue);

  const expenses = await GRN.aggregate([
    {
      $match: {
        dateReceived: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $unwind: '$items',
    },
    {
      $group: {
        _id: {
          productName: '$items.productName',
        },
        totalExpense: {
          $sum: '$items.totalPrice',
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalExpense: 1,
      },
    },
    {
      $group: {
        _id: null,
        totalExpense: {
          $sum: '$totalExpense',
        },
        items: {
          $push: {
            productName: '$productName',
            totalExpense: '$totalExpense',
          },
        },
      },
    },
  ]);
  //   console.log('total expenses:', expenses);

  if (revenue.length === 0 || expenses.length === 0) {
    return {
      type: 'Profit',
      data: null,
      message: 'No profit data available for the specified date range.',
      startDate,
      endDate,
      generatedAt: new Date(),
    };
  }

  const profit = revenue[0]?.totalRevenue - expenses[0]?.totalExpense;
  //   console.log('profit:', profit);
  return {
    type: 'Profit',
    data: [
      { item: 'Expences', value: expenses[0]?.totalExpense || 0 },
      { item: 'Revenue', value: revenue[0]?.totalRevenue || 0 },
      { item: 'Total Profit', value: profit },
    ],
    startDate,
    endDate,
    generatedAt: new Date(),
  };
};

export {
  generateOrderInvoice,
  generateRevenueReport,
  generateExpenseReport,
  generateGRNInvoice,
  generateInventoryReport,
  generateProfitReport,
};
