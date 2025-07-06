

module.exports = {
  async analyzeGuild(activityLog) {
    if (!activityLog || !activityLog.length) return {};
    let joinCount = activityLog.filter(l => l.eventType === 'memberJoin').length;
    let leaveCount = activityLog.filter(l => l.eventType === 'memberLeave').length;
    let last = activityLog[activityLog.length-1];
    return {
      lastEvent: last,
      totalJoins: joinCount,
      totalLeaves: leaveCount,
      totalEvents: activityLog.length
    };
  }
};
