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

    // Map categories to emojis and readable names
    const categoryMap = {
      '404': { emoji: '🚫', name: '404 Error' },
      'game-bugs': { emoji: '🐛', name: 'Game Bug' },
      'performance': { emoji: '⚡', name: 'Performance Issue' },
      'account': { emoji: '🔐', name: 'Account/Login Issue' },
      'feature-request': { emoji: '✨', name: 'Feature Request' },
      'other': { emoji: '❓', name: 'Other Issue' }
    };

    const categoryInfo = categoryMap[category] || { emoji: '❔', name: category || 'Unknown' };

    const discordMessage = {
      content: `${categoryInfo.emoji} **New ${categoryInfo.name}**`,
      embeds: [
        {
          author: {
            name: `${categoryInfo.emoji} ${categoryInfo.name}`,
            icon_url: 'https://xonra.vercel.app/images/Xonra-logo.png'
          },
          title: null,
          description: `\`\`\`\n${message || 'No message provided'}\n\`\`\``,
          fields: [
            { 
              name: '📄 Page URL',
              value: `[Link](${page || 'Unknown'})`,
              inline: false
            },
            { 
              name: '🏷️ Category',
              value: categoryInfo.name,
              inline: true
            },
            { 
              name: '⏰ Timestamp',
              value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
              inline: true
            }
          ],
          color: getColorForCategory(category),
          footer: {
            text: 'Xonra Bug Report System',
            icon_url: 'https://xonra.vercel.app/images/Xonra-logo.png'
          },
          timestamp: new Date().toISOString(),
        }
      ]
    };

    // Safely pull your hidden URL from Vercel's environment
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).json({ error: 'Webhook URL is not configured on Vercel' });
    }

    // Send it to Discord from Vercel's backend
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMessage),
    });

    if (discordResponse.ok) {
      return res.status(200).json({ success: true, message: 'Report sent successfully!' });
    } else {
      return res.status(500).json({ error: 'Failed to send to Discord' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Helper function to assign colors based on category
function getColorForCategory(category) {
  const colors = {
    '404': 0xED4245,           // Discord Red (#ED4245)
    'game-bugs': 0xED4245,     // Discord Red
    'performance': 0xFAA61A,   // Discord Yellow/Orange (#FAA61A)
    'account': 0xED4245,       // Discord Red
    'feature-request': 0x57F287, // Discord Green (#57F287)
    'other': 0x949BA4         // Discord Gray (#949BA4)
  };
  return colors[category] || 0x949BA4;
}