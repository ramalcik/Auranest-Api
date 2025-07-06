
res.json({
  success: true,
  user: {
    id: user.id,
    username: user.username,
    displayName: user.displayName || user.username,
    discriminator: user.discriminator,
    avatar: user.avatar ? {
      url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif?size=4096`,
      format: 'gif',
      animated: user.avatar.startsWith('a_')
    } : null,
    Banner: user.user?.banner ? {
      url: `https://cdn.discordapp.com/banners/${user.id}/${user.user.banner}.gif?size=4096`,
      format: 'gif',
      animated: user.user.banner.startsWith('a_')
    } : null,
    avatarDecoration: userAvatarDecorationURL,
    platforms: platforms,
    badges: userBadges,
    guildStaff,
    Guilds: guilds
  },
}); 