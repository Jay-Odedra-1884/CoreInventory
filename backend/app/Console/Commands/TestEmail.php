<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test email to verify SMTP configuration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info("Sending test email to: $email");
        
        try {
            Mail::raw('This is a test email from CoreInventory. If you received this, email delivery is working!', function ($message) use ($email) {
                $message->to($email)
                    ->subject('CoreInventory - Test Email');
            });
            
            $this->info("\n✓ Email sent successfully!");
            $this->info("Check the $email inbox for the test email.\n");
        } catch (\Exception $e) {
            $this->error("\n✗ Failed to send email:");
            $this->error($e->getMessage());
            $this->error("\nCommon issues:");
            $this->error("1. Gmail App Password might be expired or invalid");
            $this->error("2. MAIL_FROM_ADDRESS must match MAIL_USERNAME");
            $this->error("3. QUEUE_CONNECTION should be 'sync' for testing");
            $this->error("4. Check .env file for proper SMTP settings\n");
        }
    }
}
