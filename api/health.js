module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'PDF Filler API is running on Vercel'
  });
}; 