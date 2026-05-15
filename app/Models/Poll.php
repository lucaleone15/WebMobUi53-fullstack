<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Poll extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'question',
        'secret_token',
        'is_draft',
        'allow_multiple_choices',
        'allow_vote_change',
        'results_public',
        'started_at',
        'ends_at',
    ];

    protected $casts = [
        'is_draft'               => 'boolean',
        'allow_multiple_choices' => 'boolean',
        'allow_vote_change'      => 'boolean',
        'results_public'         => 'boolean',
        'started_at'             => 'datetime',
        'ends_at'                => 'datetime',
    ];

    // Inclus automatiquement dans toArray() et les réponses JSON
    protected $appends = ['has_started', 'has_ended'];

    // --- Relations ---

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(PollOption::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(PollVote::class);
    }

    // --- Accesseurs (auto-sérialisés via $appends) ---

    protected function hasStarted(): Attribute
    {
        return Attribute::get(
            fn() => ! $this->started_at || $this->started_at->lte(now())
        );
    }

    protected function hasEnded(): Attribute
    {
        return Attribute::get(
            fn() => $this->ends_at && $this->ends_at->lte(now())
        );
    }

    // --- Logique métier ---

    public function isVotable(): bool
    {
        return ! $this->is_draft && $this->has_started && ! $this->has_ended;
    }
}
