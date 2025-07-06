

module.exports = {
  async analyzeUser(user) {
    if (!user) return {};
    return {
      lastSeen: user.lastSeen,
      lastGuild: user.lastGuild,
      totalVoice: user.voiceHistory ? user.voiceHistory.length : 0,
      totalMessages: user.messageHistory ? user.messageHistory.length : 0,
      totalJoins: user.joinHistory ? user.joinHistory.length : 0
    };
  },
  async analyzeVoice(voiceHistory) {
    if (!voiceHistory || !voiceHistory.length) return {};

    let last = voiceHistory[voiceHistory.length-1];
    return {
      lastVoiceGuild: last.guild,
      lastVoiceChannel: last.newChannel,
      totalVoice: voiceHistory.length
    };
  },
  async analyzeMessages(messageHistory) {
    if (!messageHistory || !messageHistory.length) return {};
    let last = messageHistory[messageHistory.length-1];
    return {
      lastMessage: last.content,
      lastMessageChannel: last.channel,
      totalMessages: messageHistory.length
    };
  },
  async analyzeJoins(joinHistory) {
    if (!joinHistory || !joinHistory.length) return {};
    let last = joinHistory[joinHistory.length-1];
    return {
      lastJoinGuild: last.guild,
      lastJoinTime: last.time,
      totalJoins: joinHistory.length
    };
  }
};
