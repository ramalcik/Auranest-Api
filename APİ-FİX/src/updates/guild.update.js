

const GuildModel = require('../Models/GuildModel');
const GuildAI = require('./ai/GuildAI');

module.exports = async function guildUpdate(guild, eventType, member) {
  if (!guild) return;
  const now = new Date();
  let log = {
    time: now,
    eventType, 
    member: member ? { id: member.user.id, username: member.user.username } : null
  };
  await GuildModel.findOneAndUpdate(
    { guildId: guild.id },
    { $push: { activityLog: log }, $set: { memberCount: guild.memberCount } },
    { upsert: true, new: true }
  );

  const updated = await GuildModel.findOne({ guildId: guild.id });
  const aiSummary = await GuildAI.analyzeGuild(updated.activityLog || []);
  await GuildModel.updateOne({ guildId: guild.id }, { $set: { 'AI': aiSummary }});
};
