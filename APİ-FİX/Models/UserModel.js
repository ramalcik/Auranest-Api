const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  discriminator: { type: String },
  avatar: {
    hash: { type: String },
    url: { type: String },
    format: { type: String, enum: ['png', 'gif', 'jpg', 'webp'] },
    animated: { type: Boolean }
  },
  createdAt: { type: Date, default: Date.now },
  userInfo: {
    UserName: String,
    UserGlobalName: String,
    UserAvatar: {
      hash: String,
      url: String,
      format: { type: String, enum: ['png', 'gif', 'jpg', 'webp'] },
      animated: Boolean
    },
    UserBanner: {
      hash: String,
      url: String,
      format: { type: String, enum: ['png', 'gif', 'jpg', 'webp'] },
      animated: Boolean
    },
    UserBio: String
  },
});

module.exports = mongoose.model('User', UserSchema); 