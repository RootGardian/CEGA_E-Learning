import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const pepper = process.env.PASSWORD_PEPPER;

if (!pepper) {
  throw new Error('PASSWORD_PEPPER is not defined in the environment variables');
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  // Apply the pepper to the password before hashing with salt
  const passwordWithPepper = password + pepper;
  return await bcrypt.hash(passwordWithPepper, saltRounds);
};

export const comparePassword = async (password: string, hash?: string | null): Promise<boolean> => {
  if (!hash) return false;

  const passwordWithPepper = password + pepper;
  
  // Try with pepper first (new accounts)
  const isMatchWithPepper = await bcrypt.compare(passwordWithPepper, hash);
  if (isMatchWithPepper) return true;

  // Fallback for legacy accounts (without pepper)
  const isMatchWithoutPepper = await bcrypt.compare(password, hash);
  return isMatchWithoutPepper;
};
