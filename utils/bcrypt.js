import bcrypt from 'bcrypt';

export const bcryptHash = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const bcryptCompare = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
}