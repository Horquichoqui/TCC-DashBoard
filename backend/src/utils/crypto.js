import crypto from "crypto";

// Obter chave de criptografia do .env
const getEncryptionKey = () => {
  const key = process.env.SPONTE_ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      "SPONTE_ENCRYPTION_KEY não configurado no .env. " +
      "Configure uma chave com 32 caracteres (ou será feito hash SHA256)."
    );
  }

  // Se a chave tiver 32 caracteres, usar diretamente
  // Caso contrário, fazer hash SHA256 para obter 32 bytes
  if (key.length === 32) {
    return Buffer.from(key);
  }

  return crypto.createHash("sha256").update(key).digest();
};

// Criptografar um texto usando AES-256-GCM
export function encrypt(text) {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16); // IV aleatório de 16 bytes
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Retornar: iv + authTag + encrypted (concatenados em hex)
    return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;
  } catch (error) {
    throw new Error("Erro ao criptografar token: " + error.message);
  }
}

// Descriptografar um texto criptografado
export function decrypt(encryptedText) {
  try {
    const key = getEncryptionKey();
    const parts = encryptedText.split(":");

    if (parts.length !== 3) {
      throw new Error("Formato de token criptografado inválido");
    }

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error("Erro ao descriptografar token: " + error.message);
  }
}

export default { encrypt, decrypt };
