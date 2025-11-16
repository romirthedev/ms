// Minimal Vercel function test
export default function handler(req, res) {
  console.log('Minimal function test');
  return res.status(200).json({ success: true, message: 'Minimal function working' });
}