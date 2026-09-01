class ApiResponse {
  static success(res, data = {}, message = 'Success', statusCode = 200) {
    const req = res?.req;
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(req?.id && { requestId: req.id }),
      timestamp: new Date().toISOString()
    });
  }

  static created(res, data = {}, message = 'Resource created successfully') {
    const req = res?.req;
    return res.status(201).json({
      success: true,
      message,
      data,
      ...(req?.id && { requestId: req.id }),
      timestamp: new Date().toISOString()
    });
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, errors = null, errorCode = null) {
    const req = res?.req;
    const payload = {
      success: false,
      message,
      ...(errorCode && { code: errorCode }),
      ...(req?.id && { requestId: req.id }),
      timestamp: new Date().toISOString()
    };
    if (errors) {
      payload.errors = errors;
    }
    return res.status(statusCode).json(payload);
  }

  static paginate(res, items = [], total = 0, page = 1, limit = 20, message = 'Success') {
    const totalPages = Math.ceil(total / limit);
    const req = res?.req;
    return res.status(200).json({
      success: true,
      message,
      data: items,
      ...(req?.id && { requestId: req.id }),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ApiResponse;
