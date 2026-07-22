package com.ditiss.employeemanagement.service.impl;

import com.ditiss.employeemanagement.dto.EmployeeDto;
import com.ditiss.employeemanagement.exception.ResourceNotFoundException;
import com.ditiss.employeemanagement.model.Employee;
import com.ditiss.employeemanagement.repository.EmployeeRepository;
import com.ditiss.employeemanagement.service.EmployeeService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private EmployeeRepository employeeRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public EmployeeDto createEmployee(EmployeeDto employeeDto) {
        Employee employee = mapToEntity(employeeDto);
        Employee newEmployee = employeeRepository.save(employee);
        return mapToDTO(newEmployee);
    }

    @Override
    public List<EmployeeDto> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        return employees.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public EmployeeDto getEmployeeById(Long empId) {
        Employee employee = employeeRepository.findById(empId).orElseThrow(
                () -> new ResourceNotFoundException("Employee", "id", empId));
        return mapToDTO(employee);
    }

    @Override
    public EmployeeDto updateEmployee(EmployeeDto employeeDto, Long empId) {
        Employee employee = employeeRepository.findById(empId).orElseThrow(
                () -> new ResourceNotFoundException("Employee", "id", empId));

        employee.setFirstName(employeeDto.getFirstName());
        employee.setLastName(employeeDto.getLastName());
        employee.setEmail(employeeDto.getEmail());
        employee.setPhone(employeeDto.getPhone());
        employee.setDepartment(employeeDto.getDepartment());
        employee.setDesignation(employeeDto.getDesignation());
        employee.setSalary(employeeDto.getSalary());
        employee.setJoiningDate(employeeDto.getJoiningDate());
        employee.setStatus(employeeDto.getStatus());

        Employee updatedEmployee = employeeRepository.save(employee);
        return mapToDTO(updatedEmployee);
    }

    @Override
    public void deleteEmployee(Long empId) {
        Employee employee = employeeRepository.findById(empId).orElseThrow(
                () -> new ResourceNotFoundException("Employee", "id", empId));
        employeeRepository.delete(employee);
    }

    // Helper method to convert Entity to DTO
    private EmployeeDto mapToDTO(Employee employee) {
        EmployeeDto employeeDto = new EmployeeDto();
        employeeDto.setEmpId(employee.getEmpId());
        employeeDto.setFirstName(employee.getFirstName());
        employeeDto.setLastName(employee.getLastName());
        employeeDto.setEmail(employee.getEmail());
        employeeDto.setPhone(employee.getPhone());
        employeeDto.setDepartment(employee.getDepartment());
        employeeDto.setDesignation(employee.getDesignation());
        employeeDto.setSalary(employee.getSalary());
        employeeDto.setJoiningDate(employee.getJoiningDate());
        employeeDto.setStatus(employee.getStatus());
        return employeeDto;
    }

    // Helper method to convert DTO to Entity
    private Employee mapToEntity(EmployeeDto employeeDto) {
        Employee employee = new Employee();
        employee.setFirstName(employeeDto.getFirstName());
        employee.setLastName(employeeDto.getLastName());
        employee.setEmail(employeeDto.getEmail());
        employee.setPhone(employeeDto.getPhone());
        employee.setDepartment(employeeDto.getDepartment());
        employee.setDesignation(employeeDto.getDesignation());
        employee.setSalary(employeeDto.getSalary());
        employee.setJoiningDate(employeeDto.getJoiningDate());
        employee.setStatus(employeeDto.getStatus());
        return employee;
    }
}
