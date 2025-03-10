const dns = require('dns');
const { promisify } = require('util');
const resolveMx = promisify(dns.resolveMx);

const emailValidator = async (req, res, next) => {
  const { email } = req.body;
  
  // 1. Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // 2. Domain extraction
  const domain = email.split('@')[1];
  
  try {
    // 3. MX Record check
    const mxRecords = await resolveMx(domain);
    
    if (!mxRecords || mxRecords.length === 0) {
      return res.status(400).json({ 
        error: "Email domain doesn't exist or can't receive emails" 
      });
    }
    
    // 4. Check if domain has valid mail servers
    const hasValidMX = mxRecords.some(record => record.exchange);
    
    if (!hasValidMX) {
      return res.status(400).json({
        error: "This email provider doesn't exist"
      });
    }
    
    next();
  } catch (error) {
    return res.status(400).json({
      error: "Email domain verification failed"
    });
  }
};

module.exports = emailValidator;