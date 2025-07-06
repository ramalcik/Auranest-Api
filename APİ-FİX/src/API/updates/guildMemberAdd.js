const UserModel = require("../../Models/UserModel");
let chalk;

(async () => {
  chalk = (await import('chalk')).default;
})();

class GuildMemberAddHandler {
  constructor(clients) {
    this.clients = clients;
    this.initialize();
  }

  initialize() {
    this.clients.forEach(client => {
      client.on('guildMemberAdd', async (member) => {
        await this.handleMemberAdd(member);
      });
    });
  }

  async handleMemberAdd(member) {
    try {
      const userData = {
        discordId: member.user.id,
        username: member.user.username,
        discriminator: member.user.discriminator,
        avatar: member.user.avatar,
        lastUpdated: new Date(),
        lastGuildJoined: {
          guildId: member.guild.id,
          guildName: member.guild.name,
          timestamp: new Date()
        }
      };

      await UserModel.findOneAndUpdate(
        { discordId: userData.discordId },
        userData,
        { upsert: true, new: true }
      );

      if (chalk) {
        console.log(chalk.green('➕ [YENİ ÜYE] ') + chalk.bold(`${member.user.username} (${member.user.id})`) + chalk.cyan(` ${member.guild.name} sunucusuna katıldı!`));
      } else {
        console.log(`[YENİ ÜYE] ${member.user.username} (${member.user.id}) ${member.guild.name} sunucusuna katıldı!`);
      }
    } catch (error) {
      if (chalk) {
        console.error(chalk.red('Yeni üye bilgisi kaydedilirken hata oluştu:'), error);
      } else {
        console.error('Yeni üye bilgisi kaydedilirken hata oluştu:', error);
      }
    }
  }
}

module.exports = GuildMemberAddHandler; 