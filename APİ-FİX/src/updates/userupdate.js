

const UserModel = require('../Models/UserModel');
const UserAI = require('./ai/UserAI');

module.exports = async function userUpdate(member, activityType, extra) {
  if (!member || !member.user) return;
  const now = new Date();


  let userInfo = {
    discordId: member.user.id,
    username: member.user.username,
    discriminator: member.user.discriminator,
    avatar: member.user.avatar,
    lastSeen: now,
    lastActivityType: activityType,
    lastGuild: member.guild ? { id: member.guild.id, name: member.guild.name } : undefined,
    lastChannel: member.voice && member.voice.channel ? { id: member.voice.channel.id, name: member.voice.channel.name } : (extra && extra.channel ? extra.channel : undefined),
    lastMessage: extra && extra.message ? extra.message : undefined
  };


  const updated = await UserModel.findOneAndUpdate(
    { discordId: userInfo.discordId },
    { $set: userInfo },
    { upsert: true, new: true }
  );


  const aiSummary = await UserAI.analyzeUser(updated);
  await UserModel.updateOne({ discordId: userInfo.discordId }, { $set: { AI: aiSummary }});
};
