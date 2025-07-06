const mongoose = require('mongoose');

const guildVoiceStatsSchema = new mongoose.Schema({
    timestamp: { type: Date, required: true },
    totalVoiceChannels: { type: Number, required: true },
    totalUsersInVoice: { type: Number, required: true },
    totalMutedUsers: { type: Number, required: true },
    totalDeafenedUsers: { type: Number, required: true },
    totalStreamingUsers: { type: Number, required: true },
    channels: [{
        channelId: { type: String, required: true },
        channelName: { type: String, required: true },
        totalUsers: { type: Number, required: true },
        mutedUsers: { type: Number, required: true },
        deafenedUsers: { type: Number, required: true },
        streamingUsers: { type: Number, required: true },
        users: [{
            id: { type: String, required: true },
            username: { type: String, required: true },
            isMuted: { type: Boolean, required: true },
            isDeafened: { type: Boolean, required: true },
            isStreaming: { type: Boolean, required: true }
        }]
    }]
});

const guildSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    icon: {
        url: { type: String },
        format: { type: String, enum: ['png', 'gif', 'jpg', 'webp'] },
        animated: { type: Boolean }
    },
    banner: {
        url: { type: String },
        format: { type: String, enum: ['png', 'gif', 'jpg', 'webp'] },
        animated: { type: Boolean }
    },
    lastVoiceUpdate: { type: Date },
    currentVoiceStats: {
        totalVoiceChannels: { type: Number },
        totalUsersInVoice: { type: Number },
        totalMutedUsers: { type: Number },
        totalDeafenedUsers: { type: Number },
        totalStreamingUsers: { type: Number },
        channels: [{
            channelId: { type: String },
            channelName: { type: String },
            totalUsers: { type: Number },
            mutedUsers: { type: Number },
            deafenedUsers: { type: Number },
            streamingUsers: { type: Number },
            users: [{
                id: { type: String },
                username: { type: String },
                isMuted: { type: Boolean },
                isDeafened: { type: Boolean },
                isStreaming: { type: Boolean }
            }]
        }]
    },
    voiceStats: [guildVoiceStatsSchema]
}, { timestamps: true });

module.exports = mongoose.model('Guild', guildSchema); 