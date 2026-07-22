package com.ditiss.employeemanagement.service;

import com.ditiss.employeemanagement.dto.EmployeeDto;
import java.util.List;

public interface EmployeeService {
    EmployeeDto createEmployee(EmployeeDto employeeDto);
    EmployeeDto getEmployeeById(Long empId);
    List<EmployeeDto> getAllEmployees();
    EmployeeDto updateEmployee(EmployeeDto employeeDto, Long empId);
    void deleteEmployee(Long empId);
}
