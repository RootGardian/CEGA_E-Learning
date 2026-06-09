"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ override: true });
const pepper = process.env.PASSWORD_PEPPER;
if (!pepper) {
    throw new Error('PASSWORD_PEPPER is not defined in the environment variables');
}
const hashPassword = async (password) => {
    const saltRounds = 10;
    // Apply the pepper to the password before hashing with salt
    const passwordWithPepper = password + pepper;
    return await bcrypt_1.default.hash(passwordWithPepper, saltRounds);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    if (!hash)
        return false;
    const passwordWithPepper = password + pepper;
    // Try with pepper first (new accounts)
    const isMatchWithPepper = await bcrypt_1.default.compare(passwordWithPepper, hash);
    if (isMatchWithPepper)
        return true;
    // Fallback for legacy accounts (without pepper)
    const isMatchWithoutPepper = await bcrypt_1.default.compare(password, hash);
    return isMatchWithoutPepper;
};
exports.comparePassword = comparePassword;
