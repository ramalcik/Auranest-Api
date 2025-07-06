

const GuildModel = require('../Models/GuildModel');
const { Types } = require('mongoose');


let guildVoiceStats = {};


function getAssetFormat(url) {
    if (!url) return null;
    
    const format = url.split('.').pop().toLowerCase();
    const isAnimated = url.includes('a_');
    
    return {
        url: url,
        format: format,
        animated: isAnimated
    };
}

module.exports = async function guildVoiceUpdate(guild) {
    if (!guild) return;
    
    const now = new Date();
    const guildId = guild.id;
    

    const iconInfo = getAssetFormat(guild.iconURL({ format: 'gif', size: 4096 }));
    const bannerInfo = getAssetFormat(guild.bannerURL({ format: 'gif', size: 4096 }));
    

    const voiceChannels = guild.channels.cache.filter(channel => channel.type === 'GUILD_VOICE');
    const channelStats = voiceChannels.map(channel => {
        const members = channel.members;
        const totalUsers = members.size;
        const mutedUsers = members.filter(member => member.voice.mute || member.voice.selfMute).size;
        const deafenedUsers = members.filter(member => member.voice.deaf || member.voice.selfDeaf).size;
        const streamingUsers = members.filter(member => member.voice.streaming).size;
        
        return {
            channelId: channel.id,
            channelName: channel.name,
            totalUsers,
            mutedUsers,
            deafenedUsers,
            streamingUsers,
            users: members.map(member => ({
                id: member.id,
                username: member.user.username,
                isMuted: member.voice.mute || member.voice.selfMute,
                isDeafened: member.voice.deaf || member.voice.selfDeaf,
                isStreaming: member.voice.streaming
            }))
        };
    });
    

    const guildStats = {
        totalVoiceChannels: voiceChannels.size,
        totalUsersInVoice: channelStats.reduce((sum, channel) => sum + channel.totalUsers, 0),
        totalMutedUsers: channelStats.reduce((sum, channel) => sum + channel.mutedUsers, 0),
        totalDeafenedUsers: channelStats.reduce((sum, channel) => sum + channel.deafenedUsers, 0),
        totalStreamingUsers: channelStats.reduce((sum, channel) => sum + channel.streamingUsers, 0),
        channels: channelStats
    };
    
   
    await GuildModel.findOneAndUpdate(
        { guildId: guildId },
        {
            $push: {
                voiceStats: {
                    timestamp: now,
                    ...guildStats
                }
            },
            $set: {
                name: guild.name,
                icon: iconInfo,
                banner: bannerInfo,
                lastVoiceUpdate: now,
                currentVoiceStats: guildStats
            }
        },
        { upsert: true, new: true }
    );
    
  
    guildVoiceStats[guildId] = {
        lastUpdate: now,
        stats: guildStats,
        icon: iconInfo,
        banner: bannerInfo
    };
    
    return {
        ...guildStats,
        icon: iconInfo,
        banner: bannerInfo
    };
};


module.exports.getCurrentStats = function(guildId) {
    return guildVoiceStats[guildId];
};


module.exports.getAllGuildStats = function() {
    return guildVoiceStats;
}; 