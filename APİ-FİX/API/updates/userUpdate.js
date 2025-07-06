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
        avatar: {
          hash: user.avatar,
          url: user.avatar ? (user.avatar.startsWith('a_')
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif?size=4096`
            : `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=4096`) : null,
          format: user.avatar ? (user.avatar.startsWith('a_') ? 'gif' : 'png') : null,
          animated: user.avatar ? user.avatar.startsWith('a_') : false
        },
        lastUpdated: new Date()
      };

  
      if (user.banner) {
        userData.userInfo = {
          UserBanner: {
            hash: user.banner,
            url: user.banner.startsWith('a_')
              ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.gif?size=4096`
              : `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.png?size=4096`,
            format: user.banner.startsWith('a_') ? 'gif' : 'png',
            animated: user.banner.startsWith('a_')
          }
        };
      }

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