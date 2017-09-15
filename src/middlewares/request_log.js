module.exports = function(req, res, next) {
  if (/^\/(public|agent|kue)/.test(req.url)) {
    next();
    return;
  } 
  const te = new Date();
  global.logger.info('Started' + te.toISOString() + ' ' + req.method + ' ' + req.url);

  res.on('finish', function() {
    const duration = ((new Date()) - te);

    global.logger.info('Completed ' + res.statusCode + ', '+ req.method + ' ' + req.url + ' duration (' + duration + 'ms)');
  });

  next();
};
