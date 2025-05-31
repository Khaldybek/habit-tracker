import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    // Убедимся, что пароль и хеш не пустые
    if (!password || !hashedPassword) {
      console.error('Empty password or hash');
      return false;
    }

    // Сравниваем пароли
    const result = await bcrypt.compare(password, hashedPassword);
    console.log('Password comparison:', {
      password,
      hashedPassword,
      result
    });
    return result;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}; 