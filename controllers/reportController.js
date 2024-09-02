import asyncHandler from 'express-async-handler';
import Report from '../models/reportModel.js';
import {
  generateOrderInvoice,
  generateRevenueReport,
  generateExpenseReport,
  generateGRNInvoice,
  generateInventoryReport,
  generateProfitReport,
} from '../services/reportService.js';

const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date format. Please use YYYY-MM-DD.');
  }

  if (start > end) {
    throw new Error('Start date must be before or equal to end date.');
  }

  return { start, end };
};

// desc - Geneterate order invoice
// route - /api/reports/order-invoice/:orderId
const getOrderInvoice = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  if (!orderId) {
    res.status(400).json('Order ID is required');
  }
  const report = await generateOrderInvoice(orderId);
  const savedReport = await Report.create(report);
  res.status(200).json(savedReport);
});

// desc - Geneterate order invoice
// route - /api/reports/revenue
const getRevenueReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: 'Both start date and end date are required' });
  }

  try {
    const { start, end } = validateDateRange(startDate, endDate);
    const report = await generateRevenueReport(start, end);

    if (!report.data) {
      return res.status(200).json({ message: report.message });
    }

    const savedReport = await Report.create(report);
    return res.status(200).json(savedReport);
  } catch (err) {
    return res.status(400).json({
      messsage: 'Error generating revenue report',
      error: err.message,
    });
  }
});

// desc - Geneterate expense report
// route - /api/reports/expense
const getExpenseReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  //   console.log('Start date:', startDate);
  //   console.log('end date:', endDate);

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: 'Both start date and end date are required' });
  }

  try {
    const { start, end } = validateDateRange(startDate, endDate);
    const report = await generateExpenseReport(start, end);

    if (!report.data) {
      return res.status(200).json({ message: report.message });
    }

    const savedReport = await Report.create(report);
    return res.status(200).json(savedReport);
  } catch (err) {
    return res
      .status(400)
      .json({ message: 'Error generating expense report', error: err.message });
  }
});

// desc - Geneterate GRN invoice
// route - /api/reports/grn-invoice/:grnId
const getGRNInvoice = asyncHandler(async (req, res) => {
  const { grnId } = req.params;
  if (!grnId) {
    res.status(400).json('GRN ID is required');
  }

  const report = await generateGRNInvoice(grnId);
  const savedReport = await Report.create(report);
  res.status(200).json(savedReport);
});

// desc - Geneterate inventory report
// route - /api/reports/inventory
const getInventoryReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: 'Both start date and end date are required' });
  }

  try {
    const { start, end } = validateDateRange(startDate, endDate);
    const report = await generateInventoryReport(start, end);

    if (!report.data) {
      return res.status(200).json({ message: report.message });
    }
    const savedReport = await Report.create(report);
    return res.status(200).json(savedReport);
  } catch (err) {
    return res
      .status(400)
      .json({ message: 'Error generating expense report', error: err.message });
  }
});

// desc - Geneterate profit report
// route - /api/reports/profit
const getProfitReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    res.status(400).json('Both start date and end date are required');
  }

  try {
    const { start, end } = validateDateRange(startDate, endDate);
    const report = await generateProfitReport(start, end);

    if (!report.data) {
      return res.status(200).json({ message: report.message });
    }

    const savedReport = await Report.create(report);
    res.status(200).json(savedReport);
  } catch (err) {
    res.status(400).json('Error generating profit report', err);
  }
});

export {
  getOrderInvoice,
  getRevenueReport,
  getExpenseReport,
  getGRNInvoice,
  getInventoryReport,
  getProfitReport,
};
