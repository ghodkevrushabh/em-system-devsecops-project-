package com.ditiss.employeemanagement.service;

import com.ditiss.employeemanagement.dto.LoginDto;
import com.ditiss.employeemanagement.dto.RegisterDto;

public interface AuthService {
    String login(LoginDto loginDto);
    String register(RegisterDto registerDto);
}
