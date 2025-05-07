import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const filePath = path.join(process.cwd(), 'data', 'votes.json');
      const data = await fs.promises.readFile(filePath, 'utf8');
      const votes = JSON.parse(data);

      // Convert boys/girls object into sorted arrays
      const boys = Object.entries(votes.boys)
        .map(([name, voteCount]) => ({ name, votes: voteCount }))
        .sort((a, b) => b.votes - a.votes);

      const girls = Object.entries(votes.girls)
        .map(([name, voteCount]) => ({ name, votes: voteCount }))
        .sort((a, b) => b.votes - a.votes);

      return res.status(200).json({ boys, girls });
    } catch (error) {
      console.error("Error reading file:", error);
      return res.status(500).json({ message: 'Failed to load vote data' });
    }
  }

  res.status(405).json({ message: 'Method not allowed' });
}
