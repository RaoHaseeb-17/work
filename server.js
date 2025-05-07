const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

const votesFile = path.join(__dirname, 'votes.json');

// Function to read votes safely
function readVotes() {
  const defaultStructure = {
    boys: { Ahmed: 0, Bilal: 0, haseeb: 0, Ateeb:0 },
    girls: { Ayesha: 0, Sana: 0, Manahil:0, Alishba:0 },
    emails: []
  };

  if (!fs.existsSync(votesFile)) {
    return defaultStructure;
  }

  try {
    const data = JSON.parse(fs.readFileSync(votesFile));

    if (typeof data !== 'object' || !data.boys || !data.girls) {
      return defaultStructure;
    }

    data.boys = { ...defaultStructure.boys, ...data.boys };
    data.girls = { ...defaultStructure.girls, ...data.girls };
    data.emails = Array.isArray(data.emails) ? data.emails : [];

    return data;
  } catch (err) {
    console.error("Error reading votes.json, resetting to default:", err);
    return defaultStructure;
  }
}

// Function to write votes
function writeVotes(data) {
  fs.writeFileSync(votesFile, JSON.stringify(data, null, 2));
}

// Check if email already voted
app.post('/check-email', (req, res) => {
  const { email } = req.body;
  const data = readVotes();
  const alreadyVoted = data.emails.includes(email);
  res.json({ emailExists: alreadyVoted });
});

// Submit votes
app.post('/submit-votes', (req, res) => {
  try {
    const { email, boyVote, girlVote } = req.body;
    const data = readVotes();

    if (data.emails.includes(email)) {
      return res.status(400).json({ message: 'This email has already voted.' });
    }

    if (!data.boys.hasOwnProperty(boyVote)) {
      return res.status(400).json({ message: 'Invalid boy candidate selected.' });
    }

    if (!data.girls.hasOwnProperty(girlVote)) {
      return res.status(400).json({ message: 'Invalid girl candidate selected.' });
    }

    data.boys[boyVote]++;
    data.girls[girlVote]++;
    data.emails.push(email);

    writeVotes(data);

    console.log('Votes updated:', data);
    res.json({ message: 'Your votes have been recorded successfully.' });
  } catch (error) {
    console.error('Error during vote submission:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});

// Clear all votes
app.post('/clear-votes', (req, res) => {
  const defaultData = {
    boys: { Ahmed: 0, Bilal: 0, haseeb: 0, Ateeb:0 },
    girls: { Ayesha: 0, Sana: 0, Manahil:0, Alishba:0 },
    emails: []
  };

  writeVotes(defaultData);

  const confirmed = readVotes();
  console.log('Votes have been reset to:', confirmed);

  res.json({ message: 'All votes have been cleared.' });
});

// ✅ Admin route to return sorted results with proper structure
app.get('/admin-votes', (req, res) => {
  const data = readVotes();

  // Convert { name: count } into [{ name, votes }]
  const sortedBoys = Object.entries(data.boys)
    .sort((a, b) => b[1] - a[1]) // Sort by votes in descending order
    .map(([name, votes]) => ({ name, votes }));

  const sortedGirls = Object.entries(data.girls)
    .sort((a, b) => b[1] - a[1]) // Sort by votes in descending order
    .map(([name, votes]) => ({ name, votes }));

  res.json({
    boys: sortedBoys,
    girls: sortedGirls
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
app.use(express.static('public'));
