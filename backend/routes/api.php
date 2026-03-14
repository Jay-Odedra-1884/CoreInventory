<?php

use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\Product\ProductController;
use App\Http\Controllers\Product\ProductCategoryController;
use App\Http\Controllers\Product\StockController;
use App\Http\Controllers\WareHouse\LocationController;
use App\Http\Controllers\WareHouse\WareHouseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

//for authentication
Route::post('register', [UserController::class, 'register']);
Route::post('login', [UserController::class, 'login'])->name('login');
Route::post('logout', [UserController::class, 'logout']);

// Forgot password flow
Route::post('forgot-password/send-otp', [UserController::class, 'forgotPassword']);
Route::post('forgot-password/verify-otp', [UserController::class, 'verifyOtp']);
Route::post('forgot-password/reset', [UserController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('users', [UserController::class, 'store']); // Admin adds manager/staff
    Route::apiResource('products', ProductController::class);
    Route::apiResource('product-categories', ProductCategoryController::class);
    
    //warehouse routes
    Route::resource('locations', LocationController::class);
    Route::resource('warehouses', WareHouseController::class);
    
    //get the all locations by warehouse code
    Route::get('locations/warehouse/{warehouse_code}', [LocationController::class, 'getLocationsByWarehouseCode']);
    
    //stock routes
    Route::apiResource('stocks', StockController::class);
    Route::get('stocks/warehouse/{warehouse_code}', [StockController::class, 'getStockByWarehouse']);
});


