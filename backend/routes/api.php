<?php

use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\WareHouse\LocationController;
use App\Http\Controllers\WareHouse\WareHouseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

//for authentication
Route::post('register', [UserController::class, 'register']);
Route::post('login', [UserController::class, 'login']);
Route::post('logout', [UserController::class, 'logout']);

Route::post('forgot-password', [UserController::class, 'forgotPassword']);
Route::post('verify-otp', [UserController::class, 'verifyOtp']);
Route::post('reset-password', [UserController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('users', [UserController::class, 'store']); // Admin adds manager/staff
});

//warehouse routes
Route::resource('locations', LocationController::class);
Route::resource('warehouses', WareHouseController::class);
//get the all locations by warehouse code
Route::get('locations/warehouse/{warehouse_code}', [LocationController::class, 'getLocationsByWarehouseCode']);
