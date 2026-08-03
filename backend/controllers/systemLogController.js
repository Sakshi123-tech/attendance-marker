const SystemLog = require('../models/SystemLog');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Get system logs with optional filtering and pagination
 * @route   GET /api/v1/system-logs
 * @access  Private (SUPER_ADMIN)
 */
const getSystemLogs = catchAsync(async (req, res, next) => {
  const { type, search, page = 1, limit = 50 } = req.query;

  // Build query
  const query = {};

  if (type && type !== 'ALL') {
    query.type = type;
  }

  if (search) {
    query.$or = [
      { action: { $regex: search, $options: 'i' } },
      { target: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const startIndex = (pageNum - 1) * limitNum;

  // Execute query
  const total = await SystemLog.countDocuments(query);
  const logs = await SystemLog.find(query)
    .populate({
      path: 'user',
      select: 'fullName email employeeId role'
    })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limitNum);

  res.status(200).json({
    status: 'success',
    results: logs.length,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    },
    data: {
      logs
    }
  });
});

module.exports = {
  getSystemLogs
};
