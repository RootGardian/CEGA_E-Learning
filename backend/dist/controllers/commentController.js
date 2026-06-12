"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.createComment = exports.getComments = void 0;
const Comment_1 = __importDefault(require("../models/Comment"));
const Etudiant_1 = __importDefault(require("../models/Etudiant"));
const User_1 = __importDefault(require("../models/User"));
const Notification_1 = __importDefault(require("../models/Notification"));
const socket_1 = require("../utils/socket");
const getComments = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const comments = await Comment_1.default.findAll({
            where: { moduleId, parentId: null },
            include: [
                {
                    model: Comment_1.default,
                    as: 'replies',
                    order: [['created_at', 'ASC']],
                }
            ],
            order: [['created_at', 'DESC']],
        });
        res.json(comments);
    }
    catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
    }
};
exports.getComments = getComments;
const createComment = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { content, parentId, mentions } = req.body;
        const user = req.user;
        // Determine author type and name
        let authorType = 'etudiant';
        let authorName = '';
        if (user.role === 'etudiant') {
            const student = await Etudiant_1.default.findByPk(user.id);
            if (!student)
                return res.status(404).json({ error: 'Student not found' });
            authorName = `${student.firstName} ${student.lastName}`;
        }
        else {
            const intervenant = await User_1.default.findByPk(user.id);
            if (!intervenant)
                return res.status(404).json({ error: 'User not found' });
            authorType = 'enseignant';
            authorName = `${intervenant.nom || ''} ${intervenant.prenom || ''}`.trim() || intervenant.email;
        }
        const comment = await Comment_1.default.create({
            content,
            moduleId: parseInt(moduleId, 10),
            authorId: user.id.toString(),
            authorType,
            authorName,
            parentId: parentId || null
        });
        // Handle Mentions
        // mentions is expected to be an array of objects: { id, type }
        if (mentions && Array.isArray(mentions)) {
            for (const mention of mentions) {
                let notifData = {
                    title: 'Nouvelle mention',
                    message: `${authorName} vous a mentionné : "${content.substring(0, 60)}${content.length > 60 ? '...' : ''}"`,
                    type: 'info'
                };
                let targetSocketRoom = '';
                if (mention.type === 'etudiant') {
                    notifData.etudiantId = mention.id;
                    targetSocketRoom = `user_${mention.id}`;
                }
                else {
                    notifData.userId = mention.id;
                    targetSocketRoom = `user_${mention.id}`;
                }
                const newNotif = await Notification_1.default.create(notifData);
                (0, socket_1.getIO)().to(targetSocketRoom).emit('new_notification', newNotif);
            }
        }
        // Emit socket event to module room
        (0, socket_1.getIO)().to(`module_${moduleId}`).emit('new_comment', comment);
        res.status(201).json(comment);
    }
    catch (err) {
        console.error('Error creating comment:', err);
        res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
    }
};
exports.createComment = createComment;
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const comment = await Comment_1.default.findByPk(id);
        if (!comment)
            return res.status(404).json({ error: 'Comment not found' });
        // Allow deletion if admin, or if author is the current user
        if (user.role !== 'admin' && user.role !== 'directeur_formation' && comment.authorId !== user.id.toString()) {
            return res.status(403).json({ error: 'Non autorisé à supprimer ce commentaire' });
        }
        const moduleId = comment.moduleId;
        await comment.destroy();
        (0, socket_1.getIO)().to(`module_${moduleId}`).emit('delete_comment', id);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Error deleting comment:', err);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};
exports.deleteComment = deleteComment;
