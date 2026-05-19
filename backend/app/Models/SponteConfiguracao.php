<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo para armazenar configurações de integração com o Sponte
 */
class SponteConfiguracao extends Model
{
    protected $table = 'sponte_configuracoes';

    protected $fillable = [
        'codigo_cliente',
        'token_criptografado',
        'endpoint',
        'modo_mock',
        'ativo',
        'ultima_sincronizacao',
    ];

    protected $casts = [
        'modo_mock' => 'boolean',
        'ativo' => 'boolean',
        'ultima_sincronizacao' => 'datetime',
    ];
}
