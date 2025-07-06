const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  discriminator: { type: String },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
  

  userInfo: {
    UserName: String,
    UserGlobalName: String,
    UserAvatar: String,
    UserBanner: String,
    UserBio: String
  },
  displayNames: [String],
  WhereNow: {
    SunucuName: String,
    Channel: String,
    Type: String 
  },
  LastSeen: {
    Message: {
      content: String,
      channelName: String,
      guildName: String,
      timestamp: Date
    },
    Voice: {
      id: String,
      channelName: String,
      guildName: String,
      timestamp: Date,
      members: [{
        id: String,
        username: String
      }]
    }
  },
  TopName: String,
  TopAge: String,
  TopSex: String,
  Punishments: [mongoose.Schema.Types.Mixed],
  GuildStats: [
    {
      GuildName: String,
      GuildID: String,
      VoiceStat: String,
      MessageStat: Number
    }
  ],
  GuildStaff: [
    {
      GuildName: String,
      GuildId: String,
      StaffStatus: Boolean
    }
  ],
  Guilds: [
    {
      DisplayName: String,
      GuildName: String,
      GuildId: String
    }
  ]
});

module.exports = mongoose.model('User', UserSchema);
