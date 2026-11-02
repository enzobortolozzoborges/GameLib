import * as Crypto from 'expo-crypto';

/**
 * Gera um salt criptograficamente aleatório de 16 bytes em formato hexadecimal.
 */
export async function generateSalt(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Calcula o hash SHA-256 da senha combinada com o salt fornecido.
 * A senha nunca é armazenada em texto plano.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const combined = `${salt}:${password}`;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined
  );
  return hash;
}

/**
 * Verifica se a senha fornecida corresponde ao hash armazenado para o salt especificado.
 */
export async function verifyPassword(
  plainPassword: string,
  salt: string,
  storedHash: string
): Promise<boolean> {
  const computedHash = await hashPassword(plainPassword, salt);
  return computedHash === storedHash;
}
