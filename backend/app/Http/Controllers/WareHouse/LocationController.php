<?php

namespace App\Http\Controllers\WareHouse;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $locations = Location::with('warehouse')->get();
        return response()->json([
            "success" => true,
            "message" => "Locations fetched successfully",
            "data" => $locations
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'warehouse_code' => 'required|exists:warehouse,code',
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "message" => "Validation failed",
                "data" => $validator->errors()
            ]);
        }

        // Generate location code (e.g., LOC001)
        $lastLocation = Location::latest()->first();
        if (!$lastLocation) {
            $code = 'LOC001';
        } else {
            $number = intval(substr($lastLocation->code, 3)) + 1;
            $code = 'LOC' . str_pad($number, 3, '0', STR_PAD_LEFT);
        }

        $location = Location::create([
            'name' => $request->name,
            'code' => $code,
            'warehouse_code' => $request->warehouse_code,
        ]);

        return response()->json([
            "success" => true,
            "message" => "Location created successfully",
            "data" => $location
        ]);
    }

    public function show(string $id)
    {
        $location = Location::with('warehouse')->findOrFail($id);
        return response()->json([
            "success" => true,
            "message" => "Location fetched successfully",
            "data" => $location
        ]);
    }

    //get the all locations by warehouse code
    public function getLocationsByWarehouseCode(string $warehouse_code)
    {
        $locations = Location::with('warehouse')->where('warehouse_code', $warehouse_code)->get();
        return response()->json([
            "success" => true,
            "message" => "Locations fetched successfully",
            "data" => $locations
        ]);
    }

    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'warehouse_code' => 'required|exists:warehouse,code',
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "message" => "Validation failed",
                "data" => $validator->errors()
            ]);
        }

        $location = Location::findOrFail($id);
        $location->update([
            'name' => $request->name,
            'warehouse_code' => $request->warehouse_code,
        ]);

        return response()->json([
            "success" => true,
            "message" => "Location updated successfully",
            "data" => $location
        ]);
    }

    public function destroy(string $id)
    {
        $location = Location::findOrFail($id);
        $location->delete();
        return response()->json([
            "success" => true,
            "message" => "Location deleted successfully",
            "data" => $location
        ]);
    }
}
