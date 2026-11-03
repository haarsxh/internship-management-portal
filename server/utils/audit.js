const AuditLog = require('../models/AuditLog');

// Records who did what. Never lets a logging failure break the request.
module.exports = (actor, action, targetType, targetId, summary) =>
  AuditLog.create({ actor: actor._id, actorName: actor.name, action, targetType, targetId, summary }).catch((e) =>
    console.error('Audit log failed:', e.message)
  );
