<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    protected $table = "warehouse";
    protected $fillable = [
        'name',
        'address',
        'code',
    ];

    public function getRouteKeyName()
    {
        return 'code';
    }

    public function locations()
    {
        return $this->hasMany(Location::class, 'warehouse_code', 'code');
    }
}
