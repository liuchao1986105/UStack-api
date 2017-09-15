// ErrorSend middleware
exports.errorSend = function(req, res, next) {
  res.send404 = function(error) {
    return res.status(404).send({ success:false, error_msg: error });
  };

  res.sendError = function(error, statusCode) {
    let returnCode;
    if (statusCode === undefined) {
      returnCode = 400;
    }
    return res.status(returnCode).send({ success:false, ererror_msgror: error });
  };

  next();
};

