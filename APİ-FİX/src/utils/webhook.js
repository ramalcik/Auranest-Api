
const axios = require('axios');

/**
 * 
 * @param {string} webhookUrl 
 * @param {object} embed
 */
async function sendEmbedToWebhook(webhookUrl, embed) {
  if (!webhookUrl) throw new Error('Webhook URL gerekli!');
  if (!embed) throw new Error('Embed nesnesi gerekli!');
  try {
    await axios.post(webhookUrl, {
      embeds: [embed]
    });
  } catch (err) {
    console.error('Webhook gönderim hatası:', err.message);
  }
}

module.exports = { sendEmbedToWebhook };
