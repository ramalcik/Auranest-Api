

const GuildModel = require('../Models/GuildModel');

module.exports = async function guildUpdate(oldGuild, newGuild) {
    if (!oldGuild || !newGuild) return;

    try {
 
        const changes = {
            name: oldGuild.name !== newGuild.name,
            icon: oldGuild.icon !== newGuild.icon,
            banner: oldGuild.banner !== newGuild.banner
        };

   
        if (Object.values(changes).some(change => change)) {
            const guildData = {
                name: newGuild.name,
                icon: {
                    url: newGuild.iconURL({ format: 'png', size: 4096 }),
                    format: newGuild.iconURL()?.split('.').pop().toLowerCase() || 'png',
                    animated: newGuild.iconURL()?.includes('a_') || false
                },
                banner: {
                    url: newGuild.bannerURL({ format: 'png', size: 4096 }),
                    format: newGuild.bannerURL()?.split('.').pop().toLowerCase() || 'png',
                    animated: newGuild.bannerURL()?.includes('a_') || false
                },
                lastUpdate: new Date()
            };

     
            await GuildModel.findOneAndUpdate(
                { guildId: newGuild.id },
                { $set: guildData },
                { upsert: true, new: true }
            );

       
            if (changes.name) {
                console.log(`[SUNUCU GÜNCELLEME] ${oldGuild.name} -> ${newGuild.name}`);
            }
            if (changes.icon) {
                console.log(`[SUNUCU GÜNCELLEME] ${newGuild.name} ikonu güncellendi`);
            }
            if (changes.banner) {
                console.log(`[SUNUCU GÜNCELLEME] ${newGuild.name} banneri güncellendi`);
            }
        }
    } catch (error) {
        console.error(`[SUNUCU GÜNCELLEME HATASI] ${newGuild.name}:`, error);
    }
}; 