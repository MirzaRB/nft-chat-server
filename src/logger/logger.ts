import { Request, Response, NextFunction } from 'express';
export default (req: Request, res: Response, next: NextFunction) => {
  console.warn(
    '*********************************************** ',
    JSON.stringify(req.url),
    ' ***********************************************',
  );
  console.info('REQUEST BODY =====> ', JSON.stringify(req.body));
  console.info('REQUEST PARAMS =====> ', JSON.stringify(req.params));
  console.info('REQUEST QUERY =====> ', JSON.stringify(req.query));
  // Create a copy of the original res.send method
  const originalSend = res.send;
  // Override the res.send method
  res.send = function (body: any): any {
    // Log the response body or content
    console.log('RESPONSE BODY:', body);
    console.warn(
      '===============================================> ',
      JSON.stringify(req.url),
      ' <==============================================',
    );
    console.log('\n');
    // Call the original res.send method to send the response
    originalSend.call(this, body);
  };
  next();
};
