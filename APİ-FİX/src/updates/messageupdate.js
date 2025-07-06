

const UserModel = require('../Models/UserModel');
const UserAI = require('./ai/UserAI');

module.exports = async function messageUpdate(message) {
  if (!message || !message.author) return;
  const now = new Date();
  let msg = {
    time: now,
    guild: message.guild ? { id: message.guild.id, name: message.guild.name } : null,
    channel: message.channel ? { id: message.channel.id, name: message.channel.name } : null,
    content: message.content
  };
  await UserModel.findOneAndUpdate(
    { discordId: message.author.id },
    { $push: { messageHistory: msg } },
    { upsert: true, new: true }
  );

  const updated = await UserModel.findOne({ discordId: message.author.id });
  const aiSummary = await UserAI.analyzeMessages(updated.messageHistory || []);
  await UserModel.updateOne({ discordId: message.author.id }, { $set: { 'AI.message': aiSummary }});
};
