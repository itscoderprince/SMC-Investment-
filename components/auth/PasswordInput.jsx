"use client";

import * as React from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FormInput } from "./FormInput";

const PasswordInput = React.forwardRef(({ ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <FormInput
            ref={ref}
            type={showPassword ? "text" : "password"}
            rightIcon={
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                    ) : (
                        <Eye className="w-5 h-5" />
                    )}
                </button>
            }
            {...props}
        />
    );
});

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
