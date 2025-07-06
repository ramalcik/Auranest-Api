const UserModel = require("../../Models/UserModel");
let chalk;

(async () => {
  chalk = (await import('chalk')).default;
})();

class VoiceStateUpdateHandler {
  constructor(clients, controller) {
    this.clients = clients;
    this.controller = controller;
    this.initialize();
  }

  initialize() {
    this.clients.forEach(client => {
      client.on('voiceStateUpdate', async (oldState, newState) => {
        if (!newState.member || !newState.member.user || newState.member.user.bot) return;
        await this.handleVoiceStateUpdate(oldState, newState);
      });
    });
  }

  async handleVoiceStateUpdate(oldState, newState) {
    try {
      if (!newState.member || !newState.member.user) return;
      const userData = {
        discordId: newState.member.user.id,
        username: newState.member.user.username,
        discriminator: newState.member.user.discriminator,
        avatar: newState.member.user.avatar,
        lastUpdated: new Date()
      };

    
      if (oldState.channel && !newState.channel) {
        const members = [];
        if (oldState.channel.members) {
        oldState.channel.members.forEach(member => {
            if (!member || !member.user) return;
            if (!newState.member || !newState.member.user) return;
          if (member.id !== newState.member.user.id) {
            members.push({
              id: member.id,
              username: member.user.username || 'Bilinmeyen Kullanıcı',
              displayName: member.displayName || member.user.username || 'Bilinmeyen Kullanıcı',
                avatar: (typeof member.user.displayAvatarURL === 'function') ? member.user.displayAvatarURL({ size: 128 }) : null
            });
          }
        });
        }

        await UserModel.findOneAndUpdate(
          { discordId: userData.discordId },
          {
            ...userData,
            'LastSeen.Voice': {
              channelName: oldState.channel.name,
              guildName: oldState.guild.name,
              timestamp: new Date(),
              members: members
            }
          },
          { upsert: true, new: true }
        );
      }

      if (chalk) {
        if (newState.channelId && newState.member && newState.member.user) {
          console.log(chalk.blue('🔊 [SES KANALI] ') + chalk.bold(`${newState.member.user.username} (${newState.member.user.id})`) + chalk.cyan(` ${newState.guild.name} sunucusunda ${newState.channel.name} kanalına katıldı!`));
        } else if (newState.member && newState.member.user) {
          console.log(chalk.blue('🔇 [SES KANALI] ') + chalk.bold(`${newState.member.user.username} (${newState.member.user.id})`) + chalk.cyan(` ${newState.guild.name} sunucusundan ses kanalından ayrıldı!`));
        }
      } else {
        if (newState.channelId && newState.member && newState.member.user) {
          console.log(`[SES KANALI] ${newState.member.user.username} (${newState.member.user.id}) ${newState.guild.name} sunucusunda ${newState.channel.name} kanalına katıldı!`);
        } else if (newState.member && newState.member.user) {
          console.log(`[SES KANALI] ${newState.member.user.username} (${newState.member.user.id}) ${newState.guild.name} sunucusundan ses kanalından ayrıldı!`);
        }
      }
    } catch (error) {
      if (chalk) {
        console.error(chalk.red('Ses kanalı durumu kaydedilirken hata oluştu:'), error);
      } else {
        console.error('Ses kanalı durumu kaydedilirken hata oluştu:', error);
      }
    }
  }
}

module.exports = VoiceStateUpdateHandler; 