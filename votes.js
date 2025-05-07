import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, candidate, gender } = req.body;
    const filePath = path.join(process.cwd(), 'data', 'votes.json');

    try {
      console.log('Reading votes data...');  // Debugging log

      const data = await fs.promises.readFile(filePath, 'utf8');
      const votes = JSON.parse(data);
      console.log('Votes data:', votes); // Debugging log

      if (votes.emails.includes(email)) {
        console.log('Email already voted:', email);  // Debugging log
        return res.status(400).json({ message: 'You have already voted!' });
      }

      if (gender === 'boy' && votes.boys[candidate] !== undefined) {
        votes.boys[candidate] += 1;
      } else if (gender === 'girl' && votes.girls[candidate] !== undefined) {
        votes.girls[candidate] += 1;
      } else {
        console.log('Invalid candidate or gender:', gender, candidate);  // Debugging log
        return res.status(400).json({ message: 'Invalid candidate or gender!' });
      }

      votes.emails.push(email);
      await fs.promises.writeFile(filePath, JSON.stringify(votes, null, 2));

      console.log('Vote successfully recorded for:', email);  // Debugging log
      return res.status(200).json({ message: 'Vote recorded successfully!' });
    } catch (err) {
      console.error('Error writing vote:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  res.status(405).json({ message: 'Method not allowed' });
}
