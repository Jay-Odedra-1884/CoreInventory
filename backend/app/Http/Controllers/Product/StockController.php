<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\Product;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    /**
     * Display a listing of all stocks.
     */
    public function index()
    {
        try {
            $stocks = Stock::with(['product.category', 'location.warehouse'])->get();

            if ($stocks->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'No stocks found',
                    'data' => []
                ], 200);
            }

            return response()->json([
                'success' => true,
                'data' => $stocks
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch stocks',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created stock in storage.
     * If stock exists for product+location, update quantity. Otherwise, create new.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|exists:product,id',
                'location_id' => 'required|exists:locations,id',
                'quantity' => 'required|integer|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            // Check if stock already exists for this product and location
            $existingStock = Stock::where('product_id', $data['product_id'])
                ->where('location_id', $data['location_id'])
                ->first();

            if ($existingStock) {
                // Update existing stock by adding to quantity
                $existingStock->quantity += $data['quantity'];
                $existingStock->save();

                return response()->json([
                    'success' => true,
                    'message' => 'Stock updated successfully',
                    'data' => $existingStock->load('product.category', 'location.warehouse')
                ], 200);
            } else {
                // Create new stock
                $stock = Stock::create($data);

                return response()->json([
                    'success' => true,
                    'message' => 'Stock created successfully',
                    'data' => $stock->load('product.category', 'location.warehouse')
                ], 201);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create or update stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified stock.
     */
    public function show($id)
    {
        try {
            $stock = Stock::with(['product.category', 'location.warehouse'])->find($id);

            if (!$stock) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $stock
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified stock in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $stock = Stock::find($id);

            if (!$stock) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'product_id' => 'sometimes|exists:product,id',
                'location_id' => 'sometimes|exists:locations,id',
                'quantity' => 'sometimes|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $stock->update($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Stock updated successfully',
                'data' => $stock->load('product.category', 'location.warehouse')
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified stock from storage.
     */
    public function destroy($id)
    {
        try {
            $stock = Stock::find($id);

            if (!$stock) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock not found'
                ], 404);
            }

            $stock->delete();

            return response()->json([
                'success' => true,
                'message' => 'Stock deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get stocks grouped by warehouse for a specific warehouse code.
     */
    public function getStockByWarehouse($warehouse_code)
    {
        try {
            $stocks = Stock::query()
                ->join('locations', 'stock.location_id', '=', 'locations.id')
                ->join('product', 'stock.product_id', '=', 'product.id')
                ->join('product_category', 'product.category_id', '=', 'product_category.id')
                ->where('locations.warehouse_code', $warehouse_code)
                ->select([
                    'stock.id',
                    'stock.product_id',
                    'stock.quantity',
                    'stock.location_id',
                    'stock.created_at',
                    'stock.updated_at',
                    'product.name as product_name',
                    'product.sku',
                    'product.unit',
                    'product.price',
                    'product.cost',
                    'product_category.name as category_name',
                    'locations.name as location_name',
                    'locations.code as location_code'
                ])
                ->get()
                ->groupBy('location_name');

            if ($stocks->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'No stocks found for this warehouse',
                    'data' => []
                ], 200);
            }

            return response()->json([
                'success' => true,
                'data' => $stocks
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch warehouse stocks',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
