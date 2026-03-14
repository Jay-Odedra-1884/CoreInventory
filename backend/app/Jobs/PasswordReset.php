<?php

namespace App\Jobs;

use App\Mail\ForgotPasswordOtp;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class PasswordReset implements ShouldQueue
{
    use Queueable;

    public $user;
    public $otp;

    /**
     * Create a new job instance.
     */
    public function __construct(User $user, string $otp)
    {
        //
        $this->user = $user;
        $this->otp = $otp;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        //
        Mail::to($this->user->email)->send(new ForgotPasswordOtp($this->user, $this->otp));
    }
}
