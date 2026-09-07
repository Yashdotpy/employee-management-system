using EmployeeAPI.DTOs;
using EmployeeAPI.Models;

namespace EmployeeAPI.Repositories;

public interface IHolidayRepository
{
    List<Holiday> GetAll();
    void Add(HolidayCreateDto holiday);
    bool Delete(int id);
    bool IsHoliday(DateTime date);
}
