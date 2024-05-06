export const log = (message) => {
  return (req, res, next) => {
    let timestamp = new Date().toUTCString();
    console.log(`${message}: ${timestamp}`);
    next();
  };
};
