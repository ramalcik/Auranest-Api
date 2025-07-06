const UserModel = require("../../Models/UserModel");
let chalk;

(async () => {
  chalk = (await import('chalk')).default;
})();

class GuildMemberRemoveHandler {
  constructor(clients) {
    this.clients = clients;
    this.initialize();
  }

  initialize() {
    this.clients.forEach(client => {
      client.on('guildMemberRemove', async (member) => {
        await this.handleMemberRemove(member);
      });
    });
  }

  async handleMemberRemove(member) {
    try {
      const userData = {
        discordId: member.user.id,
        username: member.user.username,
        discriminator: member.user.discriminator,
        avatar: member.user.avatar,
        lastUpdated: new Date(),
        lastGuildLeft: {
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
        console.log(chalk.red('👋 [KULLANICI AYRILDI] ') + chalk.bold(`${member.user.username} (${member.user.id})`) + chalk.yellow(` ${member.guild.name} sunucusundan ayrıldı!`));
      } else {
        console.log(`[KULLANICI AYRILDI] ${member.user.username} (${member.user.id}) ${member.guild.name} sunucusundan ayrıldı!`);
      }
    } catch (error) {
      if (chalk) {
        console.error(chalk.red('Kullanıcı ayrılma bilgisi kaydedilirken hata oluştu:'), error);
      } else {
        console.error('Kullanıcı ayrılma bilgisi kaydedilirken hata oluştu:', error);
      }
    }
  }
}

module.exports = GuildMemberRemoveHandler; 