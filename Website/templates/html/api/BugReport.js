// api/BugReport.js

// This file is intended to run on a serverless backend (Vercel Functions).
// It expects the frontend to POST JSON with: { category, message, page }

export default async function handler(req, res) {
  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = req.body || {};
    const { category, message, page } = body;

    const discordMessage = {
      content: '🪲 Bug report submitted',
      embeds: [
        {
          title: `Category: ${category || 'Unknown'}`,
          description: message || 'No message provided',
          fields: [
            { name: 'Page', value: page || 'Unknown', inline: false }
          ],
          timestamp: new Date().toISOString(),
        }
      ]
    };

    // 4. Safely pull your hidden URL from Vercel's environment
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).json({ error: 'Webhook URL is not configured on Vercel' });
    }


    // 5. Send it to Discord from Vercel's backend
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMessage),
    });

    if (discordResponse.ok) {
      return res.status(200).json({ success: true, text: 'Bug report sent!' });
    } else {
      return res.status(500).json({ error: 'Failed to send to Discord' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
