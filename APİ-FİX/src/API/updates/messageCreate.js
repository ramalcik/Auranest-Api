const UserModel = require("../../Models/UserModel");
let chalk;

(async () => {
  chalk = (await import('chalk')).default;
})();

class MessageCreateHandler {
  constructor(clients, controller) {
    this.clients = clients;
    this.controller = controller;
    this.initialize();
  }

  initialize() {
    this.clients.forEach(client => {
      client.on('messageCreate', async (message) => {
        if (!message.author.bot) {
          await this.handleMessage(message);
        }
      });
    });
  }

  async handleMessage(message) {
    try {
      if (!message.guild) return;
      const userData = {
        discordId: message.author.id,
        username: message.author.username,
        discriminator: message.author.discriminator,
        avatar: message.author.avatar,
        lastUpdated: new Date()
      };

      await UserModel.findOneAndUpdate(
        { discordId: userData.discordId },
        {
          ...userData,
          'LastSeen.Message': {
            content: message.content,
            channelName: message.channel.name,
            guildName: message.guild?.name || 'DM',
            timestamp: new Date()
          }
        },
        { upsert: true, new: true }
      );

      if (chalk) {
        console.log(chalk.yellow('📨 [YENİ MESAJ] ') + chalk.bold(`${message.author.username} (${message.author.id})`) + chalk.cyan(` ${message.guild?.name || 'DM'} sunucusunda mesaj gönderdi!`));
      } else {
        console.log(`[YENİ MESAJ] ${message.author.username} (${message.author.id}) ${message.guild?.name || 'DM'} sunucusunda mesaj gönderdi!`);
      }
    } catch (error) {
      if (chalk) {
        console.error(chalk.red('Mesaj bilgisi kaydedilirken hata oluştu:'), error);
      } else {
        console.error('Mesaj bilgisi kaydedilirken hata oluştu:', error);
      }
    }
  }
}

module.exports = MessageCreateHandler; 