<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $fillable = [
        "name",
        "code",
        "warehouse_code",
    ];
    
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_code', 'code');
    }
}
