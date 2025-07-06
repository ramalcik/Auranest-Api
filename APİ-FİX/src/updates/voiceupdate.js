

const UserModel = require('../Models/UserModel');
const UserAI = require('./ai/UserAI');

const { Types } = require('mongoose');
const UserModel = require('../Models/UserModel');
const UserAI = require('./ai/UserAI');


let activeVoiceUsers = {};

module.exports = async function voiceUpdate(member, oldState, newState) {
  if (!member || !member.user) return;
  const now = new Date();
  const userId = member.user.id;


  if (!oldState.channel && newState.channel) {
    activeVoiceUsers[userId] = { channel: newState.channel.id, enterTime: now };
  }


  if (oldState.channel && (!newState.channel || oldState.channel.id !== newState.channel.id)) {
    const entry = activeVoiceUsers[userId];
    let durationMs = 0;
    let channelId = oldState.channel.id;
    if (entry && entry.channel === channelId) {
      durationMs = now - entry.enterTime;
      delete activeVoiceUsers[userId];
    }

    let voiceStat = {
      time: now,
      guild: { id: member.guild.id, name: member.guild.name },
      channel: { id: oldState.channel.id, name: oldState.channel.name },
      durationMs,
      users: oldState.channel.members.map(m => ({ id: m.id, username: m.user.username }))
    };
    await UserModel.findOneAndUpdate(
      { discordId: userId },
      { $push: { voiceHistory: voiceStat }, $set: { 'WhereNow': null } },
      { upsert: true, new: true }
    );
  }


  if (newState.channel) {
    await UserModel.findOneAndUpdate(
      { discordId: userId },
      { $set: {
        'WhereNow': {
          SunucuName: newState.guild.name,
          Channel: newState.channel.name,
          Type: 'Voice',
          ChannelId: newState.channel.id,
          GuildId: newState.guild.id,
          Users: newState.channel.members.map(m => ({ id: m.id, username: m.user.username }))
        }
      }},
      { upsert: true, new: true }
    );
  }


  const updated = await UserModel.findOne({ discordId: userId });
  const aiSummary = await UserAI.analyzeVoice(updated.voiceHistory || []);
  await UserModel.updateOne({ discordId: userId }, { $set: { 'AI.voice': aiSummary }});
};
