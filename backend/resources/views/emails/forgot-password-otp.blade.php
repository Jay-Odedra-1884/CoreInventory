<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Password Reset OTP</title>
</head>

<body style="font-family: Arial, sans-serif; background:#f5f7fb; padding:40px;">

    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:white;border-radius:8px;padding:30px;">

                    <tr>
                        <td style="text-align:center;">

                            <h2 style="color:#333;">Password Reset Request</h2>

                            <p style="color:#555;">
                                Hello <strong>{{ $user->name }}</strong>,
                            </p>

                            <p style="color:#555;">
                                We received a request to reset your password.
                                Use the OTP below to continue:
                            </p>

                            <div
                                style="margin:25px 0; font-size:28px; font-weight:bold; letter-spacing:6px; color:#2563eb;">
                                {{ $otp }}
                            </div>

                            <p style="color:#555;">
                                This OTP will expire in <strong>10 minutes</strong>.
                            </p>

                            <p style="color:#888; font-size:14px;">
                                If you didn't request this, you can safely ignore this email.
                            </p>

                            <hr style="margin:30px 0">

                            <p style="color:#aaa;font-size:12px;">
                                © {{ date('Y') }} Your App. All rights reserved.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>