export default function handler(req, res) {
  return res.status(200).json({
    success: true,
    data: [],
    message: 'Top analyses endpoint is alive'
  });
}