

const UserModel = require('../Models/UserModel');
const UserAI = require('./ai/UserAI');

module.exports = async function joinUpdate(member, action) {
  if (!member || !member.user) return;
  const now = new Date();
  let joinEvent = {
    time: now,
    guild: { id: member.guild.id, name: member.guild.name },
    action 
  };
  await UserModel.findOneAndUpdate(
    { discordId: member.user.id },
    { $push: { joinHistory: joinEvent } },
    { upsert: true, new: true }
  );

  const updated = await UserModel.findOne({ discordId: member.user.id });
  const aiSummary = await UserAI.analyzeJoins(updated.joinHistory || []);
  await UserModel.updateOne({ discordId: member.user.id }, { $set: { 'AI.join': aiSummary }});
};
