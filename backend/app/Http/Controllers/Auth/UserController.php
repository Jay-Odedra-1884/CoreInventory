<?php

namespace App\Http\Controllers\Auth;

use App\Jobs\PasswordReset;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
class UserController extends Controller
{
    function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()], 400);
        }

        $data = $validator->validated();

        // Generate custom login_id (EMP001, EMP002, etc.)
        $lastUser = User::orderBy('id', 'desc')->first();

        if (!$lastUser) {
            $loginId = 'EMP001';
        } else {
            // Extract numeric part from login_id, increment it, and pad back to 3 digits
            $number = intval(substr($lastUser->login_id, 3)) + 1;
            $loginId = 'EMP' . str_pad($number, 3, '0', STR_PAD_LEFT);
        }

        $data['login_id'] = $loginId;
        $data['password'] = Hash::make($request->password);
        $data['role'] = 'staff'; // Public registration always defaults to staff
        $data['is_active'] = true;

        $user = User::create($data);
         $token = $user->createToken('MyToken')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'login_id' => $user->login_id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'token' => $token,
            ]
        ], 201);
    }

    /**
     * Admin can add users with specific roles
     */
    public function store(Request $request)
    {
        // Add middleware check in routes or here
        // if (Auth::user()->role !== 'admin') {
        //     return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        // }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|in:admin,manager,staff',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()], 400);
        }

        $data = $validator->validated();

        // Generate custom login_id (EMP001, EMP002, etc.)
        $lastUser = User::orderBy('id', 'desc')->first();
        if (!$lastUser) {
            $loginId = 'EMP001';
        } else {
            $number = intval(substr($lastUser->login_id, 3)) + 1;
            $loginId = 'EMP' . str_pad($number, 3, '0', STR_PAD_LEFT);
        }

        $data['login_id'] = $loginId;
        $data['password'] = Hash::make($request->password);
        $data['is_active'] = true;

        $user = User::create($data);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user
        ], 201);
    }


    function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'login_id' => 'required|string',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
            ], 422);
        }

        if (!Auth::attempt($request->only('login_id', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Credentials',
            ], 401);
        }

        $user = Auth::user();

        if (!$user->is_active) {
            Auth::logout();
            return response()->json([
                'success' => false,
                'message' => 'Your account is deactivated.',
            ], 403);
        }

        $token = $user->createToken('MyToken')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User logged in',
            'token' => $token,
            'data' => $user,
        ]);
    }

    function logout(Request $request)
    {

        Auth::logout();

        return response()->json([
            'success' => true,
            'message' => 'User logged out',
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'No user found with this email address.'
        ]);

        try {
            $user = User::where('email', $request->email)->first();
            $otp = rand(100000, 999999);

            // Delete any existing tokens for this email
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            // Store new OTP
            DB::table('password_reset_tokens')->insert([
                'email' => $request->email,
                'token' => Hash::make($otp),
                'created_at' => Carbon::now()
            ]);

            // Dispatch email job
            PasswordReset::dispatch($user, $otp);

            return response()->json([
                'success' => true,
                'message' => 'OTP has been sent to your email.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send OTP. Please try again later.'
            ], 500);
        }
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|numeric|digits:6',
        ]);

        $resetData = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetData) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP.'
            ], 400);
        }

        // Check if OTP is expired (e.g., 60 minutes)
        $expiry = config('auth.passwords.users.expire', 60);
        if (Carbon::parse($resetData->created_at)->addMinutes($expiry)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'OTP has expired.'
            ], 400);
        }

        if (!Hash::check($request->otp, $resetData->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP.'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully. You can now reset your password.'
        ], 200);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|numeric|digits:6',
            'password' => 'required|string|min:6',
        ]);

        $resetData = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetData || !Hash::check($request->otp, $resetData->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP.'
            ], 400);
        }

        // Check expiration again for safety
        $expiry = config('auth.passwords.users.expire', 60);
        if (Carbon::parse($resetData->created_at)->addMinutes($expiry)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'OTP has expired.'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $user = User::where('email', $request->email)->first();
            $user->update([
                'password' => Hash::make($request->password)
            ]);

            // Delete the token after successful reset
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            // Revoke all tokens to logout user from other devices
            $user->tokens()->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Password reset successful.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while resetting the password.'
            ], 500);
        }
    }
}
