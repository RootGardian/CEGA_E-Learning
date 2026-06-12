"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackTime = exports.getPublicSettings = exports.updatePassword = exports.updateProfile = exports.getMe = exports.resetPassword = exports.forgotPassword = exports.verify2FA = exports.enable2FA = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const crypto_1 = __importDefault(require("crypto"));
const Etudiant_1 = __importDefault(require("../models/Etudiant"));
const auth_1 = require("../utils/auth");
const email_1 = require("../utils/email");
const emailTemplates_1 = require("../utils/emailTemplates");
const Intervenant_1 = __importDefault(require("../models/Intervenant"));
const User_1 = __importDefault(require("../models/User"));
const SystemSetting_1 = __importDefault(require("../models/SystemSetting"));
const generateToken = (userId, role = 'etudiant') => {
    return jsonwebtoken_1.default.sign({ id: userId, role }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, department, formationType } = req.body;
        let user = await Etudiant_1.default.findOne({ where: { email } });
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        if (user) {
            if (user.subscriptionStatus === 'pending') {
                // L'étudiant a essayé de s'inscrire mais n'a pas payé. On écrase ses anciennes infos.
                user.firstName = firstName;
                user.lastName = lastName;
                user.department = department;
                user.password = hashedPassword;
                user.formationType = formationType || 'e-learning';
                await user.save();
            }
            else {
                res.status(400).json({ message: 'Un compte actif avec cet email existe déjà.' });
                return;
            }
        }
        else {
            user = await Etudiant_1.default.create({
                firstName,
                lastName,
                department,
                email,
                password: hashedPassword,
                subscriptionStatus: 'pending', // explicitement
                formationType: formationType || 'e-learning'
            });
        }
        // Send professional welcome email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const welcome = (0, emailTemplates_1.welcomeEmail)(firstName, `${frontendUrl}/login`);
        await (0, email_1.sendEmail)(email, welcome.subject, welcome.text, welcome.html);
        const token = generateToken(user.id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        res.status(201).json({ message: 'User registered successfully', user: { id: user.id, email: user.email } });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password, token: twoFactorToken } = req.body;
        let user = await Etudiant_1.default.findOne({ where: { email } });
        let role = 'etudiant';
        if (!user) {
            user = await Intervenant_1.default.findOne({ where: { email } });
            if (user) {
                role = 'enseignant';
            }
            else {
                user = await User_1.default.findOne({ where: { email } });
                if (user) {
                    if (user.role === 'directeur_formation') {
                        role = 'admin';
                    }
                    else {
                        role = user.role;
                    }
                }
                else {
                    res.status(401).json({ message: 'Adresse email introuvable.' });
                    return;
                }
            }
        }
        // Handle password depending on table (password vs password_hash)
        const storedPassword = user.password || user.password_hash || user.getDataValue?.('password') || user.getDataValue?.('password_hash');
        console.log(`[DEBUG LOGIN] email=${email}, role=${role}, storedPassword=`, storedPassword ? 'EXISTS' : 'NULL');
        const isMatch = await (0, auth_1.comparePassword)(password, storedPassword);
        console.log(`[DEBUG LOGIN] isMatch=${isMatch}`);
        if (!isMatch) {
            console.log(`[DEBUG LOGIN] failed matching password`);
            res.status(401).json({ message: 'Mot de passe incorrect.' });
            return;
        }
        if (role === 'etudiant' && user.subscriptionStatus === 'pending') {
            res.status(401).json({ message: "Adresse email ou mot de passe non reconnu. Veuillez vous inscrire ou contacter le support." });
            return;
        }
        if (user.is_active === false) {
            res.status(403).json({ message: "Votre compte a été bloqué. Veuillez contacter l'administration de CEGA." });
            return;
        }
        if (user.isTwoFactorEnabled) {
            if (!twoFactorToken) {
                res.status(403).json({ message: '2FA token required', require2FA: true });
                return;
            }
            if (!user.twoFactorSecret) {
                res.status(500).json({ message: '2FA secret not found' });
                return;
            }
            const verified = speakeasy_1.default.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: twoFactorToken,
            });
            if (!verified) {
                res.status(401).json({ message: 'Invalid 2FA token' });
                return;
            }
        }
        const token = generateToken(user.id, role);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        res.status(200).json({ message: 'Login successful', user: { id: user.id, email: user.email, role } });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const enable2FA = async (req, res) => {
    try {
        const userId = req.user.id; // User added by authMiddleware
        const user = await Etudiant_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const secret = speakeasy_1.default.generateSecret({ name: `CEGA_E_Learning (${user.email})` });
        user.twoFactorSecret = secret.base32;
        await user.save();
        if (!secret.otpauth_url) {
            res.status(500).json({ message: 'Failed to generate OTP URL' });
            return;
        }
        const qrCodeImage = await qrcode_1.default.toDataURL(secret.otpauth_url);
        res.status(200).json({
            message: 'Scan the QR code with Google Authenticator',
            qrCodeImage,
            secret: secret.base32, // For manual entry if needed
        });
    }
    catch (error) {
        console.error('Enable 2FA error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.enable2FA = enable2FA;
const verify2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;
        const user = await Etudiant_1.default.findByPk(userId);
        if (!user || !user.twoFactorSecret) {
            res.status(400).json({ message: '2FA not setup' });
            return;
        }
        const verified = speakeasy_1.default.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
        });
        if (verified) {
            user.isTwoFactorEnabled = true;
            await user.save();
            res.status(200).json({ message: '2FA enabled successfully' });
        }
        else {
            res.status(400).json({ message: 'Invalid 2FA token' });
        }
    }
    catch (error) {
        console.error('Verify 2FA error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.verify2FA = verify2FA;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        let user = await Etudiant_1.default.findOne({ where: { email } });
        if (!user) {
            user = await Intervenant_1.default.findOne({ where: { email } });
        }
        if (!user) {
            user = await User_1.default.findOne({ where: { email } });
        }
        if (!user) {
            res.status(200).json({ message: 'Si cette adresse existe, un email a été envoyé.' });
            return;
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        // Expiration dans 1 heure
        const expireDate = new Date();
        expireDate.setHours(expireDate.getHours() + 1);
        if (user.reset_password_token !== undefined) {
            user.reset_password_token = resetToken;
            user.reset_password_expires = expireDate;
        }
        else {
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = expireDate;
        }
        await user.save();
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
        const resetEmail = (0, emailTemplates_1.resetPasswordEmail)(user.firstName || user.prenom || '', resetUrl);
        const emailSent = await (0, email_1.sendEmail)(email, resetEmail.subject, resetEmail.text, resetEmail.html);
        if (!emailSent) {
            // En cas d'échec d'envoi de mail, on efface le token par sécurité
            if (user.reset_password_token !== undefined) {
                user.reset_password_token = null;
                user.reset_password_expires = null;
            }
            else {
                user.resetPasswordToken = null;
                user.resetPasswordExpires = null;
            }
            await user.save();
            res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
            return;
        }
        res.status(200).json({ message: 'Si cette adresse existe, un email a été envoyé.' });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        // Chercher un utilisateur avec ce token
        let user = await Etudiant_1.default.findOne({ where: { resetPasswordToken: token } });
        if (!user) {
            user = await Intervenant_1.default.findOne({ where: { resetPasswordToken: token } });
        }
        if (!user) {
            user = await User_1.default.findOne({ where: { reset_password_token: token } });
        }
        if (!user) {
            res.status(400).json({ message: 'Le lien est invalide ou a expiré.' });
            return;
        }
        // Vérifier l'expiration
        const expires = user.resetPasswordExpires || user.reset_password_expires;
        if (!expires || expires < new Date()) {
            res.status(400).json({ message: 'Le lien est invalide ou a expiré.' });
            return;
        }
        // Hacher le nouveau mot de passe
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        // Mettre à jour l'utilisateur et effacer le token
        if (user.password_hash !== undefined) {
            user.password_hash = hashedPassword;
            user.reset_password_token = null;
            user.reset_password_expires = null;
        }
        else {
            user.password = hashedPassword;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
        }
        await user.save();
        res.status(200).json({ message: 'Votre mot de passe a été réinitialisé avec succès.' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.resetPassword = resetPassword;
const getMe = async (req, res) => {
    try {
        const { id, role } = req.user;
        let user;
        if (role === 'enseignant') {
            user = await Intervenant_1.default.findByPk(id, {
                attributes: { exclude: ['password', 'twoFactorSecret'] }
            });
        }
        else if (role === 'admin' || role === 'directeur_formation') {
            user = await User_1.default.findByPk(id, {
                attributes: { exclude: ['password_hash', 'twoFactorSecret'] }
            });
        }
        else {
            user = await Etudiant_1.default.findByPk(id, {
                attributes: { exclude: ['password', 'twoFactorSecret'] }
            });
        }
        if (!user) {
            res.clearCookie('token');
            res.status(401).json({ message: 'User not found or session expired' });
            return;
        }
        res.status(200).json({ ...user.toJSON(), role });
    }
    catch (error) {
        console.error('Get Me error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, phone, bio, profilePicture, notificationPreferences } = req.body;
        const user = await Etudiant_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (phone !== undefined)
            user.phone = phone;
        if (bio !== undefined)
            user.bio = bio;
        if (profilePicture !== undefined)
            user.profilePicture = profilePicture;
        if (notificationPreferences !== undefined)
            user.notificationPreferences = notificationPreferences;
        await user.save();
        // Return updated user without sensitive info
        const updatedUser = await Etudiant_1.default.findByPk(userId, {
            attributes: { exclude: ['password', 'twoFactorSecret'] }
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error('Update Profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateProfile = updateProfile;
const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        const user = await Etudiant_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const isMatch = await (0, auth_1.comparePassword)(currentPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Mot de passe actuel incorrect' });
            return;
        }
        user.password = await (0, auth_1.hashPassword)(newPassword);
        await user.save();
        res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
    }
    catch (error) {
        console.error('Update Password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updatePassword = updatePassword;
const getPublicSettings = async (req, res) => {
    try {
        const settings = await SystemSetting_1.default.findAll();
        const settingsMap = {};
        settings.forEach(s => {
            // Expose only safe public settings
            if (['formationPrice', 'siteName', 'supportEmail'].includes(s.key)) {
                settingsMap[s.key] = s.value;
            }
        });
        if (!settingsMap['formationPrice'])
            settingsMap['formationPrice'] = '150000';
        if (!settingsMap['siteName'])
            settingsMap['siteName'] = 'CEGA E-Learning';
        res.status(200).json(settingsMap);
    }
    catch (error) {
        console.error('Error fetching public settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getPublicSettings = getPublicSettings;
const trackTime = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        // Only track time for students for now
        if (userRole === 'etudiant') {
            const minutes = req.body.minutes || 1;
            const user = await Etudiant_1.default.findByPk(userId);
            if (user) {
                user.studyTime = (user.studyTime || 0) + minutes;
                await user.save();
            }
        }
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.error('Track time error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.trackTime = trackTime;
