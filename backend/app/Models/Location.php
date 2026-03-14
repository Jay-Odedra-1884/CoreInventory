<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Location extends Model
{
    protected $fillable = [
        "name",
        "code",
        "warehouse_code",
    ];
    
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_code', 'code');
    }

    /**
     * Get the stocks for the location.
     */
    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class, 'location_id');
    }
}
