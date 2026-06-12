import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import Etudiant from '../models/Etudiant';
import { hashPassword, comparePassword } from '../utils/auth';
import { sendEmail } from '../utils/email';
import { welcomeEmail, resetPasswordEmail } from '../utils/emailTemplates';

import Intervenant from '../models/Intervenant';
import User from '../models/User';
import SystemSetting from '../models/SystemSetting';
import Formation from '../models/Formation';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId: number, role: string = 'etudiant') => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: '1d',
  });
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Email requis' });
      return;
    }

    const lowerEmail = email.toLowerCase().trim();
    const user = await Etudiant.findOne({ where: { email: lowerEmail } });

    if (user) {
      res.status(400).json({ message: 'Un compte avec cet email existe déjà.' });
      return;
    }

    res.status(200).json({ message: 'Email disponible' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, token: twoFactorToken } = req.body;

    const lowerEmail = email.toLowerCase().trim();

    let user: any = await Etudiant.findOne({ where: { email: lowerEmail } });
    let role = 'etudiant';

    if (!user) {
      user = await Intervenant.findOne({ where: { email: lowerEmail } });
      if (user) {
        role = 'enseignant';
      } else {
        user = await User.findOne({ where: { email: lowerEmail } });
        if (user) {
          if (user.role === 'directeur_formation') {
            role = 'admin';
          } else {
            role = user.role;
          }
        } else {
          res.status(401).json({ message: 'Adresse email introuvable.' });
          return;
        }
      }
    }

    // Handle password depending on table (password vs password_hash)
    const storedPassword = user.password || user.password_hash || user.getDataValue?.('password') || user.getDataValue?.('password_hash');
    console.log(`[DEBUG LOGIN] email=${email}, role=${role}, storedPassword=`, storedPassword ? 'EXISTS' : 'NULL');
    const isMatch = await comparePassword(password, storedPassword);
    console.log(`[DEBUG LOGIN] isMatch=${isMatch}`);

    if (!isMatch) {
      console.log(`[DEBUG LOGIN] failed matching password`);
      res.status(401).json({ message: 'Mot de passe incorrect.' });
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

      const verified = speakeasy.totp.verify({
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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      res.status(400).json({ message: 'No credential provided' });
      return;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).json({ message: 'Invalid token payload' });
      return;
    }

    const { email, given_name, family_name, picture } = payload;
    if (!email) {
      res.status(400).json({ message: 'Email non trouvé dans le token Google.' });
      return;
    }

    const lowerEmail = email.toLowerCase().trim();

    let user: any = await Etudiant.findOne({ where: { email: lowerEmail } });
    let role = 'etudiant';

    if (!user) {
      user = await Intervenant.findOne({ where: { email: lowerEmail } });
      if (user) {
        role = 'enseignant';
      } else {
        user = await User.findOne({ where: { email: lowerEmail } });
        if (user) {
          if (user.role === 'directeur_formation') {
            role = 'admin';
          } else {
            role = user.role;
          }
        }
      }
    }

    if (!user) {
      // Utilisateur non trouvé, on retourne les infos pour l'inscription
      res.status(200).json({ 
        action: 'register', 
        userDetails: { 
          email: lowerEmail, 
          firstName: given_name || '', 
          lastName: family_name || '',
          profilePicture: picture || ''
        } 
      });
      return;
    }

    // Utilisateur existant
    if (user.is_active === false) {
      res.status(403).json({ message: "Votre compte a été bloqué. Veuillez contacter l'administration de CEGA." });
      return;
    }

    const token = generateToken(user.id, role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({ 
      action: 'login', 
      message: 'Login successful', 
      user: { id: user.id, email: user.email, role } 
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(500).json({ message: 'Server error during Google Authentication' });
  }
};

export const enable2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id; // User added by authMiddleware
    const user = await Etudiant.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const secret = speakeasy.generateSecret({ name: `CEGA_E_Learning (${user.email})` });

    user.twoFactorSecret = secret.base32;
    await user.save();

    if (!secret.otpauth_url) {
      res.status(500).json({ message: 'Failed to generate OTP URL' });
      return;
    }

    const qrCodeImage = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      message: 'Scan the QR code with Google Authenticator',
      qrCodeImage,
      secret: secret.base32, // For manual entry if needed
    });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verify2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { token } = req.body;
    const user = await Etudiant.findByPk(userId);

    if (!user || !user.twoFactorSecret) {
      res.status(400).json({ message: '2FA not setup' });
      return;
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      user.isTwoFactorEnabled = true;
      await user.save();
      res.status(200).json({ message: '2FA enabled successfully' });
    } else {
      res.status(400).json({ message: 'Invalid 2FA token' });
    }
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    let user: any = await Etudiant.findOne({ where: { email } });
    if (!user) {
      user = await Intervenant.findOne({ where: { email } });
    }
    if (!user) {
      user = await User.findOne({ where: { email } });
    }

    if (!user) {
      res.status(200).json({ message: 'Si cette adresse existe, un email a été envoyé.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    // Expiration dans 1 heure
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 1);

    if (user.reset_password_token !== undefined) {
      user.reset_password_token = resetToken;
      user.reset_password_expires = expireDate;
    } else {
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = expireDate;
    }
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const resetEmail = resetPasswordEmail(user.firstName || user.prenom || '', resetUrl);

    const emailSent = await sendEmail(
      email,
      resetEmail.subject,
      resetEmail.text,
      resetEmail.html
    );

    if (!emailSent) {
      // En cas d'échec d'envoi de mail, on efface le token par sécurité
      if (user.reset_password_token !== undefined) {
        user.reset_password_token = null;
        user.reset_password_expires = null;
      } else {
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
      }
      await user.save();
      res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
      return;
    }

    res.status(200).json({ message: 'Si cette adresse existe, un email a été envoyé.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Chercher un utilisateur avec ce token
    let user: any = await Etudiant.findOne({ where: { resetPasswordToken: token } });
    
    if (!user) {
      user = await Intervenant.findOne({ where: { resetPasswordToken: token } });
    }
    if (!user) {
      user = await User.findOne({ where: { reset_password_token: token } });
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
    const hashedPassword = await hashPassword(password);

    // Mettre à jour l'utilisateur et effacer le token
    if (user.password_hash !== undefined) {
      user.password_hash = hashedPassword;
      user.reset_password_token = null;
      user.reset_password_expires = null;
    } else {
      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
    }
    
    await user.save();

    res.status(200).json({ message: 'Votre mot de passe a été réinitialisé avec succès.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, role } = (req as any).user;

    let user: any;
    if (role === 'enseignant') {
      user = await Intervenant.findByPk(id, {
        attributes: { exclude: ['password', 'twoFactorSecret'] }
      });
    } else if (role === 'admin' || role === 'directeur_formation') {
      user = await User.findByPk(id, {
        attributes: { exclude: ['password_hash', 'twoFactorSecret'] }
      });
    } else {
      user = await Etudiant.findByPk(id, {
        attributes: { exclude: ['password', 'twoFactorSecret'] }
      });
    }

    if (!user) {
      res.clearCookie('token');
      res.status(401).json({ message: 'User not found or session expired' });
      return;
    }

    res.status(200).json({ ...user.toJSON(), role });
  } catch (error) {
    console.error('Get Me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { firstName, lastName, phone, bio, profilePicture, notificationPreferences } = req.body;
    const user = await Etudiant.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (notificationPreferences !== undefined) user.notificationPreferences = notificationPreferences;

    await user.save();

    // Return updated user without sensitive info
    const updatedUser = await Etudiant.findByPk(userId, {
      attributes: { exclude: ['password', 'twoFactorSecret'] }
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Update Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await Etudiant.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Mot de passe actuel incorrect' });
      return;
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error('Update Password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPublicSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await SystemSetting.findAll();
    const settingsMap: Record<string, string | null> = {};
    settings.forEach(s => {
      // Expose only safe public settings
      if (['formationPrice', 'siteName', 'supportEmail'].includes(s.key)) {
        settingsMap[s.key] = s.value;
      }
    });

    if (!settingsMap['formationPrice']) settingsMap['formationPrice'] = '150000';
    if (!settingsMap['siteName']) settingsMap['siteName'] = 'CEGA E-Learning';

    res.status(200).json(settingsMap);
  } catch (error) {
    console.error('Error fetching public settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPublicFormations = async (req: Request, res: Response): Promise<void> => {
  try {
    const formations = await Formation.findAll({
      attributes: ['id', 'titre', 'code_formation', 'frais_inscription'],
      order: [['titre', 'ASC']]
    });
    res.status(200).json(formations);
  } catch (error) {
    console.error('Error fetching public formations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const trackTime = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    
    // Only track time for students for now
    if (userRole === 'etudiant') {
      const minutes = req.body.minutes || 1;
      const user = await Etudiant.findByPk(userId);
      if (user) {
        user.studyTime = (user.studyTime || 0) + minutes;
        await user.save();
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Track time error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
