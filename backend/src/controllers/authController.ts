import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import Etudiant from '../models/Etudiant';
import { hashPassword, comparePassword } from '../utils/auth';
import { sendEmail } from '../utils/email';

import Intervenant from '../models/Intervenant';
import User from '../models/User';
import SystemSetting from '../models/SystemSetting';

const generateToken = (userId: number, role: string = 'etudiant') => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: '1d',
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, department } = req.body;

    const existingUser = await Etudiant.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await Etudiant.create({
      firstName,
      lastName,
      department,
      email,
      password: hashedPassword,
    });

    // Optional: Send welcome email
    await sendEmail(email, 'Welcome to CEGA E-Learning', 'Thank you for registering on our platform!');

    const token = generateToken(user.id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, token: twoFactorToken } = req.body;

    let user: any = await Etudiant.findOne({ where: { email } });
    let role = 'etudiant';

    if (!user) {
      user = await Intervenant.findOne({ where: { email } });
      if (user) {
        role = 'enseignant';
      } else {
        user = await User.findOne({ where: { email } });
        if (user) {
          if (user.role === 'directeur_formation') {
            role = 'admin';
          } else {
            role = user.role;
          }
        } else {
          res.status(401).json({ message: 'Invalid credentials' });
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
      res.status(401).json({ message: 'Invalid credentials' });
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

    // Pour des raisons de sécurité, on retourne "succès" même si l'email n'existe pas
    // pour éviter l'énumération des utilisateurs.
    const user = await Etudiant.findOne({ where: { email } });
    if (!user) {
      res.status(200).json({ message: 'Si cette adresse existe, un email a été envoyé.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    // Expiration dans 1 heure
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 1);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expireDate;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a;">Réinitialisation de votre mot de passe</h2>
        <p>Bonjour ${user.firstName || ''},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte CEGA E-Learning.</p>
        <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe. Ce lien est valide pendant <strong>1 heure</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="color: #64748b; font-size: 0.9em; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email. Votre compte est en sécurité.
        </p>
      </div>
    `;

    const emailSent = await sendEmail(
      email,
      'CEGA E-Learning - Réinitialisation du mot de passe',
      `Pour réinitialiser votre mot de passe, cliquez sur ce lien : ${resetUrl}\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
      emailHtml
    );

    if (!emailSent) {
      // En cas d'échec d'envoi de mail, on efface le token par sécurité
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
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

    // Chercher un utilisateur avec ce token ET une date d'expiration dans le futur
    const user = await Etudiant.findOne({
      where: {
        resetPasswordToken: token
      }
    });

    if (!user) {
      res.status(400).json({ message: 'Le lien est invalide ou a expiré.' });
      return;
    }

    // Vérifier manuellement l'expiration car certains SGBD gèrent mal les comparaisons de dates directes dans le where
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      res.status(400).json({ message: 'Le lien est invalide ou a expiré.' });
      return;
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await hashPassword(password);

    // Mettre à jour l'utilisateur et effacer le token
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
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
