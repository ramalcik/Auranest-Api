const UserModel = require("../../Models/UserModel");
let chalk;

(async () => {
  chalk = (await import('chalk')).default;
})();

class UserUpdateHandler {
  constructor(clients) {
    this.clients = clients;
    this.initialize();
  }

  initialize() {
    this.clients.forEach(client => {
      client.on('userUpdate', async (oldUser, newUser) => {
        await this.handleUserUpdate(newUser);
      });
    });
  }

  async handleUserUpdate(user) {
    try {
      const userData = {
        discordId: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
        lastUpdated: new Date()
      };

      await UserModel.findOneAndUpdate(
        { discordId: userData.discordId },
        userData,
        { upsert: true, new: true }
      );

      if (chalk) {
        console.log(chalk.blueBright('🔄 [KULLANICI GÜNCELLENDİ] ') + chalk.bold(`${user.username} (${user.id})`) + chalk.cyanBright(' güncellendi!'));
      } else {
        console.log(`[KULLANICI GÜNCELLENDİ] ${user.username} (${user.id}) güncellendi!`);
      }
    } catch (error) {
      if (chalk) {
        console.error(chalk.red('Kullanıcı güncellenirken hata oluştu:'), error);
      } else {
        console.error('Kullanıcı güncellenirken hata oluştu:', error);
      }
    }
  }
}

module.exports = UserUpdateHandler; 