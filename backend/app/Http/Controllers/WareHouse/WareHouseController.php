<?php

namespace App\Http\Controllers\WareHouse;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WareHouseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $warehouses = Warehouse::get();
        return response()->json([
            "success" => true,
            "message" => "Warehouses fetched successfully",
            "data" => $warehouses
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
        ]);

        //generate the warehouse code also autoincrement
        $lastWarehouse = Warehouse::latest()->first();
        if (!$lastWarehouse) {
            $code = 'WH001';
        } else {
            $number = intval(substr($lastWarehouse->code, 2)) + 1;
            $code = 'WH' . str_pad($number, 3, '0', STR_PAD_LEFT);
        }

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "message" => "Validation failed",
                "data" => $validator->errors()
            ]);
        }
        $warehouse = Warehouse::create([
            'name' => $request->name,
            'address' => $request->address,
            'code' => $code,
        ]);
        return response()->json([
            "success" => true,
            "message" => "Warehouse created successfully",
            "data" => $warehouse
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $code)
    {
        $warehouse = Warehouse::where('code', $code)->first();
        if (!$warehouse) {
            return response()->json([
                "success" => false,
                "message" => "Warehouse not found",
                "data" => null
            ]);
        }
        return response()->json([
            "success" => true,
            "message" => "Warehouse fetched successfully",
            "data" => $warehouse
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $code)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
        ]);
        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "message" => "Validation failed",
                "data" => $validator->errors()
            ]);
        }
        $warehouse = Warehouse::where('code', $code)->first();
        $warehouse->update($request->all());
        return response()->json([
            "success" => true,
            "message" => "Warehouse updated successfully",
            "data" => $warehouse
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $code)
    {
        $warehouse = Warehouse::where('code', $code)->first();
        $warehouse->delete();
        return response()->json([
            "success" => true,
            "message" => "Warehouse deleted successfully",
            "data" => $warehouse
        ]);
    }
}
