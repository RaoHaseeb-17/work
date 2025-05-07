import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;
    const filePath = path.join(process.cwd(), 'data', 'votes.json');
    const votes = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Check if email already voted
    const alreadyVoted = votes.emails.includes(email);

    if (alreadyVoted) {
      return res.status(200).json({ message: 'Email already used for voting' });
    }
    return res.status(200).json({ message: 'Email is available for voting' });
  }

  res.status(405).json({ message: 'Method not allowed' });
}
