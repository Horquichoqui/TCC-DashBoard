<?php

namespace App\Utils;

use Exception;

/**
 * Utilitário de criptografia AES-256-GCM para tokens do Sponte
 */
class CryptoUtil
{
    /**
     * Obter chave de criptografia do .env
     */
    private static function getEncryptionKey(): string
    {
        $key = env('SPONTE_ENCRYPTION_KEY');

        if (!$key) {
            throw new Exception(
                'SPONTE_ENCRYPTION_KEY não configurado no .env. ' .
                'Configure uma chave com 32 caracteres.'
            );
        }

        // Se tiver exatamente 32 caracteres, usar diretamente
        if (strlen($key) === 32) {
            return $key;
        }

        // Caso contrário, fazer hash SHA256
        return hash('sha256', $key, true);
    }

    /**
     * Criptografar um texto usando AES-256-GCM
     */
    public static function encrypt(string $text): string
    {
        try {
            $key = self::getEncryptionKey();
            $iv = openssl_random_pseudo_bytes(16); // IV aleatório
            $cipher = 'aes-256-gcm';

            $encrypted = openssl_encrypt($text, $cipher, $key, OPENSSL_RAW_DATA, $iv, $tag);

            // Retornar: iv:tag:encrypted (em hex)
            return bin2hex($iv) . ':' . bin2hex($tag) . ':' . bin2hex($encrypted);
        } catch (Exception $e) {
            throw new Exception('Erro ao criptografar token: ' . $e->getMessage());
        }
    }

    /**
     * Descriptografar um texto criptografado
     */
    public static function decrypt(string $encryptedText): string
    {
        try {
            $key = self::getEncryptionKey();
            $parts = explode(':', $encryptedText);

            if (count($parts) !== 3) {
                throw new Exception('Formato de token criptografado inválido');
            }

            $iv = hex2bin($parts[0]);
            $tag = hex2bin($parts[1]);
            $encrypted = hex2bin($parts[2]);
            $cipher = 'aes-256-gcm';

            $decrypted = openssl_decrypt($encrypted, $cipher, $key, OPENSSL_RAW_DATA, $iv, $tag);

            if ($decrypted === false) {
                throw new Exception('Falha ao descriptografar token');
            }

            return $decrypted;
        } catch (Exception $e) {
            throw new Exception('Erro ao descriptografar token: ' . $e->getMessage());
        }
    }
}
