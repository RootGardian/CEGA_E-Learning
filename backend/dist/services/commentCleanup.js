"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCommentCleanupJob = void 0;
const sequelize_1 = require("sequelize");
const Comment_1 = __importDefault(require("../models/Comment"));
const socket_1 = require("../utils/socket");
const startCommentCleanupJob = () => {
    // Run cleanup every hour (3600000 ms)
    setInterval(async () => {
        try {
            const cutoffDate = new Date(Date.now() - 72 * 60 * 60 * 1000);
            const oldComments = await Comment_1.default.findAll({
                where: {
                    createdAt: {
                        [sequelize_1.Op.lt]: cutoffDate
                    }
                }
            });
            if (oldComments.length > 0) {
                // Emit delete event for each to keep clients in sync
                for (const comment of oldComments) {
                    (0, socket_1.getIO)().to(`module_${comment.moduleId}`).emit('delete_comment', comment.id.toString());
                }
                await Comment_1.default.destroy({
                    where: {
                        createdAt: {
                            [sequelize_1.Op.lt]: cutoffDate
                        }
                    }
                });
                console.log(`[Cleanup] Deleted ${oldComments.length} old comments.`);
            }
        }
        catch (err) {
            console.error('Error cleaning up comments:', err);
        }
    }, 3600000);
    console.log('Comment cleanup job started (runs every hour).');
};
exports.startCommentCleanupJob = startCommentCleanupJob;
